import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  generateKyberKeyPair,
  generateDilithiumKeyPair,
  encryptWithKyber,
  signWithDilithium,
  hashData,
  generateFileId,
  toBase64Url,
} from '@/lib/crypto/pqc';
import { documentStore } from '@/lib/vault/document-store';
import type { Classification, TLP } from '@/lib/vault/document-store';

// In production, these would be stored securely (HSM, KMS, etc.)
// For demo, we'll generate them on first use
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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const classification = (formData.get('classification') || 'UNCLASSIFIED') as Classification;
    const tlp = (formData.get('tlp') || 'AMBER') as TLP;
    const tags = formData.get('tags')?.toString().split(',').map(t => t.trim()) || [];
    const engagementId = formData.get('engagementId')?.toString();
    const expiresInDays = formData.get('expiresInDays')?.toString();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const fileData = Buffer.from(arrayBuffer);

    // Generate unique document ID
    const documentId = generateFileId();

    // Get server keys
    const keys = await getServerKeys();

    // Encrypt file with Kyber-768
    console.log(`Encrypting ${file.name} (${fileData.length} bytes) with Kyber-768...`);
    const encrypted = await encryptWithKyber(fileData, keys.kyber!.publicKey);

    // Calculate hash of original file
    const fileHash = hashData(fileData);

    // Sign encrypted data with Dilithium-3
    console.log('Signing with Dilithium-3...');
    const encryptedBuffer = Buffer.concat([
      Buffer.from(encrypted.ciphertext),
      Buffer.from(encrypted.encryptedData),
      Buffer.from(encrypted.iv),
      Buffer.from(encrypted.authTag),
    ]);
    const signature = await signWithDilithium(
      encryptedBuffer,
      keys.dilithium!.privateKey,
      keys.dilithium!.publicKey
    );

    // Calculate encrypted size
    const encryptedSize =
      encrypted.ciphertext.length +
      encrypted.encryptedData.length +
      encrypted.iv.length +
      encrypted.authTag.length;

    // Calculate expiration date
    let expiresAt: Date | undefined;
    if (expiresInDays) {
      const days = parseInt(expiresInDays, 10);
      if (!isNaN(days) && days > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }
    }

    // Store document metadata
    documentStore.addDocument({
      id: documentId,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: fileData.length,
      encryptionMode: 'kyber',
      encryptedSize,
      encryptedAt: new Date(),
      encryptedBy: userId,
      keyFingerprint: hashData(Buffer.from(keys.kyber!.publicKey)).substring(0, 16),
      classification,
      tlp,
      signature,
      storageKey: `vault/${documentId}`,
      sha256Hash: fileHash,
      ownerId: userId,
      allowedUsers: [userId], // Initially only owner has access
      expiresAt,
      accessLog: [],
      uploadedAt: new Date(),
      engagementId,
      tags,
    });

    // Store encrypted blob
    documentStore.addBlob({
      documentId,
      encryptedData: Buffer.from(encrypted.encryptedData),
      metadata: {
        ciphertext: Buffer.from(encrypted.ciphertext),
        iv: Buffer.from(encrypted.iv),
        authTag: Buffer.from(encrypted.authTag),
      },
    });

    // Log upload action
    documentStore.logAccess(documentId, userId, 'modify', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    console.log(`Document ${documentId} uploaded and encrypted successfully`);

    return NextResponse.json({
      success: true,
      documentId,
      filename: file.name,
      size: fileData.length,
      encryptedSize,
      compressionRatio: encryptedSize / fileData.length,
      classification,
      tlp,
      sha256: fileHash,
      encryptedAt: new Date().toISOString(),
      signature: {
        algorithm: signature.algorithm,
        publicKey: toBase64Url(signature.publicKey),
        timestamp: signature.timestamp,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Get server public keys for client-side encryption (optional)
export async function GET() {
  try {
    const keys = await getServerKeys();

    return NextResponse.json({
      kyberPublicKey: toBase64Url(keys.kyber!.publicKey),
      dilithiumPublicKey: toBase64Url(keys.dilithium!.publicKey),
      algorithms: {
        encryption: 'Kyber-768',
        signature: 'Dilithium-3',
      },
      securityLevel: 'NIST Level 3 (equivalent to AES-192)',
    });
  } catch (error) {
    console.error('Failed to get server keys:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve public keys' },
      { status: 500 }
    );
  }
}
