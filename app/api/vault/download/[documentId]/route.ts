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

    // Log access
    documentStore.logAccess(documentId, userId, 'download', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Return decrypted file
    return new NextResponse(decryptedData, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.filename}"`,
        'Content-Length': decryptedData.length.toString(),
        'X-Document-ID': documentId,
        'X-Classification': document.classification,
        'X-TLP': document.tlp,
        'X-Encrypted-At': document.encryptedAt.toISOString(),
        'X-Signature-Verified': 'true',
        'X-Encryption-Algorithm': 'Kyber-768',
        'X-Signature-Algorithm': 'Dilithium-3',
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
