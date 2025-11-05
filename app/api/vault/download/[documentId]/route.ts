import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  generateKyberKeyPair,
  generateDilithiumKeyPair,
  decryptWithKyber,
  verifyDilithiumSignature,
} from '@/lib/crypto/pqc';
import { documentStore } from '@/lib/vault/document-store';
import { canaryTokenStore } from '@/lib/security/canary-tokens';

// Use the same server keys from upload
let serverKeys: {
  kyber?: Awaited<ReturnType<typeof generateKyberKeyPair>>;
  dilithium?: Awaited<ReturnType<typeof generateDilithiumKeyPair>>;
} = {};

async function getServerKeys() {
  if (!serverKeys.kyber) {
    console.log('Generating server Kyber keypair...');
    serverKeys.kyber = await generateKyberKeyPair();
  }
  if (!serverKeys.dilithium) {
    console.log('Generating server Dilithium keypair...');
    serverKeys.dilithium = await generateDilithiumKeyPair();
  }
  return serverKeys;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const documentId = params.documentId;

    // Get document metadata
    const document = documentStore.getDocument(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check access permissions
    if (!documentStore.canAccess(documentId, userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get encrypted blob
    const blob = documentStore.getBlob(documentId);
    if (!blob) {
      return NextResponse.json(
        { error: 'Document data not found' },
        { status: 404 }
      );
    }

    // Verify Dilithium signature
    console.log(`Verifying Dilithium-3 signature for ${document.filename}...`);
    const encryptedBuffer = Buffer.concat([
      blob.metadata.ciphertext,
      blob.encryptedData,
      blob.metadata.iv,
      blob.metadata.authTag,
    ]);

    const signatureValid = await verifyDilithiumSignature(
      encryptedBuffer,
      document.signature
    );

    if (!signatureValid) {
      console.error('Signature verification failed!');
      return NextResponse.json(
        { error: 'Document signature verification failed - file may be tampered' },
        { status: 400 }
      );
    }

    console.log('Signature verified successfully ✓');

    // Get server keys
    const keys = await getServerKeys();

    // Decrypt with Kyber-768
    console.log(`Decrypting ${document.filename} with Kyber-768...`);
    const decryptedData = await decryptWithKyber(
      {
        ciphertext: blob.metadata.ciphertext,
        encryptedData: blob.encryptedData,
        iv: blob.metadata.iv,
        authTag: blob.metadata.authTag,
      },
      keys.kyber!.privateKey
    );

    console.log('Decryption successful ✓');

    // Check if canary token embedding is requested
    const searchParams = request.nextUrl.searchParams;
    const embedCanary = searchParams.get('embedCanary') === 'true';

    let finalData = decryptedData;
    let canaryTokenId: string | undefined;

    if (embedCanary) {
      // Generate canary token for this download
      const canaryToken = canaryTokenStore.generateToken(userId, {
        type: 'watermark',
        documentId,
        targetUserId: userId,
        label: `Download tracker: ${document.filename}`,
        description: `Tracks access to ${document.filename} downloaded by ${userId}`,
        tags: [document.classification, document.tlp, 'download-tracker'],
        alertOnFirstTrigger: true,
        alertOnEveryTrigger: false,
        payload: {
          filename: document.filename,
          downloadedAt: new Date().toISOString(),
          downloadedBy: userId,
        },
      });

      canaryTokenId = canaryToken.tokenId;

      // Also create web bug canary
      const webBugToken = canaryTokenStore.generateToken(userId, {
        type: 'web_bug',
        documentId,
        targetUserId: userId,
        label: `Web bug: ${document.filename}`,
        description: `Web tracking pixel for ${document.filename}`,
        tags: [document.classification, document.tlp, 'web-bug'],
        alertOnFirstTrigger: true,
        alertOnEveryTrigger: true,
      });

      console.log(
        `🕯️  Canary tokens embedded: watermark ${canaryTokenId}, web bug ${webBugToken.tokenId}`
      );

      // For text-based files, append hidden canary watermark
      if (
        document.mimeType.startsWith('text/') ||
        document.mimeType.includes('json') ||
        document.mimeType.includes('xml')
      ) {
        // Add invisible watermark as comment or metadata
        const watermark = Buffer.from(
          `\n<!-- Canary Token: ${canaryToken.tokenValue} -->\n` +
          `<!-- Web Bug: ${webBugToken.tokenValue} -->`,
          'utf-8'
        );
        finalData = Buffer.concat([decryptedData, watermark]);
      }

      // For HTML files, embed tracking pixel
      if (document.mimeType.includes('html')) {
        const trackingPixel = `<img src="https://swordintelligence.com${webBugToken.tokenValue}" width="1" height="1" style="display:none" />`;
        const htmlString = decryptedData.toString('utf-8');
        const modifiedHtml = htmlString.replace(
          '</body>',
          `${trackingPixel}</body>`
        );
        finalData = Buffer.from(modifiedHtml, 'utf-8');
      }
    }

    // Log access
    documentStore.logAccess(documentId, userId, 'download', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: embedCanary ? { canaryTokenId } : undefined,
    });

    // Return decrypted file
    return new NextResponse(finalData, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.filename}"`,
        'Content-Length': finalData.length.toString(),
        'X-Document-ID': documentId,
        'X-Classification': document.classification,
        'X-TLP': document.tlp,
        'X-Encrypted-At': document.encryptedAt.toISOString(),
        'X-Signature-Verified': 'true',
        'X-Encryption-Algorithm': 'Kyber-768',
        'X-Signature-Algorithm': 'Dilithium-3',
        'X-Canary-Embedded': embedCanary ? 'true' : 'false',
        'X-Canary-Token-ID': canaryTokenId || '',
      },
    });
  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      {
        error: 'Failed to download document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
