/**
 * Secure Messaging System - Storage Layer
 *
 * Post-quantum encrypted messaging with multiple modes:
 * - Direct messaging (1-on-1)
 * - Operations Rooms (group channels)
 * - Ephemeral/Burn mode (auto-delete)
 */

import crypto from 'crypto';

/**
 * Message types
 */
export type MessageType = 'text' | 'file' | 'image' | 'system';

/**
 * Message modes
 */
export type MessageMode = 'direct' | 'room' | 'ephemeral';

/**
 * Room access levels
 */
export type RoomRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Encrypted message structure
 */
export interface SecureMessage {
  id: string;
  mode: MessageMode;

  // Participants
  senderId: string;
  recipientId?: string; // For direct messages
  roomId?: string; // For room messages

  // Encrypted content
  encryptedContent: string; // Base64-encoded ciphertext
  encryptionMetadata: {
    algorithm: 'kyber768-aes256-gcm';
    kyberCiphertext: string; // Encapsulated shared secret
    iv: string;
    authTag: string;
    recipientPublicKey: string; // For verification
  };

  // Message metadata
  type: MessageType;
  timestamp: Date;
  edited?: Date;

  // Ephemeral settings
  ephemeral?: {
    burnAfterReading: boolean;
    expiresAt?: Date;
    readAt?: Date;
  };

  // Signature for authenticity
  signature: {
    value: string;
    publicKey: string;
    algorithm: 'dilithium3';
  };

  // Attachments
  attachmentId?: string;

  // Status
  delivered: boolean;
  read: boolean;
  deleted: boolean;
}

/**
 * Operations Room (secure group chat)
 */
export interface OperationsRoom {
  id: string;
  name: string;
  description?: string;

  // Access control
  ownerId: string;
  members: Map<string, RoomMember>;
  inviteOnly: boolean;

  // Room settings
  ephemeralByDefault: boolean;
  messageRetention?: number; // Hours, undefined = forever

  // Encryption
  roomKeyId: string; // Current symmetric key for room
  keyRotationSchedule?: Date;

  // Metadata
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;

  // Tags for organization
  tags: string[];
  archived: boolean;
}

/**
 * Room member
 */
export interface RoomMember {
  userId: string;
  role: RoomRole;
  joinedAt: Date;
  lastSeen: Date;
  nickname?: string;
  publicKey: string; // For encrypting room keys to this member
}

/**
 * Conversation (for direct messaging)
 */
export interface Conversation {
  id: string;
  participants: [string, string]; // Always exactly 2

  // Key exchange
  sharedKeyEstablished: boolean;
  lastKeyRotation?: Date;

  // Metadata
  createdAt: Date;
  lastMessage?: Date;
  messageCount: number;

  // Settings
  ephemeralByDefault: boolean;

  // Status per participant
  participantStatus: Map<string, {
    lastSeen: Date;
    unreadCount: number;
    typing: boolean;
  }>;
}

/**
 * User messaging profile
 */
export interface MessagingProfile {
  userId: string;
  displayName: string;

  // Post-quantum keys
  kyberPublicKey: string; // Base64-encoded Kyber-768 public key
  dilithiumPublicKey: string; // Base64-encoded Dilithium-3 public key

  // Key rotation
  keyGeneratedAt: Date;
  keyExpiresAt?: Date;

  // Settings
  acceptDirectMessages: boolean;
  requireApproval: boolean;

  // Status
  online: boolean;
  lastSeen: Date;
  statusMessage?: string;
}

/**
 * Message attachment
 */
export interface MessageAttachment {
  id: string;
  messageId: string;

  // File metadata
  filename: string;
  mimeType: string;
  size: number;

  // Encrypted content
  encryptedData: Buffer;
  encryptionMetadata: {
    algorithm: 'aes-256-gcm';
    iv: string;
    authTag: string;
  };

  // Steganography flag
  steganographicCarrier?: {
    technique: 'lsb-png';
    coverImageId: string;
  };

  // Canary token embedded
  canaryTokenId?: string;

  uploadedAt: Date;
  expiresAt?: Date;
}

/**
 * Key exchange session
 */
export interface KeyExchangeSession {
  id: string;
  initiatorId: string;
  responderId: string;

  // Kyber key exchange
  initiatorPublicKey: string;
  responderPublicKey?: string;
  sharedSecretEstablished: boolean;

  // Ratcheting state for forward secrecy
  ratchetState?: {
    sendingChainKey: string;
    receivingChainKey: string;
    messageNumber: number;
  };

  createdAt: Date;
  expiresAt: Date;
  completed: boolean;
}

/**
 * Secure Message Store
 */
class SecureMessageStore {
  private messages: Map<string, SecureMessage> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private rooms: Map<string, OperationsRoom> = new Map();
  private profiles: Map<string, MessagingProfile> = new Map();
  private attachments: Map<string, MessageAttachment> = new Map();
  private keyExchanges: Map<string, KeyExchangeSession> = new Map();

  // Indexes
  private userMessages: Map<string, Set<string>> = new Map(); // userId -> messageIds
  private roomMessages: Map<string, string[]> = new Map(); // roomId -> messageIds (ordered)
  private conversationMessages: Map<string, string[]> = new Map(); // conversationId -> messageIds

  /**
   * Create or get conversation between two users
   */
  getOrCreateConversation(userId1: string, userId2: string): Conversation {
    // Normalize conversation ID (alphabetically)
    const [user1, user2] = [userId1, userId2].sort();
    const conversationId = `${user1}:${user2}`;

    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = {
        id: conversationId,
        participants: [user1, user2],
        sharedKeyEstablished: false,
        createdAt: new Date(),
        messageCount: 0,
        ephemeralByDefault: false,
        participantStatus: new Map([
          [user1, { lastSeen: new Date(), unreadCount: 0, typing: false }],
          [user2, { lastSeen: new Date(), unreadCount: 0, typing: false }],
        ]),
      };
      this.conversations.set(conversationId, conversation);
      this.conversationMessages.set(conversationId, []);
    }

    return conversation;
  }

  /**
   * Store encrypted message
   */
  storeMessage(message: SecureMessage): void {
    this.messages.set(message.id, message);

    // Index by user
    if (!this.userMessages.has(message.senderId)) {
      this.userMessages.set(message.senderId, new Set());
    }
    this.userMessages.get(message.senderId)!.add(message.id);

    if (message.recipientId) {
      if (!this.userMessages.has(message.recipientId)) {
        this.userMessages.set(message.recipientId, new Set());
      }
      this.userMessages.get(message.recipientId)!.add(message.id);
    }

    // Index by conversation or room
    if (message.mode === 'direct' && message.recipientId) {
      const conversation = this.getOrCreateConversation(message.senderId, message.recipientId);
      this.conversationMessages.get(conversation.id)!.push(message.id);
      conversation.messageCount++;
      conversation.lastMessage = message.timestamp;

      // Update unread count
      const recipientStatus = conversation.participantStatus.get(message.recipientId);
      if (recipientStatus) {
        recipientStatus.unreadCount++;
      }
    } else if (message.mode === 'room' && message.roomId) {
      if (!this.roomMessages.has(message.roomId)) {
        this.roomMessages.set(message.roomId, []);
      }
      this.roomMessages.get(message.roomId)!.push(message.id);

      const room = this.rooms.get(message.roomId);
      if (room) {
        room.messageCount++;
        room.lastActivity = message.timestamp;
      }
    }

    // Handle ephemeral messages
    if (message.ephemeral?.expiresAt) {
      const ttl = message.ephemeral.expiresAt.getTime() - Date.now();
      if (ttl > 0) {
        setTimeout(() => this.deleteMessage(message.id), ttl);
      }
    }
  }

  /**
   * Get message by ID
   */
  getMessage(messageId: string, userId: string): SecureMessage | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    // Check access
    if (message.senderId !== userId && message.recipientId !== userId) {
      // Check if user is in the room
      if (message.roomId) {
        const room = this.rooms.get(message.roomId);
        if (!room || !room.members.has(userId)) {
          return null;
        }
      } else {
        return null;
      }
    }

    // Handle burn-after-reading
    if (message.ephemeral?.burnAfterReading && message.recipientId === userId && !message.ephemeral.readAt) {
      message.ephemeral.readAt = new Date();
      setTimeout(() => this.deleteMessage(messageId), 5000); // 5s grace period
    }

    return message;
  }

  /**
   * Get conversation messages
   */
  getConversationMessages(conversationId: string, userId: string, limit: number = 50): SecureMessage[] {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return [];
    }

    const messageIds = this.conversationMessages.get(conversationId) || [];
    return messageIds
      .slice(-limit)
      .map(id => this.messages.get(id)!)
      .filter(msg => !msg.deleted);
  }

  /**
   * Get room messages
   */
  getRoomMessages(roomId: string, userId: string, limit: number = 100): SecureMessage[] {
    const room = this.rooms.get(roomId);
    if (!room || !room.members.has(userId)) {
      return [];
    }

    const messageIds = this.roomMessages.get(roomId) || [];
    return messageIds
      .slice(-limit)
      .map(id => this.messages.get(id)!)
      .filter(msg => !msg.deleted);
  }

  /**
   * Delete message
   */
  deleteMessage(messageId: string): boolean {
    const message = this.messages.get(messageId);
    if (!message) return false;

    message.deleted = true;
    message.encryptedContent = '';

    return true;
  }

  /**
   * Create operations room
   */
  createRoom(ownerId: string, name: string, settings: Partial<OperationsRoom>): OperationsRoom {
    const roomId = crypto.randomUUID();

    const room: OperationsRoom = {
      id: roomId,
      name,
      description: settings.description,
      ownerId,
      members: new Map([[ownerId, {
        userId: ownerId,
        role: 'owner',
        joinedAt: new Date(),
        lastSeen: new Date(),
        publicKey: this.profiles.get(ownerId)?.kyberPublicKey || '',
      }]]),
      inviteOnly: settings.inviteOnly ?? true,
      ephemeralByDefault: settings.ephemeralByDefault ?? false,
      messageRetention: settings.messageRetention,
      roomKeyId: crypto.randomUUID(),
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      tags: settings.tags || [],
      archived: false,
    };

    this.rooms.set(roomId, room);
    this.roomMessages.set(roomId, []);

    return room;
  }

  /**
   * Add member to room
   */
  addRoomMember(roomId: string, userId: string, role: RoomRole, publicKey: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.members.set(userId, {
      userId,
      role,
      joinedAt: new Date(),
      lastSeen: new Date(),
      publicKey,
    });

    return true;
  }

  /**
   * Get user's rooms
   */
  getUserRooms(userId: string): OperationsRoom[] {
    return Array.from(this.rooms.values())
      .filter(room => room.members.has(userId) && !room.archived)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Get user's conversations
   */
  getUserConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.participants.includes(userId))
      .sort((a, b) => {
        const aTime = a.lastMessage?.getTime() || 0;
        const bTime = b.lastMessage?.getTime() || 0;
        return bTime - aTime;
      });
  }

  /**
   * Store/update messaging profile
   */
  storeProfile(profile: MessagingProfile): void {
    this.profiles.set(profile.userId, profile);
  }

  /**
   * Get messaging profile
   */
  getProfile(userId: string): MessagingProfile | undefined {
    return this.profiles.get(userId);
  }

  /**
   * Store attachment
   */
  storeAttachment(attachment: MessageAttachment): void {
    this.attachments.set(attachment.id, attachment);

    // Auto-delete expired attachments
    if (attachment.expiresAt) {
      const ttl = attachment.expiresAt.getTime() - Date.now();
      if (ttl > 0) {
        setTimeout(() => this.attachments.delete(attachment.id), ttl);
      }
    }
  }

  /**
   * Get attachment
   */
  getAttachment(attachmentId: string): MessageAttachment | undefined {
    return this.attachments.get(attachmentId);
  }

  /**
   * Mark conversation as read
   */
  markConversationRead(conversationId: string, userId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const status = conversation.participantStatus.get(userId);
    if (status) {
      status.unreadCount = 0;
      status.lastSeen = new Date();
    }
  }

  /**
   * Get unread count for user
   */
  getUnreadCount(userId: string): number {
    let total = 0;
    for (const conversation of this.conversations.values()) {
      if (conversation.participants.includes(userId)) {
        const status = conversation.participantStatus.get(userId);
        total += status?.unreadCount || 0;
      }
    }
    return total;
  }
}

// Singleton instance
export const messageStore = new SecureMessageStore();
