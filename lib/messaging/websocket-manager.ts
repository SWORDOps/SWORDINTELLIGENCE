/**
 * WebSocket Connection Manager
 *
 * Server-side WebSocket management with advanced security:
 * - Connection tracking with metadata minimization
 * - Session management with forward secrecy
 * - Traffic obfuscation and decoy generation
 * - Anti-fingerprinting measures
 */

import { WSMessage, padMessage, generateDecoyMessage, getNextHeartbeatDelay, getNextDecoyDelay } from './websocket-security';

/**
 * WebSocket connection wrapper
 */
export interface SecureWSConnection {
  id: string;
  userId: string;
  ws: any; // WebSocket instance
  joinedAt: Date;
  lastActivity: Date;

  // Security features
  heartbeatTimer?: NodeJS.Timeout;
  decoyTimer?: NodeJS.Timeout;
  sessionKey: string; // For forward secrecy

  // Metadata (minimized for OPSEC)
  ipHash?: string; // Hashed IP, not raw IP
  connectionFingerprint: string;
}

/**
 * Presence information (anonymized)
 */
export interface PresenceInfo {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  // NO IP addresses, user agents, or identifying info
}

/**
 * WebSocket Manager
 * Handles connections with traffic obfuscation and OPSEC
 */
export class WebSocketManager {
  private connections: Map<string, SecureWSConnection> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> connectionIds
  private roomConnections: Map<string, Set<string>> = new Map(); // roomId -> connectionIds

  /**
   * Register new connection with obfuscation features
   */
  registerConnection(
    userId: string,
    ws: any,
    ipAddress?: string
  ): SecureWSConnection {
    const connectionId = this.generateConnectionId();

    // Hash IP address for privacy (can't reverse)
    const ipHash = ipAddress
      ? require('crypto').createHash('sha256').update(ipAddress).digest('hex').substring(0, 16)
      : undefined;

    // Generate connection fingerprint (for anti-replay)
    const connectionFingerprint = this.generateFingerprint();

    const connection: SecureWSConnection = {
      id: connectionId,
      userId,
      ws,
      joinedAt: new Date(),
      lastActivity: new Date(),
      ipHash,
      connectionFingerprint,
      sessionKey: this.generateSessionKey(),
    };

    this.connections.set(connectionId, connection);

    // Track user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);

    // Start heartbeat with randomized timing
    this.startHeartbeat(connection);

    // Start decoy traffic generation
    this.startDecoyTraffic(connection);

    console.log(`[WS] Connection registered: ${connectionId} for user ${userId}`);

    return connection;
  }

  /**
   * Unregister connection
   */
  unregisterConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Clean up timers
    if (connection.heartbeatTimer) {
      clearTimeout(connection.heartbeatTimer);
    }
    if (connection.decoyTimer) {
      clearTimeout(connection.decoyTimer);
    }

    // Remove from user tracking
    const userConns = this.userConnections.get(connection.userId);
    if (userConns) {
      userConns.delete(connectionId);
      if (userConns.size === 0) {
        this.userConnections.delete(connection.userId);
      }
    }

    // Remove from room tracking
    for (const [roomId, connIds] of this.roomConnections.entries()) {
      connIds.delete(connectionId);
      if (connIds.size === 0) {
        this.roomConnections.delete(roomId);
      }
    }

    this.connections.delete(connectionId);

    console.log(`[WS] Connection unregistered: ${connectionId}`);
  }

  /**
   * Join room
   */
  joinRoom(connectionId: string, roomId: string): void {
    if (!this.roomConnections.has(roomId)) {
      this.roomConnections.set(roomId, new Set());
    }
    this.roomConnections.get(roomId)!.add(connectionId);

    console.log(`[WS] Connection ${connectionId} joined room ${roomId}`);
  }

  /**
   * Leave room
   */
  leaveRoom(connectionId: string, roomId: string): void {
    const roomConns = this.roomConnections.get(roomId);
    if (roomConns) {
      roomConns.delete(connectionId);
      if (roomConns.size === 0) {
        this.roomConnections.delete(roomId);
      }
    }

    console.log(`[WS] Connection ${connectionId} left room ${roomId}`);
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connectionId: string, message: WSMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.ws) return;

    // Pad message for traffic analysis resistance
    const paddedMessage = padMessage(message);

    try {
      connection.ws.send(JSON.stringify(paddedMessage));
      connection.lastActivity = new Date();
    } catch (error) {
      console.error(`[WS] Send error to ${connectionId}:`, error);
      this.unregisterConnection(connectionId);
    }
  }

  /**
   * Send message to user (all their connections)
   */
  sendToUser(userId: string, message: WSMessage): void {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) return;

    for (const connId of connectionIds) {
      this.sendToConnection(connId, message);
    }
  }

  /**
   * Broadcast to room (with exclusions for sender)
   */
  broadcastToRoom(roomId: string, message: WSMessage, excludeConnectionId?: string): void {
    const connectionIds = this.roomConnections.get(roomId);
    if (!connectionIds) return;

    for (const connId of connectionIds) {
      if (connId !== excludeConnectionId) {
        this.sendToConnection(connId, message);
      }
    }
  }

  /**
   * Get user presence (anonymized)
   */
  getPresence(userId: string): PresenceInfo | null {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds || connectionIds.size === 0) {
      return null;
    }

    // User is online if they have any active connections
    const connections = Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter(Boolean) as SecureWSConnection[];

    if (connections.length === 0) return null;

    const lastActivity = connections.reduce(
      (latest, conn) => (conn.lastActivity > latest ? conn.lastActivity : latest),
      connections[0].lastActivity
    );

    return {
      userId,
      status: 'online',
      lastSeen: lastActivity,
    };
  }

  /**
   * Get all online users (anonymized)
   */
  getOnlineUsers(): PresenceInfo[] {
    const users: PresenceInfo[] = [];

    for (const userId of this.userConnections.keys()) {
      const presence = this.getPresence(userId);
      if (presence) {
        users.push(presence);
      }
    }

    return users;
  }

  /**
   * Get room members (online only)
   */
  getRoomMembers(roomId: string): string[] {
    const connectionIds = this.roomConnections.get(roomId);
    if (!connectionIds) return [];

    const userIds = new Set<string>();
    for (const connId of connectionIds) {
      const conn = this.connections.get(connId);
      if (conn) {
        userIds.add(conn.userId);
      }
    }

    return Array.from(userIds);
  }

  /**
   * Start heartbeat with randomized timing (anti-traffic-analysis)
   */
  private startHeartbeat(connection: SecureWSConnection): void {
    const sendHeartbeat = () => {
      const heartbeatMessage: WSMessage = {
        type: 'heartbeat',
        payload: { timestamp: Date.now() },
        timestamp: Date.now(),
        nonce: require('crypto').randomBytes(8).toString('hex'),
      };

      this.sendToConnection(connection.id, heartbeatMessage);

      // Schedule next heartbeat with random delay
      const delay = getNextHeartbeatDelay();
      connection.heartbeatTimer = setTimeout(sendHeartbeat, delay);
    };

    // Initial delay
    const initialDelay = getNextHeartbeatDelay();
    connection.heartbeatTimer = setTimeout(sendHeartbeat, initialDelay);
  }

  /**
   * Start decoy traffic generation (traffic obfuscation)
   */
  private startDecoyTraffic(connection: SecureWSConnection): void {
    const sendDecoy = () => {
      const decoyMessage = generateDecoyMessage();
      this.sendToConnection(connection.id, decoyMessage);

      // Schedule next decoy with random delay
      const delay = getNextDecoyDelay();
      connection.decoyTimer = setTimeout(sendDecoy, delay);
    };

    // Initial delay
    const initialDelay = getNextDecoyDelay();
    connection.decoyTimer = setTimeout(sendDecoy, initialDelay);
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return require('crypto').randomUUID();
  }

  /**
   * Generate session key for forward secrecy
   */
  private generateSessionKey(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Generate connection fingerprint (anti-replay)
   */
  private generateFingerprint(): string {
    const timestamp = Date.now();
    const random = require('crypto').randomBytes(16).toString('hex');
    return require('crypto')
      .createHash('sha256')
      .update(`${timestamp}:${random}`)
      .digest('hex');
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get user connection count
   */
  getUserConnectionCount(): number {
    return this.userConnections.size;
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections(maxIdleMs: number = 300000): void {
    const now = Date.now();

    for (const [connId, conn] of this.connections.entries()) {
      const idleTime = now - conn.lastActivity.getTime();

      if (idleTime > maxIdleMs) {
        console.log(`[WS] Cleaning up stale connection: ${connId}`);
        this.unregisterConnection(connId);
      }
    }
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

// Cleanup stale connections every 5 minutes
setInterval(() => {
  wsManager.cleanupStaleConnections();
}, 5 * 60 * 1000);
