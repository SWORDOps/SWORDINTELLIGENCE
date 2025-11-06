/**
 * Messages API
 *
 * Send and retrieve encrypted messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { messageStore, type SecureMessage, type MessageMode } from '@/lib/messaging/message-store';
import crypto from 'crypto';

/**
 * POST - Send encrypted message
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
      mode,
      recipientId,
      roomId,
      encryptedContent,
      encryptionMetadata,
      signature,
      type,
      ephemeral,
      attachmentId,
    } = body;

    // Validate mode-specific requirements
    if (mode === 'direct' && !recipientId) {
      return NextResponse.json(
        { error: 'recipientId required for direct messages' },
        { status: 400 }
      );
    }

    if (mode === 'room' && !roomId) {
      return NextResponse.json(
        { error: 'roomId required for room messages' },
        { status: 400 }
      );
    }

    // Verify sender has messaging keys
    const senderProfile = messageStore.getProfile(userId);
    if (!senderProfile) {
      return NextResponse.json(
        { error: 'Generate messaging keys first' },
        { status: 400 }
      );
    }

    // For direct messages, verify recipient exists
    if (mode === 'direct') {
      const recipientProfile = messageStore.getProfile(recipientId);
      if (!recipientProfile) {
        return NextResponse.json(
          { error: 'Recipient not found or has not generated keys' },
          { status: 404 }
        );
      }
    }

    // For room messages, verify user is a member
    if (mode === 'room') {
      const room = messageStore.getUserRooms(userId).find(r => r.id === roomId);
      if (!room) {
        return NextResponse.json(
          { error: 'Room not found or user is not a member' },
          { status: 404 }
        );
      }
    }

    // Create message
    const messageId = crypto.randomUUID();
    const message: SecureMessage = {
      id: messageId,
      mode: mode as MessageMode,
      senderId: userId,
      recipientId: mode === 'direct' ? recipientId : undefined,
      roomId: mode === 'room' ? roomId : undefined,
      encryptedContent,
      encryptionMetadata,
      type: type || 'text',
      timestamp: new Date(),
      ephemeral: ephemeral ? {
        burnAfterReading: ephemeral.burnAfterReading || false,
        expiresAt: ephemeral.expiresAt ? new Date(ephemeral.expiresAt) : undefined,
      } : undefined,
      signature,
      attachmentId,
      delivered: false,
      read: false,
      deleted: false,
    };

    // Store message
    messageStore.storeMessage(message);

    // Mark as delivered (in production, this would happen via WebSocket acknowledgment)
    message.delivered = true;

    return NextResponse.json({
      success: true,
      messageId,
      timestamp: message.timestamp,
      delivered: true,
    });
  } catch (error: any) {
    console.error('Message send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve messages (conversations or rooms)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') as 'conversations' | 'room' | null;
    const conversationId = searchParams.get('conversationId');
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get conversations list
    if (mode === 'conversations') {
      const conversations = messageStore.getUserConversations(userId);

      return NextResponse.json({
        conversations: conversations.map(conv => ({
          id: conv.id,
          participants: conv.participants,
          lastMessage: conv.lastMessage,
          messageCount: conv.messageCount,
          unreadCount: conv.participantStatus.get(userId)?.unreadCount || 0,
          otherParticipant: conv.participants.find(p => p !== userId),
        })),
      });
    }

    // Get conversation messages
    if (conversationId) {
      const messages = messageStore.getConversationMessages(conversationId, userId, limit);

      return NextResponse.json({
        conversationId,
        messages: messages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          encryptedContent: msg.encryptedContent,
          encryptionMetadata: msg.encryptionMetadata,
          signature: msg.signature,
          type: msg.type,
          timestamp: msg.timestamp,
          ephemeral: msg.ephemeral,
          delivered: msg.delivered,
          read: msg.read,
          attachmentId: msg.attachmentId,
        })),
      });
    }

    // Get room messages
    if (roomId) {
      const messages = messageStore.getRoomMessages(roomId, userId, limit);

      return NextResponse.json({
        roomId,
        messages: messages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          encryptedContent: msg.encryptedContent,
          encryptionMetadata: msg.encryptionMetadata,
          signature: msg.signature,
          type: msg.type,
          timestamp: msg.timestamp,
          delivered: msg.delivered,
          attachmentId: msg.attachmentId,
        })),
      });
    }

    // Get user's rooms
    const rooms = messageStore.getUserRooms(userId);

    return NextResponse.json({
      rooms: rooms.map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        memberCount: room.members.size,
        lastActivity: room.lastActivity,
        messageCount: room.messageCount,
        tags: room.tags,
      })),
    });
  } catch (error: any) {
    console.error('Message retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve messages', details: error.message },
      { status: 500 }
    );
  }
}
