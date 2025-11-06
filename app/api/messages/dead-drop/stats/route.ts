/**
 * Dead Drop Statistics API Endpoint
 *
 * Get system-wide or user-specific statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { deadDropStore } from '@/lib/messaging/dead-drop';
import { isAdmin } from '@/lib/admin/permissions';

/**
 * GET /api/messages/dead-drop/stats
 * Get dead drop statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = isAdmin(session.user.email);

    // Get system-wide stats
    const systemStats = deadDropStore.getStats();

    // Get user-specific stats
    const userDrops = deadDropStore.getUserDeadDrops(session.user.email);
    const userStats = {
      total: userDrops.length,
      pending: userDrops.filter((d) => d.status === 'pending').length,
      delivered: userDrops.filter((d) => d.status === 'delivered').length,
      cancelled: userDrops.filter((d) => d.status === 'cancelled').length,
      failed: userDrops.filter((d) => d.status === 'failed').length,
    };

    return NextResponse.json({
      user: userStats,
      system: admin ? systemStats : undefined, // Only admins see system stats
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
