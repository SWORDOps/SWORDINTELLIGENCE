import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { documentStore } from '@/lib/vault/document-store';
import { shareLinkStore } from '@/lib/vault/share-links';
import crypto from 'crypto';

/**
 * Create a secure share link for a document
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

    const {
      documentId,
      expiresIn = 86400, // Default 24 hours
      maxAccesses = 1, // Default: one-time link
      password,
      allowedIPs,
      watermark,
      recipientInfo,
    } = body;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Get document
    const document = documentStore.getDocument(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check permissions
    if (!documentStore.canAccess(documentId, userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get encrypted blob
    const blob = documentStore.getBlob(documentId);
    if (!blob) {
      return NextResponse.json({ error: 'Document data not found' }, { status: 404 });
    }

    // Generate ephemeral encryption key for this share
    // This allows us to encrypt the document specifically for this share link
    const ephemeralKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    // Re-encrypt document with ephemeral key
    // In production, you'd decrypt with Kyber first, then re-encrypt
    // For demo, we'll use the existing encrypted data
    const cipher = crypto.createCipheriv('aes-256-gcm', ephemeralKey, iv);
    const encryptedData = Buffer.concat([
      cipher.update(blob.encryptedData),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Create share link
    const shareLink = shareLinkStore.createShareLink({
      documentId,
      createdBy: userId,
      expiresIn,
      maxAccesses,
      password,
      allowedIPs,
      watermark,
      recipientInfo,
      encryptedData,
      ephemeralKey,
      iv,
      authTag,
      originalFilename: document.filename,
      mimeType: document.mimeType,
      fileSize: document.size,
    });

    // Log share creation
    documentStore.logAccess(documentId, userId, 'share', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Generate QR code data URL (simple implementation)
    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/s/${shareLink.shareId}`;

    return NextResponse.json({
      success: true,
      shareId: shareLink.shareId,
      url: shareUrl,
      expiresAt: shareLink.expiresAt.toISOString(),
      expiresIn: shareLink.expiresIn,
      maxAccesses: shareLink.maxAccesses,
      requiresPassword: shareLink.requirePassword,
      metadata: {
        filename: document.filename,
        size: document.size,
        classification: document.classification,
        tlp: document.tlp,
      },
    });
  } catch (error) {
    console.error('Share link creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create share link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get share links for current user or specific document
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');

    let shares;
    if (documentId) {
      // Get shares for specific document
      const document = documentStore.getDocument(documentId);
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      if (!documentStore.canAccess(documentId, userId)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      shares = shareLinkStore.getDocumentShares(documentId);
    } else {
      // Get all shares created by user
      shares = shareLinkStore.getUserShares(userId);
    }

    // Map to safe response (don't expose encryption keys)
    const response = shares.map(share => ({
      shareId: share.shareId,
      documentId: share.documentId,
      filename: share.originalFilename,
      createdAt: share.createdAt.toISOString(),
      expiresAt: share.expiresAt.toISOString(),
      maxAccesses: share.maxAccesses,
      accessCount: share.accessCount,
      requiresPassword: share.requirePassword,
      isRevoked: share.isRevoked,
      revokedAt: share.revokedAt?.toISOString(),
      recipientInfo: share.recipientInfo,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/s/${share.shareId}`,
      accessLog: share.accessLog.map(log => ({
        timestamp: log.timestamp.toISOString(),
        ipAddress: log.ipAddress,
        success: log.success,
        failureReason: log.failureReason,
      })),
    }));

    return NextResponse.json({
      shares: response,
      total: response.length,
      stats: shareLinkStore.getStats(),
    });
  } catch (error) {
    console.error('Failed to get share links:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve share links' },
      { status: 500 }
    );
  }
}

/**
 * Revoke a share link
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await request.json();
    const { shareId, reason } = body;

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 });
    }

    const shareLink = shareLinkStore.getShareLink(shareId);
    if (!shareLink) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    }

    // Verify ownership
    if (shareLink.createdBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Revoke link
    const success = shareLinkStore.revokeLink(shareId, userId, reason);

    return NextResponse.json({
      success,
      message: 'Share link revoked successfully',
    });
  } catch (error) {
    console.error('Failed to revoke share link:', error);
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    );
  }
}
