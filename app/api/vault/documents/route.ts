import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { documentStore } from '@/lib/vault/document-store';
import { toBase64Url } from '@/lib/crypto/pqc';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const searchParams = request.nextUrl.searchParams;

    // Get filter parameters
    const classification = searchParams.get('classification');
    const tlp = searchParams.get('tlp');
    const engagementId = searchParams.get('engagement');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    // Get documents based on filters
    let documents = documentStore.getUserDocuments(userId);

    if (classification) {
      documents = documents.filter(doc => doc.classification === classification);
    }

    if (tlp) {
      documents = documents.filter(doc => doc.tlp === tlp);
    }

    if (engagementId) {
      documents = documents.filter(doc => doc.engagementId === engagementId);
    }

    if (tags && tags.length > 0) {
      documents = documents.filter(doc =>
        tags.some(tag => doc.tags.includes(tag))
      );
    }

    // Map to safe response format (don't expose encryption keys)
    const response = documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      encryptedSize: doc.encryptedSize,
      compressionRatio: doc.encryptedSize / doc.size,
      classification: doc.classification,
      tlp: doc.tlp,
      caveats: doc.caveats,
      tags: doc.tags,
      uploadedAt: doc.uploadedAt.toISOString(),
      encryptedAt: doc.encryptedAt.toISOString(),
      lastAccessedAt: doc.lastAccessedAt?.toISOString(),
      expiresAt: doc.expiresAt?.toISOString(),
      engagementId: doc.engagementId,
      isOwner: doc.ownerId === userId,
      accessCount: doc.accessLog.length,
      signature: {
        algorithm: doc.signature.algorithm,
        timestamp: doc.signature.timestamp,
        publicKeyFingerprint: toBase64Url(doc.signature.publicKey).substring(0, 16),
      },
    }));

    return NextResponse.json({
      documents: response,
      total: response.length,
      stats: documentStore.getStats(),
    });
  } catch (error) {
    console.error('Failed to list documents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
}
