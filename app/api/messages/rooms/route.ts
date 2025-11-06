/**
 * Operations Rooms API
 *
 * Create and manage secure group chat rooms
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { messageStore } from '@/lib/messaging/message-store';

/**
 * POST - Create operations room
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await request.json();

    const {
      name,
      description,
      inviteOnly,
      ephemeralByDefault,
      messageRetention,
      tags,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Verify user has messaging keys
    const profile = messageStore.getProfile(userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Generate messaging keys first' },
        { status: 400 }
      );
    }

    // Create room
    const room = messageStore.createRoom(userId, name, {
      description,
      inviteOnly: inviteOnly ?? true,
      ephemeralByDefault: ephemeralByDefault ?? false,
      messageRetention,
      tags: tags || [],
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        ownerId: room.ownerId,
        memberCount: room.members.size,
        inviteOnly: room.inviteOnly,
        ephemeralByDefault: room.ephemeralByDefault,
        messageRetention: room.messageRetention,
        createdAt: room.createdAt,
        tags: room.tags,
      },
    });
  } catch (error: any) {
    console.error('Room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create room', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Get user's rooms
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const rooms = messageStore.getUserRooms(userId);

    return NextResponse.json({
      rooms: rooms.map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        ownerId: room.ownerId,
        memberCount: room.members.size,
        lastActivity: room.lastActivity,
        messageCount: room.messageCount,
        tags: room.tags,
        isOwner: room.ownerId === userId,
        members: Array.from(room.members.values()).map(member => ({
          userId: member.userId,
          role: member.role,
          joinedAt: member.joinedAt,
          lastSeen: member.lastSeen,
          nickname: member.nickname,
        })),
      })),
    });
  } catch (error: any) {
    console.error('Rooms retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve rooms', details: error.message },
      { status: 500 }
    );
  }
}
