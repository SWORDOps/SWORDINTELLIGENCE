/**
 * Admin Messaging Oversight API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission, userStore } from '@/lib/admin/permissions';
import { messageStore } from '@/lib/messaging/message-store';

/**
 * GET - Get all messaging data (admin oversight)
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
    if (!hasPermission(userId, 'messages.view_all')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Access private store data via reflection (for admin oversight)
    const rooms = Array.from(messageStore['rooms'].values());
    const profiles = Array.from(messageStore['profiles'].values());
    const conversations = Array.from(messageStore['conversations'].values());

    // Calculate statistics
    const stats = {
      totalRooms: rooms.length,
      activeRooms: rooms.filter(r => !r.archived).length,
      totalMembers: rooms.reduce((sum, r) => sum + r.members.size, 0),
      totalMessages: rooms.reduce((sum, r) => sum + r.messageCount, 0),
      totalProfiles: profiles.length,
      totalConversations: conversations.length,
      byRoomTags: {} as Record<string, number>,
    };

    for (const room of rooms) {
      for (const tag of room.tags) {
        stats.byRoomTags[tag] = (stats.byRoomTags[tag] || 0) + 1;
      }
    }

    // Get rooms with details
    const roomsWithDetails = rooms
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 50)
      .map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        ownerId: room.ownerId,
        memberCount: room.members.size,
        messageCount: room.messageCount,
        lastActivity: room.lastActivity,
        createdAt: room.createdAt,
        tags: room.tags,
        archived: room.archived,
        ephemeralByDefault: room.ephemeralByDefault,
        members: Array.from(room.members.values()).map(m => ({
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          lastSeen: m.lastSeen,
        })),
      }));

    // Get active profiles
    const activeProfiles = profiles
      .filter(p => p.online)
      .map(p => ({
        userId: p.userId,
        displayName: p.displayName,
        online: p.online,
        lastSeen: p.lastSeen,
      }));

    return NextResponse.json({
      stats,
      rooms: roomsWithDetails,
      activeUsers: activeProfiles,
    });
  } catch (error: any) {
    console.error('Messaging oversight error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve messaging data', details: error.message },
      { status: 500 }
    );
  }
}
