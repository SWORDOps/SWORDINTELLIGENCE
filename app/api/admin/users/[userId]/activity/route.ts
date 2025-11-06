/**
 * User Activity Detail API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission, userStore } from '@/lib/admin/permissions';
import { auditLog } from '@/lib/admin/audit-log';

/**
 * GET - Get detailed user activity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUserId = session.user.email;
    const { userId } = params;

    // Ensure admin user exists in store
    userStore.getOrCreateUser(adminUserId, session.user.email, session.user.name || adminUserId);

    // Check permission
    if (!hasPermission(adminUserId, 'users.view')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Get user profile
    const user = userStore.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get activity summary
    const activity = auditLog.getUserActivity(userId, days);

    // Get suspicious activity detection
    const suspicious = auditLog.detectSuspiciousActivity(userId, 60);

    // Get recent logs
    const recentLogs = auditLog.query({ userId }, 50, 0);

    return NextResponse.json({
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        disabled: user.disabled,
      },
      activity: {
        totalActions: activity.totalActions,
        byEventType: activity.byEventType,
        recentLogs: activity.recentLogs,
        riskScore: activity.riskScore,
      },
      suspicious: {
        detected: suspicious.suspicious,
        reasons: suspicious.reasons,
        riskScore: suspicious.riskScore,
      },
      recentActivity: recentLogs.logs,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
    });
  } catch (error: any) {
    console.error('User activity error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user activity', details: error.message },
      { status: 500 }
    );
  }
}
