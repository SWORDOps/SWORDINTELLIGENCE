/**
 * Admin Statistics API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { auditLog } from '@/lib/admin/audit-log';
import { hasPermission, userStore, isAdmin } from '@/lib/admin/permissions';
import { documentStore } from '@/lib/vault/document-store';
import { canaryTokenStore } from '@/lib/security/canary-tokens';
import { deadDropStore } from '@/lib/security/dead-drops';
import { messageStore } from '@/lib/messaging/message-store';
import { threatFeed } from '@/lib/intelligence/threat-feed';

/**
 * GET - Get comprehensive system statistics
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

    // Check if user is admin
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Audit log statistics
    const auditStats = auditLog.getStatistics(days);

    // User statistics
    const allUsers = userStore.getAllUsers();
    const userStats = {
      total: allUsers.length,
      active: allUsers.filter(u => !u.disabled).length,
      byRole: {
        user: allUsers.filter(u => u.role === 'user').length,
        analyst: allUsers.filter(u => u.role === 'analyst').length,
        admin: allUsers.filter(u => u.role === 'admin').length,
        superadmin: allUsers.filter(u => u.role === 'superadmin').length,
      },
    };

    // Vault statistics
    const allDocuments = documentStore.getAllDocuments();
    const vaultStats = {
      totalDocuments: allDocuments.length,
      totalSize: allDocuments.reduce((sum, doc) => sum + doc.size, 0),
      byMimeType: {} as Record<string, number>,
    };

    for (const doc of allDocuments) {
      const type = doc.mimeType.split('/')[0];
      vaultStats.byMimeType[type] = (vaultStats.byMimeType[type] || 0) + 1;
    }

    // Canary token statistics
    const allCanaryTokens = canaryTokenStore.getAllTokens();
    const triggeredTokens = canaryTokenStore.getAllTriggers();
    const canaryStats = {
      totalTokens: allCanaryTokens.length,
      activeTokens: allCanaryTokens.filter(t => t.active).length,
      totalTriggers: triggeredTokens.length,
      recentTriggers: triggeredTokens.filter(t => {
        const ageMs = Date.now() - new Date(t.triggeredAt).getTime();
        return ageMs < days * 24 * 60 * 60 * 1000;
      }).length,
      byType: {} as Record<string, number>,
    };

    for (const token of allCanaryTokens) {
      canaryStats.byType[token.type] = (canaryStats.byType[token.type] || 0) + 1;
    }

    // Dead drop statistics
    const allDeadDrops = deadDropStore.getAllDeadDrops();
    const deadDropStats = {
      total: allDeadDrops.length,
      active: allDeadDrops.filter(d => d.status === 'active').length,
      pickedUp: allDeadDrops.filter(d => d.status === 'picked_up').length,
      expired: allDeadDrops.filter(d => d.status === 'expired').length,
    };

    // Messaging statistics
    const allRooms = Array.from(messageStore['rooms'].values());
    const messagingStats = {
      totalRooms: allRooms.length,
      activeRooms: allRooms.filter(r => !r.archived).length,
      totalMembers: allRooms.reduce((sum, r) => sum + r.members.size, 0),
      totalMessages: allRooms.reduce((sum, r) => sum + r.messageCount, 0),
    };

    // Threat intelligence statistics
    const threatStats = threatFeed.getStats();

    return NextResponse.json({
      audit: auditStats,
      users: userStats,
      vault: vaultStats,
      canary: canaryStats,
      deadDrops: deadDropStats,
      messaging: messagingStats,
      threats: threatStats,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Statistics query error:', error);
    return NextResponse.json(
      { error: 'Failed to query statistics', details: error.message },
      { status: 500 }
    );
  }
}
