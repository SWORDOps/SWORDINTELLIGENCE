/**
 * Heartbeat API Endpoint
 *
 * Updates user's heartbeat for dead man's switch functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { deadDropStore } from '@/lib/messaging/dead-drop';

/**
 * POST /api/messages/dead-drop/heartbeat
 * Update user's heartbeat timestamp
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Update heartbeat
    deadDropStore.updateHeartbeat(
      session.user.email,
      ipAddress,
      userAgent
    );

    // Get current heartbeat
    const heartbeat = deadDropStore.getHeartbeat(session.user.email);

    return NextResponse.json({
      success: true,
      heartbeat: heartbeat
        ? {
            userId: heartbeat.userId,
            lastHeartbeat: heartbeat.lastHeartbeat,
          }
        : null,
    });
  } catch (error) {
    console.error('Failed to update heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages/dead-drop/heartbeat
 * Get user's last heartbeat
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const heartbeat = deadDropStore.getHeartbeat(session.user.email);

    if (!heartbeat) {
      return NextResponse.json(
        { error: 'No heartbeat found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      heartbeat: {
        userId: heartbeat.userId,
        lastHeartbeat: heartbeat.lastHeartbeat,
      },
    });
  } catch (error) {
    console.error('Failed to get heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to get heartbeat' },
      { status: 500 }
    );
  }
}
