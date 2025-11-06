import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { documentStore } from '@/lib/vault/document-store';
import { versionStore } from '@/lib/vault/document-versions';
import { verifyDilithiumSignature } from '@/lib/crypto/pqc';
import { decryptWithKyber, generateKyberKeyPair, generateDilithiumKeyPair } from '@/lib/crypto/pqc';

// Server keys (shared)
let serverKeys: {
  kyber?: Awaited<ReturnType<typeof generateKyberKeyPair>>;
  dilithium?: Awaited<ReturnType<typeof generateDilithiumKeyPair>>;
} = {};

async function getServerKeys() {
  if (!serverKeys.kyber) {
    serverKeys.kyber = await generateKyberKeyPair();
  }
  if (!serverKeys.dilithium) {
    serverKeys.dilithium = await generateDilithiumKeyPair();
  }
  return serverKeys;
}

/**
 * Get version history for a document
 */
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
    const searchParams = request.nextUrl.searchParams;
    const verifyChain = searchParams.get('verifyChain') === 'true';

    // Get parent document
    const document = documentStore.getDocument(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check permissions
    if (!documentStore.canAccess(documentId, userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get version history (metadata only, no encrypted data)
    const history = versionStore.getVersionHistory(documentId);

    // Optionally verify entire chain-of-custody
    let chainVerification;
    if (verifyChain) {
      console.log(`Verifying chain-of-custody for document ${documentId}...`);

      chainVerification = await versionStore.verifyChain(
        documentId,
        async (chainHash: string, signature) => {
          // Verify Dilithium signature
          const chainHashBuffer = Buffer.from(chainHash, 'hex');
          return await verifyDilithiumSignature(chainHashBuffer, signature);
        }
      );

      console.log(
        chainVerification.valid
          ? `✓ Chain verified: ${chainVerification.verifiedVersions}/${chainVerification.totalVersions} versions`
          : `✗ Chain broken: ${chainVerification.brokenLinks.length} breaks, ${chainVerification.signatureFailures.length} signature failures`
      );
    }

    // Get statistics
    const stats = versionStore.getStats();

    return NextResponse.json({
      documentId,
      filename: document.filename,
      totalVersions: history.length,
      versions: history.map(v => ({
        versionId: v.versionId,
        versionNumber: v.versionNumber,
        filename: v.filename,
        fileSize: v.fileSize,
        mimeType: v.mimeType,
        contentHash: v.contentHash.substring(0, 16) + '...',
        previousVersionHash: v.previousVersionHash
          ? v.previousVersionHash.substring(0, 16) + '...'
          : null,
        chainHash: v.chainHash.substring(0, 16) + '...',
        status: v.status,
        createdAt: v.createdAt.toISOString(),
        createdBy: v.createdBy,
        comment: v.comment,
        tags: v.tags,
        changedBy: v.changedBy,
        changeReason: v.changeReason,
      })),
      chainVerification,
      stats: {
        totalDocuments: stats.totalDocuments,
        totalVersions: stats.totalVersions,
        averageVersionsPerDocument: stats.averageVersionsPerDocument.toFixed(2),
        versionsByStatus: stats.versionsByStatus,
      },
    });
  } catch (error) {
    console.error('Failed to get version history:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve version history' },
      { status: 500 }
    );
  }
}

/**
 * Download a specific version
 */
export async function POST(
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
    const body = await request.json();
    const { versionNumber } = body;

    if (!versionNumber) {
      return NextResponse.json(
        { error: 'Version number required' },
        { status: 400 }
      );
    }

    // Get parent document
    const document = documentStore.getDocument(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check permissions
    if (!documentStore.canAccess(documentId, userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get specific version
    const version = versionStore.getVersionByNumber(documentId, versionNumber);
    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Verify chain hash signature
    console.log(
      `Verifying Dilithium-3 signature for version ${versionNumber}...`
    );
    const chainHashBuffer = Buffer.from(version.chainHash, 'hex');
    const signatureValid = await verifyDilithiumSignature(
      chainHashBuffer,
      version.signature
    );

    if (!signatureValid) {
      console.error('Version signature verification failed!');
      return NextResponse.json(
        {
          error: 'Version signature verification failed - chain-of-custody may be broken',
        },
        { status: 400 }
      );
    }

    console.log('Signature verified successfully ✓');

    // Get server keys
    const keys = await getServerKeys();

    // Decrypt with Kyber-768
    console.log(
      `Decrypting version ${versionNumber} (${version.filename}) with Kyber-768...`
    );
    const decryptedData = await decryptWithKyber(
      {
        ciphertext: version.ciphertext,
        encryptedData: version.encryptedData,
        iv: version.iv,
        authTag: version.authTag,
      },
      keys.kyber!.privateKey
    );

    // Verify content hash
    const crypto = require('crypto');
    const calculatedHash = crypto
      .createHash('sha256')
      .update(decryptedData)
      .digest('hex');

    if (calculatedHash !== version.contentHash) {
      console.error('Content hash mismatch!');
      return NextResponse.json(
        {
          error: 'Content integrity check failed - file may be corrupted',
        },
        { status: 400 }
      );
    }

    console.log('Decryption and integrity check successful ✓');

    // Log access
    documentStore.logAccess(documentId, userId, 'download', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: { versionNumber },
    });

    // Return decrypted version
    return new NextResponse(decryptedData, {
      headers: {
        'Content-Type': version.mimeType,
        'Content-Disposition': `attachment; filename="${version.filename}"`,
        'Content-Length': decryptedData.length.toString(),
        'X-Document-ID': documentId,
        'X-Version-ID': version.versionId,
        'X-Version-Number': version.versionNumber.toString(),
        'X-Version-Status': version.status,
        'X-Content-Hash': version.contentHash,
        'X-Chain-Hash': version.chainHash,
        'X-Created-At': version.createdAt.toISOString(),
        'X-Created-By': version.createdBy,
        'X-Signature-Verified': 'true',
        'X-Encryption-Algorithm': 'Kyber-768',
        'X-Signature-Algorithm': 'Dilithium-3',
      },
    });
  } catch (error) {
    console.error('Version download error:', error);
    return NextResponse.json(
      {
        error: 'Failed to download version',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
