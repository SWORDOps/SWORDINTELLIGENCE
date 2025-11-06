/**
 * Secure Share Links Storage
 *
 * Time-limited, revocable, cryptographically secure links for sharing
 * documents with external parties without requiring portal accounts.
 */

import crypto from 'crypto';

export interface SecureShareLink {
  // Identity
  shareId: string; // Cryptographic 256-bit token
  documentId: string;
  createdBy: string; // User ID
  createdAt: Date;

  // Expiration
  expiresAt: Date;
  expiresIn: number; // Seconds from creation

  // Access control
  maxAccesses: number; // 0 = unlimited, N = burn after N accesses
  accessCount: number;
  requirePassword: boolean;
  passwordHash?: string; // bcrypt hash
  allowedIPs?: string[]; // CIDR notation

  // Watermarking
  watermark?: string; // Text to embed in downloaded file
  recipientInfo?: {
    name: string;
    email?: string;
    organization?: string;
  };

  // Encryption
  ephemeralKey: Buffer; // One-time encryption key for this share
  encryptedData: Buffer; // Document encrypted with ephemeral key
  iv: Buffer;
  authTag: Buffer;

  // Status
  isRevoked: boolean;
  revokedAt?: Date;
  revokedBy?: string;
  revokeReason?: string;

  // Audit trail
  accessLog: ShareAccessLog[];

  // Metadata
  originalFilename: string;
  mimeType: string;
  fileSize: number;
}

export interface ShareAccessLog {
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  country?: string;
  city?: string;
  success: boolean;
  failureReason?: string;
  downloadCompleted: boolean;
  deviceFingerprint?: string;
}

/**
 * Share link store
 */
class ShareLinkStore {
  private links: Map<string, SecureShareLink> = new Map();
  private documentShares: Map<string, Set<string>> = new Map(); // documentId -> shareIds

  /**
   * Generate cryptographically secure share ID
   */
  private generateShareId(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Create a new secure share link
   */
  createShareLink(params: {
    documentId: string;
    createdBy: string;
    expiresIn: number; // seconds
    maxAccesses?: number;
    password?: string;
    allowedIPs?: string[];
    watermark?: string;
    recipientInfo?: SecureShareLink['recipientInfo'];
    encryptedData: Buffer;
    ephemeralKey: Buffer;
    iv: Buffer;
    authTag: Buffer;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
  }): SecureShareLink {
    const shareId = this.generateShareId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.expiresIn * 1000);

    const shareLink: SecureShareLink = {
      shareId,
      documentId: params.documentId,
      createdBy: params.createdBy,
      createdAt: now,
      expiresAt,
      expiresIn: params.expiresIn,
      maxAccesses: params.maxAccesses || 0,
      accessCount: 0,
      requirePassword: !!params.password,
      passwordHash: params.password
        ? crypto.createHash('sha256').update(params.password).digest('hex')
        : undefined,
      allowedIPs: params.allowedIPs,
      watermark: params.watermark,
      recipientInfo: params.recipientInfo,
      ephemeralKey: params.ephemeralKey,
      encryptedData: params.encryptedData,
      iv: params.iv,
      authTag: params.authTag,
      isRevoked: false,
      accessLog: [],
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
    };

    this.links.set(shareId, shareLink);

    // Index by document
    if (!this.documentShares.has(params.documentId)) {
      this.documentShares.set(params.documentId, new Set());
    }
    this.documentShares.get(params.documentId)!.add(shareId);

    return shareLink;
  }

  /**
   * Get share link by ID
   */
  getShareLink(shareId: string): SecureShareLink | undefined {
    return this.links.get(shareId);
  }

  /**
   * Verify password for share link
   */
  verifyPassword(shareId: string, password: string): boolean {
    const link = this.links.get(shareId);
    if (!link || !link.requirePassword || !link.passwordHash) {
      return false;
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === link.passwordHash;
  }

  /**
   * Check if share link is valid and accessible
   */
  isLinkValid(shareId: string, ipAddress?: string): {
    valid: boolean;
    reason?: string;
  } {
    const link = this.links.get(shareId);

    if (!link) {
      return { valid: false, reason: 'Share link not found' };
    }

    if (link.isRevoked) {
      return { valid: false, reason: 'Share link has been revoked' };
    }

    if (new Date() > link.expiresAt) {
      return { valid: false, reason: 'Share link has expired' };
    }

    if (link.maxAccesses > 0 && link.accessCount >= link.maxAccesses) {
      return { valid: false, reason: 'Maximum access limit reached' };
    }

    if (link.allowedIPs && ipAddress) {
      // Simple IP check (in production, use proper CIDR matching)
      const allowed = link.allowedIPs.some(allowedIP => {
        if (allowedIP.includes('/')) {
          // CIDR range - simplified check
          const [network] = allowedIP.split('/');
          return ipAddress.startsWith(network.substring(0, network.lastIndexOf('.')));
        }
        return ipAddress === allowedIP;
      });

      if (!allowed) {
        return { valid: false, reason: 'IP address not allowed' };
      }
    }

    return { valid: true };
  }

  /**
   * Log access attempt
   */
  logAccess(
    shareId: string,
    log: {
      ipAddress: string;
      userAgent?: string;
      success: boolean;
      failureReason?: string;
      downloadCompleted?: boolean;
      deviceFingerprint?: string;
    }
  ): void {
    const link = this.links.get(shareId);
    if (!link) return;

    link.accessLog.push({
      timestamp: new Date(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      success: log.success,
      failureReason: log.failureReason,
      downloadCompleted: log.downloadCompleted || false,
      deviceFingerprint: log.deviceFingerprint,
    });

    if (log.success) {
      link.accessCount++;
    }
  }

  /**
   * Revoke share link
   */
  revokeLink(shareId: string, revokedBy: string, reason?: string): boolean {
    const link = this.links.get(shareId);
    if (!link) return false;

    link.isRevoked = true;
    link.revokedAt = new Date();
    link.revokedBy = revokedBy;
    link.revokeReason = reason;

    return true;
  }

  /**
   * Get all share links for a document
   */
  getDocumentShares(documentId: string): SecureShareLink[] {
    const shareIds = this.documentShares.get(documentId);
    if (!shareIds) return [];

    const links: SecureShareLink[] = [];
    for (const shareId of shareIds) {
      const link = this.links.get(shareId);
      if (link) links.push(link);
    }

    return links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get shares created by user
   */
  getUserShares(userId: string): SecureShareLink[] {
    const links: SecureShareLink[] = [];
    for (const link of this.links.values()) {
      if (link.createdBy === userId) {
        links.push(link);
      }
    }
    return links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clean up expired shares (cron job)
   */
  cleanupExpired(): number {
    let deletedCount = 0;
    const now = new Date();

    for (const [shareId, link] of this.links.entries()) {
      if (link.expiresAt <= now) {
        // Don't delete immediately - keep for audit trail
        // In production, move to archived_shares table
        if (link.expiresAt.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
          // Delete after 30 days past expiration
          this.links.delete(shareId);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Get statistics
   */
  getStats() {
    let totalShares = 0;
    let activeShares = 0;
    let expiredShares = 0;
    let revokedShares = 0;
    let totalAccesses = 0;

    const now = new Date();

    for (const link of this.links.values()) {
      totalShares++;
      totalAccesses += link.accessCount;

      if (link.isRevoked) {
        revokedShares++;
      } else if (link.expiresAt <= now) {
        expiredShares++;
      } else {
        activeShares++;
      }
    }

    return {
      totalShares,
      activeShares,
      expiredShares,
      revokedShares,
      totalAccesses,
      averageAccessesPerLink: totalShares > 0 ? totalAccesses / totalShares : 0,
    };
  }
}

// Singleton instance
export const shareLinkStore = new ShareLinkStore();
