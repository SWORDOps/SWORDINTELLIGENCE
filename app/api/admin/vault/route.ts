/**
 * Admin Vault Oversight API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission, userStore } from '@/lib/admin/permissions';
import { documentStore } from '@/lib/vault/document-store';
import { shareLinkStore } from '@/lib/vault/share-links';

/**
 * GET - Get all vault documents and shares (admin oversight)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;

    // Ensure user exists in store
    userStore.getOrCreateUser(userId, session.user.email, session.user.name || userId);

    // Check permission
    if (!hasPermission(userId, 'vault.view_all')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Get all documents
    const allDocuments = documentStore.getAllDocuments();

    // Get all share links
    const allShares = shareLinkStore.getAllShares();

    // Calculate statistics
    const stats = {
      totalDocuments: allDocuments.length,
      totalSize: allDocuments.reduce((sum, doc) => sum + doc.size, 0),
      byUser: {} as Record<string, number>,
      byMimeType: {} as Record<string, number>,
      totalShares: allShares.length,
      activeShares: allShares.filter(s => !s.expired && (!s.expiresAt || new Date(s.expiresAt) > new Date())).length,
      totalAccesses: allShares.reduce((sum, s) => sum + s.accessCount, 0),
    };

    for (const doc of allDocuments) {
      stats.byUser[doc.uploadedBy] = (stats.byUser[doc.uploadedBy] || 0) + 1;
      const type = doc.mimeType.split('/')[0];
      stats.byMimeType[type] = (stats.byMimeType[type] || 0) + 1;
    }

    // Get recent documents
    const recentDocuments = allDocuments
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 50)
      .map(doc => ({
        id: doc.id,
        filename: doc.filename,
        size: doc.size,
        mimeType: doc.mimeType,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt,
        versionCount: documentStore.getVersionHistory(doc.id).length,
      }));

    // Get recent shares
    const recentShares = allShares
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)
      .map(share => ({
        shareId: share.shareId,
        documentId: share.documentId,
        filename: share.originalFilename,
        createdBy: share.createdBy,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        accessCount: share.accessCount,
        maxAccesses: share.maxAccesses,
        requirePassword: share.requirePassword,
        expired: share.expired,
      }));

    return NextResponse.json({
      stats,
      recentDocuments,
      recentShares,
    });
  } catch (error: any) {
    console.error('Vault oversight error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve vault data', details: error.message },
      { status: 500 }
    );
  }
}
