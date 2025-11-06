import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { documentStore } from '@/lib/vault/document-store';
import { versionStore } from '@/lib/vault/document-versions';
import { decryptWithKyber, generateKyberKeyPair } from '@/lib/crypto/pqc';

// Server keys (shared)
let serverKeys: {
  kyber?: Awaited<ReturnType<typeof generateKyberKeyPair>>;
} = {};

async function getServerKeys() {
  if (!serverKeys.kyber) {
    serverKeys.kyber = await generateKyberKeyPair();
  }
  return serverKeys;
}

/**
 * Simple text diff generator
 */
function generateTextDiff(text1: string, text2: string) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');

  const added: number[] = [];
  const removed: number[] = [];
  const modified: number[] = [];

  // Simple line-by-line comparison
  const maxLines = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];

    if (line1 === undefined && line2 !== undefined) {
      added.push(i + 1);
    } else if (line1 !== undefined && line2 === undefined) {
      removed.push(i + 1);
    } else if (line1 !== line2) {
      modified.push(i + 1);
    }
  }

  return {
    added: added.length,
    removed: removed.length,
    modified: modified.length,
    totalChanges: added.length + removed.length + modified.length,
    addedLines: added,
    removedLines: removed,
    modifiedLines: modified,
  };
}

/**
 * Compare two versions of a document
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await request.json();

    const { documentId, fromVersion, toVersion } = body;

    if (!documentId || fromVersion === undefined || toVersion === undefined) {
      return NextResponse.json(
        { error: 'Document ID, fromVersion, and toVersion are required' },
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

    // Get versions
    const version1 = versionStore.getVersionByNumber(documentId, fromVersion);
    const version2 = versionStore.getVersionByNumber(documentId, toVersion);

    if (!version1 || !version2) {
      return NextResponse.json(
        { error: 'One or both versions not found' },
        { status: 404 }
      );
    }

    // Get metadata diff from store
    const metadataDiff = versionStore.compareVersions(
      version1.versionId,
      version2.versionId
    );

    if (!metadataDiff) {
      return NextResponse.json(
        { error: 'Failed to compare versions' },
        { status: 500 }
      );
    }

    // Decrypt both versions for content comparison (if text-based)
    const keys = await getServerKeys();

    console.log(
      `Decrypting versions ${fromVersion} and ${toVersion} for diff...`
    );

    const [data1, data2] = await Promise.all([
      decryptWithKyber(
        {
          ciphertext: version1.ciphertext,
          encryptedData: version1.encryptedData,
          iv: version1.iv,
          authTag: version1.authTag,
        },
        keys.kyber!.privateKey
      ),
      decryptWithKyber(
        {
          ciphertext: version2.ciphertext,
          encryptedData: version2.encryptedData,
          iv: version2.iv,
          authTag: version2.authTag,
        },
        keys.kyber!.privateKey
      ),
    ]);

    // Check if content is text-based
    const isText = (mimeType: string) => {
      return (
        mimeType.startsWith('text/') ||
        mimeType.includes('json') ||
        mimeType.includes('xml') ||
        mimeType.includes('javascript') ||
        mimeType.includes('typescript')
      );
    };

    let contentDiff;
    if (isText(version1.mimeType) && isText(version2.mimeType)) {
      // Generate text diff
      const text1 = data1.toString('utf-8');
      const text2 = data2.toString('utf-8');

      contentDiff = generateTextDiff(text1, text2);
    } else {
      // Binary comparison
      contentDiff = {
        binaryComparison: true,
        identical: data1.equals(data2),
        size1: data1.length,
        size2: data2.length,
        sizeChange: data2.length - data1.length,
      };
    }

    // Log access
    documentStore.logAccess(documentId, userId, 'view', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: {
        action: 'diff',
        fromVersion,
        toVersion,
      },
    });

    return NextResponse.json({
      documentId,
      filename: document.filename,
      comparison: {
        fromVersion: {
          number: version1.versionNumber,
          versionId: version1.versionId,
          filename: version1.filename,
          fileSize: version1.fileSize,
          contentHash: version1.contentHash.substring(0, 16) + '...',
          status: version1.status,
          createdAt: version1.createdAt.toISOString(),
          createdBy: version1.createdBy,
          comment: version1.comment,
        },
        toVersion: {
          number: version2.versionNumber,
          versionId: version2.versionId,
          filename: version2.filename,
          fileSize: version2.fileSize,
          contentHash: version2.contentHash.substring(0, 16) + '...',
          status: version2.status,
          createdAt: version2.createdAt.toISOString(),
          createdBy: version2.createdBy,
          comment: version2.comment,
        },
        metadata: {
          sizeChange: metadataDiff.sizeChange,
          sizeChangeFormatted:
            metadataDiff.sizeChange > 0
              ? `+${(metadataDiff.sizeChange / 1024).toFixed(2)} KB`
              : `${(metadataDiff.sizeChange / 1024).toFixed(2)} KB`,
          hashesMatch: metadataDiff.fromHash === metadataDiff.toHash,
          fromHash: metadataDiff.fromHash.substring(0, 16) + '...',
          toHash: metadataDiff.toHash.substring(0, 16) + '...',
        },
        contentDiff,
      },
    });
  } catch (error) {
    console.error('Version diff error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate diff',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
