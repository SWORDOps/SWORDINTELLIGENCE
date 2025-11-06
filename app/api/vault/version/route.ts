import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  generateKyberKeyPair,
  generateDilithiumKeyPair,
  encryptWithKyber,
  signWithDilithium,
} from '@/lib/crypto/pqc';
import { documentStore } from '@/lib/vault/document-store';
import { versionStore, VersionStatus, DocumentVersion } from '@/lib/vault/document-versions';
import crypto from 'crypto';

// Server keys (shared with upload endpoint)
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

/**
 * Upload a new version of an existing document
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const formData = await request.formData();

    // Get parameters
    const documentId = formData.get('documentId') as string;
    const file = formData.get('file') as File;
    const status = (formData.get('status') as VersionStatus) || 'DRAFT';
    const comment = formData.get('comment') as string | null;
    const changeReason = formData.get('changeReason') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!documentId || !file) {
      return NextResponse.json(
        { error: 'Document ID and file are required' },
        { status: 400 }
      );
    }

    // Get parent document
    const parentDocument = documentStore.getDocument(documentId);
    if (!parentDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check permissions
    if (!documentStore.canAccess(documentId, userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const fileData = Buffer.from(arrayBuffer);

    console.log(`Creating new version for ${file.name} (${fileData.length} bytes)...`);

    // Calculate content hash (hash of decrypted content)
    const contentHash = crypto.createHash('sha256').update(fileData).digest('hex');

    // Get previous version to calculate chain
    const existingVersions = versionStore.getDocumentVersions(documentId);
    const versionNumber = existingVersions.length + 1;
    const previousVersion = versionNumber > 1
      ? versionStore.getVersion(existingVersions[existingVersions.length - 1])
      : undefined;

    // Calculate chain hash
    let chainHash: string;
    let previousVersionHash: string | undefined;

    if (previousVersion) {
      // Subsequent version: chainHash = hash(contentHash + previousVersionHash)
      previousVersionHash = previousVersion.contentHash;
      chainHash = crypto
        .createHash('sha256')
        .update(contentHash)
        .update(previousVersionHash)
        .digest('hex');
    } else {
      // First version: chainHash = hash(contentHash)
      chainHash = crypto
        .createHash('sha256')
        .update(contentHash)
        .digest('hex');
    }

    console.log(`Version ${versionNumber} chain hash: ${chainHash.substring(0, 16)}...`);

    // Get server keys
    const keys = await getServerKeys();

    // Encrypt with Kyber-768 (same as parent document)
    console.log(`Encrypting version ${versionNumber} with Kyber-768...`);
    const encrypted = await encryptWithKyber(fileData, keys.kyber!.publicKey);

    // Sign chainHash with Dilithium-3
    console.log(`Signing version ${versionNumber} with Dilithium-3...`);
    const chainHashBuffer = Buffer.from(chainHash, 'hex');
    const signature = await signWithDilithium(
      chainHashBuffer,
      keys.dilithium!.privateKey,
      keys.dilithium!.publicKey
    );

    // Create version record
    const versionId = crypto.randomUUID();
    const version: DocumentVersion = {
      versionId,
      documentId,
      versionNumber,
      filename: file.name,
      fileSize: fileData.length,
      mimeType: file.type || 'application/octet-stream',

      // Cryptographic chain
      contentHash,
      previousVersionHash,
      chainHash,
      signature,

      // Metadata
      status,
      createdAt: new Date(),
      createdBy: userId,
      comment: comment || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],

      // Change tracking
      changedBy: userId,
      changeReason: changeReason || undefined,

      // Encrypted storage
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      ciphertext: encrypted.ciphertext,
    };

    // Add to version store (validates chain integrity)
    versionStore.addVersion(version);

    // Log access
    documentStore.logAccess(documentId, userId, 'version', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: { versionNumber, status, comment },
    });

    console.log(
      `✓ Version ${versionNumber} created successfully ` +
      `(${fileData.length} bytes, chainHash: ${chainHash.substring(0, 8)}...)`
    );

    return NextResponse.json({
      success: true,
      versionId,
      versionNumber,
      documentId,
      contentHash: contentHash.substring(0, 16) + '...',
      chainHash: chainHash.substring(0, 16) + '...',
      previousVersionHash: previousVersionHash
        ? previousVersionHash.substring(0, 16) + '...'
        : null,
      status,
      createdAt: version.createdAt.toISOString(),
      signature: {
        algorithm: 'Dilithium-3',
        length: signature.value.length,
      },
      encryption: {
        algorithm: 'Kyber-768',
        mode: 'AES-256-GCM',
      },
    });
  } catch (error) {
    console.error('Version upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create version',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Update version status
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await request.json();

    const { versionId, status } = body;

    if (!versionId || !status) {
      return NextResponse.json(
        { error: 'Version ID and status are required' },
        { status: 400 }
      );
    }

    // Get version
    const version = versionStore.getVersion(versionId);
    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Check permissions on parent document
    if (!documentStore.canAccess(version.documentId, userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update status
    const success = versionStore.updateVersionStatus(versionId, status, userId);

    return NextResponse.json({
      success,
      versionId,
      versionNumber: version.versionNumber,
      status,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Version status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update version status' },
      { status: 500 }
    );
  }
}
