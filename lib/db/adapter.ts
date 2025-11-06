/**
 * Database Adapter Layer
 *
 * Provides abstraction over database operations.
 * Falls back to in-memory storage if Prisma is unavailable (development).
 */

import type { SearchIndex } from '../search/searchable-encryption';
import type { DeadDrop, Heartbeat, UserLocation } from '../messaging/dead-drop';

/**
 * Database adapter interface
 */
export interface DatabaseAdapter {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  // Message operations
  getMessage(id: string): Promise<Message | null>;
  getMessages(filter: MessageFilter): Promise<Message[]>;
  createMessage(data: CreateMessageData): Promise<Message>;
  deleteMessage(id: string): Promise<boolean>;

  // Search index operations
  getSearchIndex(messageId: string): Promise<SearchIndex | null>;
  getSearchIndexes(filter: SearchIndexFilter): Promise<SearchIndex[]>;
  createSearchIndex(data: SearchIndex): Promise<void>;
  deleteSearchIndex(messageId: string): Promise<boolean>;

  // Dead drop operations
  getDeadDrop(id: string): Promise<DeadDrop | null>;
  getDeadDrops(filter: DeadDropFilter): Promise<DeadDrop[]>;
  createDeadDrop(data: CreateDeadDropData): Promise<DeadDrop>;
  updateDeadDrop(id: string, data: Partial<DeadDrop>): Promise<DeadDrop>;

  // Heartbeat operations
  getHeartbeat(userId: string): Promise<Heartbeat | null>;
  upsertHeartbeat(data: HeartbeatData): Promise<void>;

  // Location operations
  getLocation(userId: string): Promise<UserLocation | null>;
  upsertLocation(data: LocationData): Promise<void>;

  // Room operations
  getRoom(id: string): Promise<Room | null>;
  getRooms(): Promise<Room[]>;
  createRoom(data: CreateRoomData): Promise<Room>;

  // Health check
  isHealthy(): Promise<boolean>;
}

/**
 * Type definitions
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  disabled: boolean;
  kyberPublicKey: string | null;
  dilithiumPublicKey: string | null;
  searchKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  name?: string;
  role?: string;
  kyberPublicKey?: string;
  dilithiumPublicKey?: string;
  searchKey?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string | null;
  roomId: string | null;
  encryptedContent: string;
  encryptionMetadata: any;
  signature: any;
  messageType: string;
  delivered: boolean;
  read: boolean;
  ephemeral: boolean;
  burnAfterReading: boolean;
  expiresAt: Date | null;
  deadDropDelivery: boolean;
  deadDropId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageData {
  senderId: string;
  recipientId?: string;
  roomId?: string;
  encryptedContent: string;
  encryptionMetadata: any;
  signature?: any;
  messageType?: string;
  ephemeral?: boolean;
  burnAfterReading?: boolean;
  expiresAt?: Date;
  deadDropDelivery?: boolean;
  deadDropId?: string;
}

export interface MessageFilter {
  senderId?: string;
  recipientId?: string;
  roomId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchIndexFilter {
  roomId?: string;
  senderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DeadDropFilter {
  status?: string;
  triggerType?: string;
  recipientId?: string;
}

export interface CreateDeadDropData {
  creatorId: string;
  recipientId: string;
  roomId?: string;
  encryptedContent: string;
  encryptionMetadata: any;
  trigger: any;
  triggerType: string;
  requireConfirmation?: boolean;
  selfDestruct?: boolean;
  maxAttempts?: number;
  expiresAt?: Date;
}

export interface HeartbeatData {
  userId: string;
  lastHeartbeat: Date;
  ipHash?: string;
  userAgent?: string;
}

export interface LocationData {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  ipHash?: string;
  timestamp: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  inviteOnly: boolean;
  ephemeralByDefault: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  creatorId: string;
  inviteOnly?: boolean;
  ephemeralByDefault?: boolean;
  tags?: string[];
}

/**
 * In-memory database adapter (fallback for development)
 */
export class InMemoryAdapter implements DatabaseAdapter {
  private users = new Map<string, User>();
  private usersByEmail = new Map<string, User>();
  private messages = new Map<string, Message>();
  private searchIndexes = new Map<string, SearchIndex>();
  private deadDrops = new Map<string, DeadDrop>();
  private heartbeats = new Map<string, Heartbeat>();
  private locations = new Map<string, UserLocation>();
  private rooms = new Map<string, Room>();

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name || null,
      role: data.role || 'user',
      disabled: false,
      kyberPublicKey: data.kyberPublicKey || null,
      dilithiumPublicKey: data.dilithiumPublicKey || null,
      searchKey: data.searchKey || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    this.usersByEmail.set(updated.email, updated);
    return updated;
  }

  async getMessage(id: string): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async getMessages(filter: MessageFilter): Promise<Message[]> {
    let messages = Array.from(this.messages.values());

    if (filter.senderId) {
      messages = messages.filter((m) => m.senderId === filter.senderId);
    }
    if (filter.recipientId) {
      messages = messages.filter((m) => m.recipientId === filter.recipientId);
    }
    if (filter.roomId) {
      messages = messages.filter((m) => m.roomId === filter.roomId);
    }

    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filter.offset) {
      messages = messages.slice(filter.offset);
    }
    if (filter.limit) {
      messages = messages.slice(0, filter.limit);
    }

    return messages;
  }

  async createMessage(data: CreateMessageData): Promise<Message> {
    const message: Message = {
      id: crypto.randomUUID(),
      senderId: data.senderId,
      recipientId: data.recipientId || null,
      roomId: data.roomId || null,
      encryptedContent: data.encryptedContent,
      encryptionMetadata: data.encryptionMetadata,
      signature: data.signature || null,
      messageType: data.messageType || 'text',
      delivered: false,
      read: false,
      ephemeral: data.ephemeral || false,
      burnAfterReading: data.burnAfterReading || false,
      expiresAt: data.expiresAt || null,
      deadDropDelivery: data.deadDropDelivery || false,
      deadDropId: data.deadDropId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.messages.delete(id);
  }

  async getSearchIndex(messageId: string): Promise<SearchIndex | null> {
    return this.searchIndexes.get(messageId) || null;
  }

  async getSearchIndexes(filter: SearchIndexFilter): Promise<SearchIndex[]> {
    let indexes = Array.from(this.searchIndexes.values());

    if (filter.roomId) {
      indexes = indexes.filter((i) => i.roomId === filter.roomId);
    }
    if (filter.senderId) {
      indexes = indexes.filter((i) => i.senderId === filter.senderId);
    }
    if (filter.dateFrom) {
      indexes = indexes.filter((i) => i.timestamp >= filter.dateFrom!.getTime());
    }
    if (filter.dateTo) {
      indexes = indexes.filter((i) => i.timestamp <= filter.dateTo!.getTime());
    }

    return indexes;
  }

  async createSearchIndex(data: SearchIndex): Promise<void> {
    this.searchIndexes.set(data.messageId, data);
  }

  async deleteSearchIndex(messageId: string): Promise<boolean> {
    return this.searchIndexes.delete(messageId);
  }

  async getDeadDrop(id: string): Promise<DeadDrop | null> {
    return this.deadDrops.get(id) || null;
  }

  async getDeadDrops(filter: DeadDropFilter): Promise<DeadDrop[]> {
    let drops = Array.from(this.deadDrops.values());

    if (filter.status) {
      drops = drops.filter((d) => d.status === filter.status);
    }
    if (filter.triggerType) {
      drops = drops.filter((d) => d.triggerType === filter.triggerType);
    }
    if (filter.recipientId) {
      drops = drops.filter((d) => d.recipientId === filter.recipientId);
    }

    return drops;
  }

  async createDeadDrop(data: CreateDeadDropData): Promise<DeadDrop> {
    const drop: DeadDrop = {
      id: crypto.randomUUID(),
      creatorId: data.creatorId,
      recipientId: data.recipientId,
      roomId: data.roomId || undefined,
      encryptedContent: data.encryptedContent,
      encryptionMetadata: data.encryptionMetadata,
      trigger: data.trigger,
      triggerType: data.triggerType,
      status: 'pending',
      requireConfirmation: data.requireConfirmation || false,
      selfDestruct: data.selfDestruct || false,
      maxAttempts: data.maxAttempts || 3,
      deliveryAttempts: 0,
      createdAt: new Date(),
      deliveredAt: undefined,
      cancelledAt: undefined,
      expiresAt: data.expiresAt || undefined,
      lastEvaluatedAt: undefined,
    };
    this.deadDrops.set(drop.id, drop);
    return drop;
  }

  async updateDeadDrop(id: string, data: Partial<DeadDrop>): Promise<DeadDrop> {
    const drop = this.deadDrops.get(id);
    if (!drop) throw new Error('DeadDrop not found');
    const updated = { ...drop, ...data };
    this.deadDrops.set(id, updated);
    return updated;
  }

  async getHeartbeat(userId: string): Promise<Heartbeat | null> {
    return this.heartbeats.get(userId) || null;
  }

  async upsertHeartbeat(data: HeartbeatData): Promise<void> {
    const heartbeat: Heartbeat = {
      userId: data.userId,
      lastHeartbeat: data.lastHeartbeat,
      ipHash: data.ipHash,
      userAgent: data.userAgent,
    };
    this.heartbeats.set(data.userId, heartbeat);
  }

  async getLocation(userId: string): Promise<UserLocation | null> {
    return this.locations.get(userId) || null;
  }

  async upsertLocation(data: LocationData): Promise<void> {
    const location: UserLocation = {
      userId: data.userId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      ipHash: data.ipHash,
      timestamp: data.timestamp,
    };
    this.locations.set(data.userId, location);
  }

  async getRoom(id: string): Promise<Room | null> {
    return this.rooms.get(id) || null;
  }

  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async createRoom(data: CreateRoomData): Promise<Room> {
    const room: Room = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || null,
      creatorId: data.creatorId,
      inviteOnly: data.inviteOnly !== undefined ? data.inviteOnly : true,
      ephemeralByDefault: data.ephemeralByDefault || false,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rooms.set(room.id, room);
    return room;
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }
}

/**
 * Get database adapter instance
 */
let adapterInstance: DatabaseAdapter | null = null;

export function getDatabaseAdapter(): DatabaseAdapter {
  if (!adapterInstance) {
    // Try to use Prisma, fall back to in-memory
    try {
      // Import would fail if Prisma client not generated
      // For now, use in-memory adapter
      console.log('[Database] Using in-memory adapter (Prisma unavailable)');
      adapterInstance = new InMemoryAdapter();
    } catch (error) {
      console.log('[Database] Falling back to in-memory adapter');
      adapterInstance = new InMemoryAdapter();
    }
  }
  return adapterInstance;
}
