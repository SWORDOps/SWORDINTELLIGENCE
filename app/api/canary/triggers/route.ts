import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { canaryTokenStore } from '@/lib/security/canary-tokens';

/**
 * Get recent canary token triggers
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const tokenId = searchParams.get('tokenId');
    const severity = searchParams.get('severity');
    const acknowledged = searchParams.get('acknowledged');

    // Get all user's tokens
    const userTokens = canaryTokenStore.getUserTokens(userId);
    const userTokenIds = new Set(userTokens.map(t => t.tokenId));

    // Get recent triggers
    let triggers = canaryTokenStore.getRecentTriggers(limit * 2); // Get more to filter

    // Filter to only user's tokens
    triggers = triggers.filter(t => userTokenIds.has(t.tokenId));

    // Filter by specific token
    if (tokenId) {
      triggers = triggers.filter(t => t.tokenId === tokenId);
    }

    // Filter by severity
    if (severity) {
      triggers = triggers.filter(t => t.severity === severity);
    }

    // Filter by acknowledged status
    if (acknowledged !== null && acknowledged !== undefined) {
      const isAcknowledged = acknowledged === 'true';
      triggers = triggers.filter(t => !!t.acknowledgedAt === isAcknowledged);
    }

    // Limit results
    triggers = triggers.slice(0, limit);

    // Enrich with token information
    const enrichedTriggers = triggers.map(trigger => {
      const token = canaryTokenStore.getToken(trigger.tokenId);
      return {
        ...trigger,
        triggeredAt: trigger.triggeredAt.toISOString(),
        acknowledgedAt: trigger.acknowledgedAt?.toISOString(),
        token: token
          ? {
              label: token.label,
              type: token.type,
              documentId: token.documentId,
              tags: token.tags,
            }
          : null,
      };
    });

    // Get statistics
    const stats = canaryTokenStore.getStats();

    // Count unacknowledged critical/high triggers
    const unacknowledgedCritical = triggers.filter(
      t => !t.acknowledgedAt && (t.severity === 'critical' || t.severity === 'high')
    ).length;

    return NextResponse.json({
      triggers: enrichedTriggers,
      total: enrichedTriggers.length,
      unacknowledgedCritical,
      stats: {
        totalTriggers: stats.totalTriggers,
        uniqueIPs: stats.uniqueIPs,
        triggeredTokens: stats.triggeredTokens,
      },
    });
  } catch (error) {
    console.error('Failed to get canary triggers:', error);
    return NextResponse.json(
      { error: 'Failed to get canary triggers' },
      { status: 500 }
    );
  }
}

/**
 * Acknowledge a trigger
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
    const { triggerId, tokenId } = body;

    if (!triggerId || !tokenId) {
      return NextResponse.json(
        { error: 'Trigger ID and token ID required' },
        { status: 400 }
      );
    }

    // Get token and verify ownership
    const token = canaryTokenStore.getToken(tokenId);
    if (!token || token.userId !== userId) {
      return NextResponse.json(
        { error: 'Token not found or unauthorized' },
        { status: 404 }
      );
    }

    // Find and acknowledge trigger
    const trigger = token.triggers.find(t => t.triggerId === triggerId);
    if (!trigger) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 });
    }

    trigger.acknowledgedAt = new Date();
    trigger.acknowledgedBy = userId;

    return NextResponse.json({
      success: true,
      trigger: {
        triggerId: trigger.triggerId,
        acknowledgedAt: trigger.acknowledgedAt.toISOString(),
        acknowledgedBy: trigger.acknowledgedBy,
      },
    });
  } catch (error) {
    console.error('Failed to acknowledge trigger:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge trigger' },
      { status: 500 }
    );
  }
}
