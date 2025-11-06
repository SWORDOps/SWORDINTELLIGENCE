/**
 * Admin Canary Token Oversight API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission, userStore } from '@/lib/admin/permissions';
import { canaryTokenStore } from '@/lib/security/canary-tokens';

/**
 * GET - Get all canary tokens and triggers (admin oversight)
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
    if (!hasPermission(userId, 'canary.view_all')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Get all tokens
    const allTokens = canaryTokenStore.getAllTokens();

    // Get all triggers
    const allTriggers = canaryTokenStore.getAllTriggers();

    // Calculate statistics
    const stats = {
      totalTokens: allTokens.length,
      activeTokens: allTokens.filter(t => t.active).length,
      totalTriggers: allTriggers.length,
      recentTriggers: allTriggers.filter(t => {
        const ageMs = Date.now() - new Date(t.triggeredAt).getTime();
        return ageMs < 24 * 60 * 60 * 1000; // Last 24 hours
      }).length,
      byType: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      triggersByType: {} as Record<string, number>,
    };

    for (const token of allTokens) {
      stats.byType[token.type] = (stats.byType[token.type] || 0) + 1;
      stats.byUser[token.userId] = (stats.byUser[token.userId] || 0) + 1;
    }

    for (const trigger of allTriggers) {
      const token = canaryTokenStore.getToken(trigger.tokenId);
      if (token) {
        stats.triggersByType[token.type] = (stats.triggersByType[token.type] || 0) + 1;
      }
    }

    // Get recent triggers with details
    const recentTriggersWithDetails = allTriggers
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
      .slice(0, 50)
      .map(trigger => {
        const token = canaryTokenStore.getToken(trigger.tokenId);
        return {
          ...trigger,
          tokenLabel: token?.label,
          tokenType: token?.type,
          tokenOwner: token?.userId,
        };
      });

    return NextResponse.json({
      stats,
      tokens: allTokens.map(t => ({
        tokenId: t.tokenId,
        type: t.type,
        label: t.label,
        userId: t.userId,
        createdAt: t.createdAt,
        active: t.active,
        triggerCount: t.triggerCount,
        documentId: t.documentId,
      })),
      recentTriggers: recentTriggersWithDetails,
    });
  } catch (error: any) {
    console.error('Canary oversight error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve canary data', details: error.message },
      { status: 500 }
    );
  }
}
