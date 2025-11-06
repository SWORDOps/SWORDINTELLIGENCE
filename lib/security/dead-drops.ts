import crypto from 'crypto';

/**
 * Dead Drop System
 *
 * Anonymous, time-limited file storage using steganography.
 * Classic intelligence tradecraft for covert communication.
 *
 * Features:
 * - No authentication required
 * - Files hidden in images via steganography
 * - Time-limited availability (auto-destruction)
 * - Password-protected retrieval
 * - Plausible deniability (looks like normal images)
 * - Burn after reading option
 */

export type DeadDropStatus = 'active' | 'retrieved' | 'expired' | 'burned';

export interface DeadDrop {
  // Identity
  dropId: string; // Cryptographic ID
  codename: string; // User-friendly codename (e.g., "DARKWATER-7721")

  // Timing
  createdAt: Date;
  expiresAt: Date;
  ttl: number; // Time to live in seconds

  // Access
  password: string; // Plain password (in prod, hash this)
  passwordHint?: string;
  maxRetrievals: number; // 0 = unlimited, N = burn after N
  retrievalCount: number;
  burnAfterReading: boolean;

  // Status
  status: DeadDropStatus;
  firstRetrievedAt?: Date;
  lastRetrievedAt?: Date;

  // Steganography
  coverImage: Buffer; // Original cover image with embedded data
  coverImageType: 'generated' | 'uploaded';
  payloadSize: number;
  encrypted: boolean;

  // Metadata
  originalFilename?: string;
  mimeType?: string;
  tags: string[];

  // Audit
  uploads: DeadDropEvent[];
  retrievals: DeadDropEvent[];
}

export interface DeadDropEvent {
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  country?: string;
  eventType: 'upload' | 'retrieval' | 'failed_password' | 'expired' | 'burned';
}

/**
 * Dead Drop Store
 */
class DeadDropStore {
  private drops: Map<string, DeadDrop> = new Map();
  private codenameIndex: Map<string, string> = new Map(); // codename -> dropId

  /**
   * Generate cryptographic drop ID
   */
  private generateDropId(): string {
    return crypto.randomBytes(24).toString('base64url');
  }

  /**
   * Generate memorable codename
   * Format: ADJECTIVE-NOUN-NNNN
   */
  private generateCodename(): string {
    const adjectives = [
      'DARK', 'SILENT', 'SHADOW', 'GHOST', 'PHANTOM', 'STEEL', 'IRON',
      'SILVER', 'GOLD', 'BLACK', 'WHITE', 'RED', 'BLUE', 'GREEN',
      'SWIFT', 'QUICK', 'COLD', 'HOT', 'DEEP', 'HIGH',
    ];

    const nouns = [
      'WATER', 'FIRE', 'WIND', 'STONE', 'WOLF', 'EAGLE', 'TIGER',
      'DRAGON', 'SWORD', 'SHIELD', 'ARROW', 'THUNDER', 'LIGHTNING',
      'MOUNTAIN', 'OCEAN', 'RIVER', 'FOREST', 'DESERT', 'STORM',
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `${adjective}-${noun}-${number}`;
  }

  /**
   * Create a new dead drop
   */
  createDrop(params: {
    coverImage: Buffer;
    coverImageType: 'generated' | 'uploaded';
    payloadSize: number;
    encrypted: boolean;
    password: string;
    passwordHint?: string;
    ttl?: number; // Seconds (default 24 hours)
    maxRetrievals?: number;
    burnAfterReading?: boolean;
    originalFilename?: string;
    mimeType?: string;
    tags?: string[];
    ipAddress: string;
    userAgent?: string;
  }): DeadDrop {
    const dropId = this.generateDropId();
    const codename = this.generateCodename();
    const now = new Date();
    const ttl = params.ttl || 86400; // Default 24 hours
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const drop: DeadDrop = {
      dropId,
      codename,
      createdAt: now,
      expiresAt,
      ttl,
      password: params.password,
      passwordHint: params.passwordHint,
      maxRetrievals: params.maxRetrievals || 0,
      retrievalCount: 0,
      burnAfterReading: params.burnAfterReading || false,
      status: 'active',
      coverImage: params.coverImage,
      coverImageType: params.coverImageType,
      payloadSize: params.payloadSize,
      encrypted: params.encrypted,
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      tags: params.tags || [],
      uploads: [
        {
          timestamp: now,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          eventType: 'upload',
        },
      ],
      retrievals: [],
    };

    this.drops.set(dropId, drop);
    this.codenameIndex.set(codename, dropId);

    console.log(
      `🕵️  Dead drop created: ${codename} (${dropId}) - ` +
      `${payloadSize} bytes, expires in ${Math.floor(ttl / 3600)}h`
    );

    return drop;
  }

  /**
   * Get drop by ID or codename
   */
  getDrop(identifier: string): DeadDrop | undefined {
    // Try as dropId first
    let drop = this.drops.get(identifier);

    // Try as codename
    if (!drop) {
      const dropId = this.codenameIndex.get(identifier.toUpperCase());
      if (dropId) {
        drop = this.drops.get(dropId);
      }
    }

    return drop;
  }

  /**
   * Verify password for drop
   */
  verifyPassword(identifier: string, password: string): boolean {
    const drop = this.getDrop(identifier);
    if (!drop) return false;

    return drop.password === password;
  }

  /**
   * Check if drop is accessible
   */
  isDropAccessible(identifier: string): {
    accessible: boolean;
    reason?: string;
    drop?: DeadDrop;
  } {
    const drop = this.getDrop(identifier);

    if (!drop) {
      return { accessible: false, reason: 'Dead drop not found' };
    }

    // Check expiration
    if (drop.expiresAt < new Date()) {
      drop.status = 'expired';
      return { accessible: false, reason: 'Dead drop has expired', drop };
    }

    // Check status
    if (drop.status === 'burned') {
      return { accessible: false, reason: 'Dead drop has been burned', drop };
    }

    if (drop.status === 'expired') {
      return { accessible: false, reason: 'Dead drop has expired', drop };
    }

    // Check retrieval limit
    if (drop.maxRetrievals > 0 && drop.retrievalCount >= drop.maxRetrievals) {
      drop.status = 'burned';
      return {
        accessible: false,
        reason: 'Dead drop has reached maximum retrievals',
        drop,
      };
    }

    return { accessible: true, drop };
  }

  /**
   * Retrieve dead drop (increments counter, may burn)
   */
  retrieveDrop(
    identifier: string,
    password: string,
    ipAddress: string,
    userAgent?: string
  ): {
    success: boolean;
    drop?: DeadDrop;
    reason?: string;
  } {
    const accessCheck = this.isDropAccessible(identifier);

    if (!accessCheck.accessible || !accessCheck.drop) {
      return {
        success: false,
        reason: accessCheck.reason,
      };
    }

    const drop = accessCheck.drop;

    // Verify password
    if (!this.verifyPassword(identifier, password)) {
      // Log failed attempt
      drop.retrievals.push({
        timestamp: new Date(),
        ipAddress,
        userAgent,
        eventType: 'failed_password',
      });

      return {
        success: false,
        reason: 'Invalid password',
      };
    }

    // Log successful retrieval
    drop.retrievals.push({
      timestamp: new Date(),
      ipAddress,
      userAgent,
      eventType: 'retrieval',
    });

    drop.retrievalCount++;
    drop.lastRetrievedAt = new Date();

    if (!drop.firstRetrievedAt) {
      drop.firstRetrievedAt = new Date();
      drop.status = 'retrieved';
    }

    // Check if should burn
    const shouldBurn =
      drop.burnAfterReading ||
      (drop.maxRetrievals > 0 && drop.retrievalCount >= drop.maxRetrievals);

    if (shouldBurn) {
      drop.status = 'burned';
      console.log(`🔥 Dead drop burned: ${drop.codename} (${drop.retrievalCount} retrievals)`);

      // Schedule cleanup after a short delay
      setTimeout(() => {
        this.deleteDrop(drop.dropId);
      }, 60000); // 1 minute delay before physical deletion
    }

    console.log(
      `✓ Dead drop retrieved: ${drop.codename} by ${ipAddress} ` +
      `(${drop.retrievalCount}/${drop.maxRetrievals || '∞'})${shouldBurn ? ' - BURNED' : ''}`
    );

    return {
      success: true,
      drop,
    };
  }

  /**
   * Delete dead drop
   */
  deleteDrop(dropId: string): boolean {
    const drop = this.drops.get(dropId);
    if (!drop) return false;

    this.drops.delete(dropId);
    this.codenameIndex.delete(drop.codename);

    console.log(`🗑️  Dead drop deleted: ${drop.codename}`);
    return true;
  }

  /**
   * Get active drops (for admin/monitoring)
   */
  getActiveDrops(): DeadDrop[] {
    return Array.from(this.drops.values()).filter(d => d.status === 'active');
  }

  /**
   * Cleanup expired drops (run periodically)
   */
  cleanupExpired(): number {
    const now = new Date();
    let cleaned = 0;

    for (const drop of this.drops.values()) {
      if (drop.expiresAt < now && drop.status !== 'burned') {
        drop.status = 'expired';
        this.deleteDrop(drop.dropId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired dead drops`);
    }

    return cleaned;
  }

  /**
   * Get statistics
   */
  getStats() {
    const drops = Array.from(this.drops.values());

    return {
      total: drops.length,
      active: drops.filter(d => d.status === 'active').length,
      retrieved: drops.filter(d => d.status === 'retrieved').length,
      expired: drops.filter(d => d.status === 'expired').length,
      burned: drops.filter(d => d.status === 'burned').length,
      totalRetrievals: drops.reduce((sum, d) => sum + d.retrievalCount, 0),
      totalPayloadSize: drops.reduce((sum, d) => sum + d.payloadSize, 0),
    };
  }
}

// Singleton instance
export const deadDropStore = new DeadDropStore();

// Cleanup expired drops every 5 minutes
setInterval(() => {
  deadDropStore.cleanupExpired();
}, 5 * 60 * 1000);
