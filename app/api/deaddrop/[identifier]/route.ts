import { NextRequest, NextResponse } from 'next/server';
import { deadDropStore } from '@/lib/security/dead-drops';
import { decodeData } from '@/lib/crypto/steganography';

/**
 * Get dead drop metadata (NO password required, NO file access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    const identifier = params.identifier;

    // Check if accessible
    const accessCheck = deadDropStore.isDropAccessible(identifier);

    if (!accessCheck.accessible) {
      return NextResponse.json(
        {
          error: 'Dead drop not accessible',
          reason: accessCheck.reason,
          status: accessCheck.drop?.status,
        },
        { status: 403 }
      );
    }

    const drop = accessCheck.drop!;

    // Calculate time remaining
    const timeRemaining = drop.expiresAt.getTime() - Date.now();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    // Return metadata only (NO cover image, NO encrypted data)
    return NextResponse.json({
      dropId: drop.dropId,
      codename: drop.codename,
      status: drop.status,
      createdAt: drop.createdAt.toISOString(),
      expiresAt: drop.expiresAt.toISOString(),
      timeRemaining: {
        milliseconds: timeRemaining,
        hours: hoursRemaining,
        minutes: minutesRemaining,
        formatted: `${hoursRemaining}h ${minutesRemaining}m`,
      },
      maxRetrievals: drop.maxRetrievals,
      retrievalCount: drop.retrievalCount,
      remaining: drop.maxRetrievals > 0 ? drop.maxRetrievals - drop.retrievalCount : 'unlimited',
      burnAfterReading: drop.burnAfterReading,
      passwordHint: drop.passwordHint,
      payloadSize: drop.payloadSize,
      originalFilename: drop.originalFilename,
      mimeType: drop.mimeType,
      tags: drop.tags,
      steganography: {
        technique: 'LSB (Least Significant Bit)',
        encrypted: drop.encrypted,
        coverImageType: drop.coverImageType,
      },
      warnings: generateWarnings(drop),
    });
  } catch (error) {
    console.error('Failed to get dead drop:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dead drop metadata' },
      { status: 500 }
    );
  }
}

/**
 * Retrieve dead drop file (requires password)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    const identifier = params.identifier;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 401 }
      );
    }

    // Get network info
    const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Attempt retrieval
    const result = deadDropStore.retrieveDrop(identifier, password, sourceIp, userAgent);

    if (!result.success || !result.drop) {
      return NextResponse.json(
        {
          error: 'Failed to retrieve dead drop',
          reason: result.reason,
        },
        { status: result.reason === 'Invalid password' ? 401 : 403 }
      );
    }

    const drop = result.drop;

    // Decode data from steganography
    console.log('Decoding hidden data from image...');

    try {
      const decryptedData = await decodeData(drop.coverImage, password);

      console.log(
        `✓ Dead drop retrieved: ${drop.codename} - ${decryptedData.length} bytes extracted`
      );

      // Check if burned
      const isBurned = drop.status === 'burned';

      if (isBurned) {
        console.log(`🔥 Dead drop burned: ${drop.codename}`);
      }

      // Return decrypted file
      return new NextResponse(decryptedData, {
        status: 200,
        headers: {
          'Content-Type': drop.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${drop.originalFilename || 'download'}"`,
          'Content-Length': decryptedData.length.toString(),
          'X-Dead-Drop-ID': drop.dropId,
          'X-Codename': drop.codename,
          'X-Retrieval-Count': drop.retrievalCount.toString(),
          'X-Max-Retrievals': drop.maxRetrievals.toString(),
          'X-Burned': isBurned ? 'true' : 'false',
          'X-Steganography': 'LSB',
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
      });
    } catch (decodeError) {
      console.error('Steganography decode error:', decodeError);
      return NextResponse.json(
        {
          error: 'Failed to decode hidden data',
          details: decodeError instanceof Error ? decodeError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Dead drop retrieval error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve dead drop',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate warnings for dead drop
 */
function generateWarnings(drop: any): string[] {
  const warnings: string[] = [];

  // Time warnings
  const timeRemaining = drop.expiresAt.getTime() - Date.now();
  const hoursRemaining = timeRemaining / (1000 * 60 * 60);

  if (hoursRemaining < 1) {
    warnings.push('⚠️ URGENT: Dead drop expires in less than 1 hour');
  } else if (hoursRemaining < 6) {
    warnings.push('🕐 WARNING: Dead drop expires soon');
  }

  // Retrieval warnings
  if (drop.maxRetrievals > 0) {
    const remaining = drop.maxRetrievals - drop.retrievalCount;
    if (remaining === 1) {
      warnings.push('🔥 LAST CHANCE: Only 1 retrieval remaining before burn');
    } else if (remaining <= 3) {
      warnings.push(`⚠️ LIMITED: Only ${remaining} retrievals remaining`);
    }
  }

  // Burn warning
  if (drop.burnAfterReading) {
    warnings.push('🔥 BURN AFTER READING: This dead drop will self-destruct after retrieval');
  }

  // Security reminder
  warnings.push('🕵️ OPSEC: Download from a secure, anonymous location');

  return warnings;
}
