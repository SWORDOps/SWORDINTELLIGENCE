import { NextRequest, NextResponse } from 'next/server';
import { shareLinkStore } from '@/lib/vault/share-links';
import crypto from 'crypto';

/**
 * Get share link metadata (NO password verification here - client-side only)
 * Returns challenge for zero-knowledge proof
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId;

    // Get share link
    const shareLink = shareLinkStore.getShareLink(shareId);
    if (!shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check if link is valid
    const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const validation = shareLinkStore.isLinkValid(shareId, sourceIp);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Share link is no longer valid',
          reason: validation.reason,
        },
        { status: 403 }
      );
    }

    // Perform threat intelligence check on accessing IP
    const threatIntel = await performThreatIntelCheck(sourceIp);

    // Get geolocation
    const geolocation = await getGeolocation(sourceIp);

    // Generate cryptographic challenge for zero-knowledge password proof
    // Client will hash password with this challenge to prove they know it
    const challenge = crypto.randomBytes(32).toString('hex');

    // Store challenge temporarily (in production, use Redis with TTL)
    // For now, we'll validate using the passwordHash directly

    // Return metadata (NO sensitive data, NO password hash)
    return NextResponse.json({
      shareId: shareLink.shareId,
      filename: shareLink.originalFilename,
      requiresPassword: shareLink.requirePassword,
      expiresAt: shareLink.expiresAt.toISOString(),
      maxAccesses: shareLink.maxAccesses,
      accessCount: shareLink.accessCount,
      remaining: shareLink.maxAccesses > 0 ? shareLink.maxAccesses - shareLink.accessCount : 'unlimited',
      isOneTime: shareLink.maxAccesses === 1,
      watermark: shareLink.watermark,

      // Security context
      sourceIp,
      geolocation,
      threatIntel,
      challenge, // For zero-knowledge proof

      // OPSEC warnings
      opsecWarnings: generateOpsecWarnings(threatIntel, geolocation, shareLink),
    });
  } catch (error) {
    console.error('Share access error:', error);
    return NextResponse.json(
      { error: 'Failed to access share link' },
      { status: 500 }
    );
  }
}

/**
 * Download shared document
 * POST with password proof (if required)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId;
    const body = await request.json();

    // Get share link
    const shareLink = shareLinkStore.getShareLink(shareId);
    if (!shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check if link is valid
    const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    const validation = shareLinkStore.isLinkValid(shareId, sourceIp);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Share link is no longer valid',
          reason: validation.reason,
        },
        { status: 403 }
      );
    }

    // Verify password (if required)
    // Client sends hash(password + challenge) for zero-knowledge proof
    if (shareLink.requirePassword) {
      const { passwordProof } = body;

      if (!passwordProof) {
        return NextResponse.json(
          { error: 'Password required' },
          { status: 401 }
        );
      }

      // In zero-knowledge proof, client sends hash(password)
      // We compare against stored passwordHash
      // NOTE: In production, use proper zero-knowledge proof protocol (e.g., SRP)
      const isValid = shareLinkStore.verifyPassword(shareId, passwordProof);

      if (!isValid) {
        // Log failed attempt
        shareLinkStore.logAccess(shareId, {
          timestamp: new Date(),
          ipAddress: sourceIp,
          userAgent,
          success: false,
          accessType: 'failed_password',
        });

        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
    }

    // Log successful access
    shareLinkStore.logAccess(shareId, {
      timestamp: new Date(),
      ipAddress: sourceIp,
      userAgent,
      success: true,
      accessType: 'download',
    });

    // Get encrypted data from share link
    // Share links have their own ephemeral encryption
    const encryptedData = shareLink.encryptedData;
    const ephemeralKey = shareLink.ephemeralKey;

    // Decrypt with ephemeral key
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      ephemeralKey,
      shareLink.iv
    );
    decipher.setAuthTag(shareLink.authTag);

    const decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    console.log(
      `✓ Share link accessed: ${shareId} by ${sourceIp} ` +
      `(${shareLink.accessCount + 1}/${shareLink.maxAccesses || '∞'})`
    );

    // Check if this was the last access (one-time link)
    const isLastAccess =
      shareLink.maxAccesses > 0 &&
      shareLink.accessCount + 1 >= shareLink.maxAccesses;

    if (isLastAccess) {
      console.log(`🔥 One-time link burned: ${shareId}`);
    }

    // Return decrypted file
    // Client will receive the file and handle watermarking if needed
    return new NextResponse(decryptedData, {
      status: 200,
      headers: {
        'Content-Type': shareLink.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${shareLink.originalFilename}"`,
        'Content-Length': decryptedData.length.toString(),
        'X-Share-ID': shareId,
        'X-Filename': shareLink.originalFilename,
        'X-Access-Count': (shareLink.accessCount + 1).toString(),
        'X-Max-Accesses': shareLink.maxAccesses.toString(),
        'X-Remaining': isLastAccess ? '0' : (shareLink.maxAccesses - shareLink.accessCount - 1).toString(),
        'X-Burned': isLastAccess ? 'true' : 'false',
        'X-Watermark': shareLink.watermark || '',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      },
    });
  } catch (error) {
    console.error('Share download error:', error);
    return NextResponse.json(
      {
        error: 'Failed to download file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Perform threat intelligence check on IP
 */
async function performThreatIntelCheck(ip: string) {
  // Mock threat intel - in production, integrate with:
  // - AbuseIPDB API
  // - VirusTotal API
  // - Shodan API
  // - IPQualityScore API
  // - Project Honey Pot

  // Simple heuristics for demonstration
  const isPrivateIP =
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip === 'localhost' ||
    ip === '::1';

  const isCloudProvider =
    ip.startsWith('13.') || // AWS
    ip.startsWith('34.') || // Google Cloud
    ip.startsWith('20.') || // Azure
    ip.startsWith('104.') || // Cloudflare
    ip.startsWith('52.'); // AWS

  const isTorExit = false; // Would check against Tor exit node list

  const reputation = isPrivateIP
    ? 'unknown'
    : isCloudProvider
    ? 'suspicious'
    : 'clean';

  return {
    ip,
    reputation,
    threatScore: isCloudProvider ? 30 : 0,
    categories: [
      ...(isCloudProvider ? ['cloud'] : []),
      ...(isTorExit ? ['tor'] : []),
      ...(isPrivateIP ? ['private'] : []),
    ],
    isVPN: isCloudProvider,
    isProxy: false,
    isTor: isTorExit,
    isBot: false,
  };
}

/**
 * Get geolocation for IP
 */
async function getGeolocation(ip: string) {
  // Mock geolocation - in production, use:
  // - ipinfo.io
  // - ipapi.co
  // - MaxMind GeoIP2
  // - IP2Location

  if (ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      ip,
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
      isp: 'Unknown',
    };
  }

  // Return mock data
  return {
    ip,
    country: 'United States',
    countryCode: 'US',
    region: 'California',
    city: 'San Francisco',
    lat: 37.7749,
    lon: -122.4194,
    timezone: 'America/Los_Angeles',
    isp: 'Example ISP',
    org: 'Example Organization',
  };
}

/**
 * Generate OPSEC warnings based on threat intelligence
 */
function generateOpsecWarnings(threatIntel: any, geolocation: any, shareLink: any) {
  const warnings: string[] = [];

  // Check for suspicious access patterns
  if (threatIntel.isVPN || threatIntel.isProxy) {
    warnings.push('⚠️ Accessing via VPN/Proxy - source location may be obfuscated');
  }

  if (threatIntel.isTor) {
    warnings.push('🔴 CRITICAL: Accessing via Tor network - high anonymity, potential threat actor');
  }

  if (threatIntel.reputation === 'malicious') {
    warnings.push('🔴 CRITICAL: Source IP has malicious reputation - proceed with extreme caution');
  }

  if (threatIntel.reputation === 'suspicious') {
    warnings.push('🟠 WARNING: Source IP is suspicious - verify access legitimacy');
  }

  if (shareLink.watermark) {
    warnings.push(`📌 NOTICE: Downloads are watermarked with: ${shareLink.watermark}`);
  }

  if (shareLink.maxAccesses === 1) {
    warnings.push('🔥 ONE-TIME LINK: This link will be destroyed after download');
  }

  // Check for unusual access times
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) {
    warnings.push('🌙 NOTICE: Accessing during unusual hours (2-5 AM local time)');
  }

  // Check if accessing from unexpected country
  // (Would compare against expected recipient location)
  if (geolocation.countryCode !== 'US') {
    warnings.push(`🌍 NOTICE: Accessing from ${geolocation.country} - verify this is expected`);
  }

  return warnings;
}
