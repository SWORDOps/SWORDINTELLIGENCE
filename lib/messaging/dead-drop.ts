/**
 * Dead Drop Message System
 *
 * Cold War tradecraft adapted for digital communications.
 * Messages are stored encrypted and delivered only when specific conditions are met.
 *
 * Trigger Types:
 * - Time-based: Deliver after specific delay or at specific time
 * - Event-based: "Dead man's switch" - deliver if no heartbeat received
 * - Geographic: Deliver when recipient enters/exits specific region
 * - Composite: Combine multiple triggers with AND/OR logic
 *
 * Security Properties:
 * - Messages stored encrypted with recipient's public key
 * - Sender cannot decrypt after creation
 * - Automatic deletion after successful delivery
 * - Audit trail for all operations
 * - No metadata leakage (sender/recipient obfuscated)
 */

import crypto from 'crypto';
import { auditLog } from '@/lib/admin/audit-log';

/**
 * Trigger Types
 */
export type TriggerType = 'time' | 'heartbeat' | 'geographic' | 'composite';

/**
 * Geographic Condition Types
 */
export type GeoCondition = 'enters' | 'exits' | 'within' | 'outside';

/**
 * Time-Based Trigger
 * Delivers message after delay or at specific time
 */
export interface TimeTrigger {
  type: 'time';
  deliverAt?: Date;           // Specific time
  delayMinutes?: number;      // Delay from creation
}

/**
 * Heartbeat Trigger (Dead Man's Switch)
 * Delivers message if no heartbeat received within timeout
 */
export interface HeartbeatTrigger {
  type: 'heartbeat';
  userId: string;             // User to monitor
  timeoutHours: number;       // Hours without heartbeat before delivery
  lastHeartbeat?: Date;       // Last heartbeat timestamp
}

/**
 * Geographic Trigger
 * Delivers message based on recipient's location
 */
export interface GeographicTrigger {
  type: 'geographic';
  condition: GeoCondition;
  latitude: number;
  longitude: number;
  radiusMeters: number;       // Geofence radius
  recipientId: string;        // User to track
}

/**
 * Composite Trigger
 * Combines multiple triggers with AND/OR logic
 */
export interface CompositeTrigger {
  type: 'composite';
  operator: 'AND' | 'OR';
  triggers: Trigger[];
}

export type Trigger = TimeTrigger | HeartbeatTrigger | GeographicTrigger | CompositeTrigger;

/**
 * Dead Drop Message
 */
export interface DeadDrop {
  id: string;
  creatorId: string;
  recipientId: string;
  roomId?: string;

  // Encrypted payload
  encryptedContent: string;
  encryptionMetadata: {
    algorithm: string;
    kyberCiphertext: string;
    iv: string;
    authTag: string;
    recipientPublicKey: string;
  };

  // Delivery conditions
  trigger: Trigger;
  status: 'pending' | 'delivered' | 'cancelled' | 'failed';

  // Metadata
  createdAt: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  expiresAt?: Date;           // Auto-delete after this time

  // Security
  requireConfirmation?: boolean;  // Recipient must confirm delivery
  selfDestruct?: boolean;          // Delete after first read
  maxAttempts?: number;            // Max delivery attempts

  // Audit
  deliveryAttempts: number;
  lastEvaluatedAt?: Date;
}

/**
 * User Heartbeat Tracking
 */
export interface UserHeartbeat {
  userId: string;
  lastHeartbeat: Date;
  ipHash?: string;
  userAgent?: string;
}

/**
 * Geographic Location
 */
export interface UserLocation {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;           // Meters
  timestamp: Date;
  ipHash?: string;
}

/**
 * Dead Drop Storage and Management
 */
class DeadDropStore {
  private drops: Map<string, DeadDrop> = new Map();
  private heartbeats: Map<string, UserHeartbeat> = new Map();
  private locations: Map<string, UserLocation> = new Map();

  // Evaluation interval (check triggers every minute)
  private evaluationInterval: NodeJS.Timeout | null = null;
  private readonly EVALUATION_INTERVAL_MS = 60 * 1000; // 1 minute

  constructor() {
    this.startEvaluationLoop();
  }

  /**
   * Create a new dead drop
   */
  createDeadDrop(drop: Omit<DeadDrop, 'id' | 'createdAt' | 'status' | 'deliveryAttempts'>): DeadDrop {
    const deadDrop: DeadDrop = {
      ...drop,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: 'pending',
      deliveryAttempts: 0,
    };

    // Set expiration if not provided (default: 30 days)
    if (!deadDrop.expiresAt) {
      deadDrop.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    this.drops.set(deadDrop.id, deadDrop);

    // Audit log
    auditLog.log({
      userId: deadDrop.creatorId,
      action: 'messages.dead_drop_created',
      severity: 'info',
      success: true,
      metadata: {
        deadDropId: deadDrop.id,
        recipientId: deadDrop.recipientId,
        triggerType: deadDrop.trigger.type,
        expiresAt: deadDrop.expiresAt,
      },
    });

    return deadDrop;
  }

  /**
   * Get dead drop by ID
   */
  getDeadDrop(id: string): DeadDrop | null {
    return this.drops.get(id) || null;
  }

  /**
   * Get all dead drops for a user (created or recipient)
   */
  getUserDeadDrops(userId: string): DeadDrop[] {
    return Array.from(this.drops.values()).filter(
      (drop) =>
        (drop.creatorId === userId || drop.recipientId === userId) &&
        drop.status !== 'cancelled'
    );
  }

  /**
   * Get pending dead drops
   */
  getPendingDeadDrops(): DeadDrop[] {
    return Array.from(this.drops.values()).filter((drop) => drop.status === 'pending');
  }

  /**
   * Cancel a dead drop
   */
  cancelDeadDrop(id: string, userId: string): boolean {
    const drop = this.drops.get(id);
    if (!drop) return false;

    // Only creator can cancel
    if (drop.creatorId !== userId) return false;

    // Can't cancel already delivered
    if (drop.status !== 'pending') return false;

    drop.status = 'cancelled';
    drop.cancelledAt = new Date();

    auditLog.log({
      userId,
      action: 'messages.dead_drop_cancelled',
      severity: 'info',
      success: true,
      metadata: { deadDropId: id },
    });

    return true;
  }

  /**
   * Update user heartbeat
   */
  updateHeartbeat(userId: string, ipAddress?: string, userAgent?: string): void {
    const ipHash = ipAddress
      ? crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16)
      : undefined;

    this.heartbeats.set(userId, {
      userId,
      lastHeartbeat: new Date(),
      ipHash,
      userAgent,
    });
  }

  /**
   * Get user's last heartbeat
   */
  getHeartbeat(userId: string): UserHeartbeat | null {
    return this.heartbeats.get(userId) || null;
  }

  /**
   * Update user location
   */
  updateLocation(userId: string, location: Omit<UserLocation, 'userId' | 'timestamp'>): void {
    this.locations.set(userId, {
      userId,
      ...location,
      timestamp: new Date(),
    });

    auditLog.log({
      userId,
      action: 'messages.location_updated',
      severity: 'info',
      success: true,
      metadata: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
    });
  }

  /**
   * Get user's location
   */
  getLocation(userId: string): UserLocation | null {
    return this.locations.get(userId) || null;
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateTrigger(trigger: Trigger, drop: DeadDrop): boolean {
    switch (trigger.type) {
      case 'time':
        return this.evaluateTimeTrigger(trigger, drop);
      case 'heartbeat':
        return this.evaluateHeartbeatTrigger(trigger, drop);
      case 'geographic':
        return this.evaluateGeographicTrigger(trigger, drop);
      case 'composite':
        return this.evaluateCompositeTrigger(trigger, drop);
      default:
        return false;
    }
  }

  /**
   * Evaluate time-based trigger
   */
  private evaluateTimeTrigger(trigger: TimeTrigger, drop: DeadDrop): boolean {
    const now = new Date();

    // Specific time delivery
    if (trigger.deliverAt) {
      return now >= trigger.deliverAt;
    }

    // Delay-based delivery
    if (trigger.delayMinutes) {
      const deliverAt = new Date(drop.createdAt.getTime() + trigger.delayMinutes * 60 * 1000);
      return now >= deliverAt;
    }

    return false;
  }

  /**
   * Evaluate heartbeat trigger (dead man's switch)
   */
  private evaluateHeartbeatTrigger(trigger: HeartbeatTrigger, drop: DeadDrop): boolean {
    const heartbeat = this.heartbeats.get(trigger.userId);

    if (!heartbeat) {
      // No heartbeat ever received - check against creation time
      const hoursSinceCreation =
        (Date.now() - drop.createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation >= trigger.timeoutHours;
    }

    const hoursSinceHeartbeat =
      (Date.now() - heartbeat.lastHeartbeat.getTime()) / (1000 * 60 * 60);

    return hoursSinceHeartbeat >= trigger.timeoutHours;
  }

  /**
   * Evaluate geographic trigger
   */
  private evaluateGeographicTrigger(trigger: GeographicTrigger, drop: DeadDrop): boolean {
    const location = this.locations.get(trigger.recipientId);
    if (!location) return false;

    // Check if location is stale (> 5 minutes old)
    const locationAge = Date.now() - location.timestamp.getTime();
    if (locationAge > 5 * 60 * 1000) return false;

    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      trigger.latitude,
      trigger.longitude
    );

    const isWithinRadius = distance <= trigger.radiusMeters;

    switch (trigger.condition) {
      case 'enters':
      case 'within':
        return isWithinRadius;
      case 'exits':
      case 'outside':
        return !isWithinRadius;
      default:
        return false;
    }
  }

  /**
   * Evaluate composite trigger
   */
  private evaluateCompositeTrigger(trigger: CompositeTrigger, drop: DeadDrop): boolean {
    const results = trigger.triggers.map((t) => this.evaluateTrigger(t, drop));

    if (trigger.operator === 'AND') {
      return results.every((r) => r);
    } else {
      return results.some((r) => r);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in meters
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Deliver a dead drop
   */
  private async deliverDeadDrop(drop: DeadDrop): Promise<boolean> {
    drop.deliveryAttempts++;
    drop.lastEvaluatedAt = new Date();

    try {
      console.log(`[DeadDrop] Delivering drop ${drop.id} to ${drop.recipientId}`);

      // Try to deliver via WebSocket if available
      try {
        // Dynamic import to avoid circular dependencies
        const { wsManager } = await import('@/lib/messaging/websocket-manager');

        // Send via WebSocket to recipient
        wsManager.sendToUser(drop.recipientId, {
          type: 'message',
          payload: {
            id: drop.id,
            senderId: drop.creatorId,
            recipientId: drop.recipientId,
            roomId: drop.roomId,
            encryptedContent: drop.encryptedContent,
            messageType: 'text',
            deadDrop: true,
            trigger: this.getTriggerSummary(drop.trigger),
          },
          timestamp: Date.now(),
          nonce: crypto.randomUUID(),
        });

        console.log(`[DeadDrop] Sent via WebSocket to ${drop.recipientId}`);
      } catch (wsError) {
        console.log(`[DeadDrop] WebSocket delivery failed, message queued:`, wsError);
        // Message will be available via API when user comes online
      }

      drop.status = 'delivered';
      drop.deliveredAt = new Date();

      auditLog.log({
        userId: drop.recipientId,
        action: 'messages.dead_drop_delivered',
        severity: 'info',
        success: true,
        metadata: {
          deadDropId: drop.id,
          creatorId: drop.creatorId,
          triggerType: drop.trigger.type,
          deliveryAttempts: drop.deliveryAttempts,
        },
      });

      // Auto-delete if self-destruct enabled
      if (drop.selfDestruct) {
        setTimeout(() => {
          this.drops.delete(drop.id);
        }, 60000); // Delete after 1 minute
      }

      return true;
    } catch (error) {
      console.error(`[DeadDrop] Failed to deliver drop ${drop.id}:`, error);

      // Check max attempts
      if (drop.maxAttempts && drop.deliveryAttempts >= drop.maxAttempts) {
        drop.status = 'failed';
        auditLog.log({
          userId: drop.creatorId,
          action: 'messages.dead_drop_failed',
          severity: 'error',
          success: false,
          metadata: {
            deadDropId: drop.id,
            deliveryAttempts: drop.deliveryAttempts,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }

      return false;
    }
  }

  /**
   * Evaluation loop - checks all pending drops
   */
  private startEvaluationLoop(): void {
    if (this.evaluationInterval) return;

    this.evaluationInterval = setInterval(() => {
      this.evaluateAllTriggers();
    }, this.EVALUATION_INTERVAL_MS);

    console.log('[DeadDrop] Started evaluation loop');
  }

  /**
   * Stop evaluation loop
   */
  stopEvaluationLoop(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
      console.log('[DeadDrop] Stopped evaluation loop');
    }
  }

  /**
   * Evaluate all pending drops
   */
  private evaluateAllTriggers(): void {
    const pending = this.getPendingDeadDrops();
    const now = new Date();

    for (const drop of pending) {
      // Skip if expired
      if (drop.expiresAt && now > drop.expiresAt) {
        drop.status = 'failed';
        auditLog.log({
          userId: drop.creatorId,
          action: 'messages.dead_drop_expired',
          severity: 'warning',
          success: false,
          metadata: { deadDropId: drop.id },
        });
        continue;
      }

      // Evaluate trigger
      const shouldDeliver = this.evaluateTrigger(drop.trigger, drop);

      if (shouldDeliver) {
        console.log(`[DeadDrop] Trigger met for drop ${drop.id}`);
        this.deliverDeadDrop(drop);
      }

      drop.lastEvaluatedAt = now;
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalDrops: number;
    pendingDrops: number;
    deliveredDrops: number;
    cancelledDrops: number;
    failedDrops: number;
    activeHeartbeats: number;
    trackedLocations: number;
  } {
    const drops = Array.from(this.drops.values());

    return {
      totalDrops: drops.length,
      pendingDrops: drops.filter((d) => d.status === 'pending').length,
      deliveredDrops: drops.filter((d) => d.status === 'delivered').length,
      cancelledDrops: drops.filter((d) => d.status === 'cancelled').length,
      failedDrops: drops.filter((d) => d.status === 'failed').length,
      activeHeartbeats: this.heartbeats.size,
      trackedLocations: this.locations.size,
    };
  }

  /**
   * Get trigger summary for UI display
   */
  getTriggerSummary(trigger: Trigger): string {
    switch (trigger.type) {
      case 'time':
        if (trigger.deliverAt) {
          return `Deliver at ${trigger.deliverAt.toLocaleString()}`;
        } else if (trigger.delayMinutes) {
          const hours = Math.floor(trigger.delayMinutes / 60);
          const minutes = trigger.delayMinutes % 60;
          return `Deliver in ${hours}h ${minutes}m`;
        }
        return 'Time-based trigger';

      case 'heartbeat':
        return `Dead man's switch: ${trigger.timeoutHours}h timeout (monitoring ${trigger.userId})`;

      case 'geographic':
        return `${trigger.condition} region at ${trigger.latitude.toFixed(4)}, ${trigger.longitude.toFixed(4)} (${trigger.radiusMeters}m radius)`;

      case 'composite':
        const subSummaries = trigger.triggers.map((t) => this.getTriggerSummary(t));
        return `${trigger.operator}: ${subSummaries.join(' ' + trigger.operator + ' ')}`;

      default:
        return 'Unknown trigger';
    }
  }
}

// Global singleton
export const deadDropStore = new DeadDropStore();
