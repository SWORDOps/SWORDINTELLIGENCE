/**
 * Room Members API
 *
 * Add and manage members in operations rooms
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { messageStore } from '@/lib/messaging/message-store';
import type { RoomRole } from '@/lib/messaging/message-store';

/**
 * POST - Add member to room
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { roomId } = params;
    const body = await request.json();
    const { targetUserId, role } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'targetUserId is required' },
        { status: 400 }
      );
    }

    // Get room
    const rooms = messageStore.getUserRooms(userId);
    const room = rooms.find(r => r.id === roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check permissions (only owner and admins can add members)
    const currentMember = room.members.get(userId);
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify target user exists and has keys
    const targetProfile = messageStore.getProfile(targetUserId);
    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Target user not found or has not generated keys' },
        { status: 404 }
      );
    }

    // Check if already a member
    if (room.members.has(targetUserId)) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Add member
    const memberRole: RoomRole = role || 'member';
    const success = messageStore.addRoomMember(
      roomId,
      targetUserId,
      memberRole,
      targetProfile.kyberPublicKey
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      member: {
        userId: targetUserId,
        displayName: targetProfile.displayName,
        role: memberRole,
        joinedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: 'Failed to add member', details: error.message },
      { status: 500 }
    );
  }
}
