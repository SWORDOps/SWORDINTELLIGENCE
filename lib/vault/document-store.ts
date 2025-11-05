/**
 * Document Vault Storage
 *
 * In-memory storage for encrypted documents with metadata.
 * In production, this would be replaced with:
 * - PostgreSQL for metadata
 * - MinIO/S3 for encrypted blobs
 * - Append-only audit logs
 */

import type { DilithiumSignature } from '../crypto/pqc';

export type TLP = 'RED' | 'AMBER' | 'GREEN' | 'WHITE'; // Traffic Light Protocol
export type Classification = 'TOP SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'RESTRICTED' | 'UNCLASSIFIED';

export interface EncryptedDocument {
  // Identity
  id: string;
  filename: string;
  mimeType: string;
  size: number; // Original file size

  // Encryption metadata
  encryptionMode: 'kyber' | 'hybrid';
  encryptedSize: number;
  encryptedAt: Date;
  encryptedBy: string; // User ID
  keyFingerprint: string; // Hash of public key used

  // Classification
  classification: Classification;
  tlp: TLP;
  caveats?: string[]; // e.g., ['NOFORN', 'ORCON', 'RELTO USA, GBR']

  // Post-Quantum Signature
  signature: DilithiumSignature;

  // Storage
  storageKey: string; // Key in blob storage
  sha256Hash: string; // Hash of original file

  // Access control
  ownerId: string;
  allowedUsers: string[];
  expiresAt?: Date; // Auto-delete after this date

  // Audit trail
  accessLog: DocumentAccessLog[];
  uploadedAt: Date;
  lastAccessedAt?: Date;

  // Engagement tracking
  engagementId?: string;
  tags: string[];
}

export interface DocumentAccessLog {
  userId: string;
  action: 'view' | 'download' | 'share' | 'delete' | 'modify';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface EncryptedBlob {
  documentId: string;
  encryptedData: Buffer;
  metadata: {
    ciphertext: Buffer;  // Kyber ciphertext
    iv: Buffer;
    authTag: Buffer;
  };
}

/**
 * In-memory document store
 * Replace with database in production
 */
class DocumentStore {
  private documents: Map<string, EncryptedDocument> = new Map();
  private blobs: Map<string, EncryptedBlob> = new Map();
  private userDocuments: Map<string, Set<string>> = new Map(); // userId -> documentIds

  /**
   * Store a new encrypted document
   */
  addDocument(document: EncryptedDocument): void {
    this.documents.set(document.id, document);

    // Index by owner
    if (!this.userDocuments.has(document.ownerId)) {
      this.userDocuments.set(document.ownerId, new Set());
    }
    this.userDocuments.get(document.ownerId)!.add(document.id);

    // Index by allowed users
    for (const userId of document.allowedUsers) {
      if (!this.userDocuments.has(userId)) {
        this.userDocuments.set(userId, new Set());
      }
      this.userDocuments.get(userId)!.add(document.id);
    }
  }

  /**
   * Store encrypted blob data
   */
  addBlob(blob: EncryptedBlob): void {
    this.blobs.set(blob.documentId, blob);
  }

  /**
   * Get document metadata by ID
   */
  getDocument(documentId: string): EncryptedDocument | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Get encrypted blob by document ID
   */
  getBlob(documentId: string): EncryptedBlob | undefined {
    return this.blobs.get(documentId);
  }

  /**
   * Get all documents accessible to a user
   */
  getUserDocuments(userId: string): EncryptedDocument[] {
    const documentIds = this.userDocuments.get(userId);
    if (!documentIds) {
      return [];
    }

    const documents: EncryptedDocument[] = [];
    for (const docId of documentIds) {
      const doc = this.documents.get(docId);
      if (doc) {
        // Check if not expired
        if (!doc.expiresAt || doc.expiresAt > new Date()) {
          documents.push(doc);
        }
      }
    }

    // Sort by upload date (newest first)
    return documents.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  /**
   * Log access to a document
   */
  logAccess(
    documentId: string,
    userId: string,
    action: DocumentAccessLog['action'],
    metadata?: { ipAddress?: string; userAgent?: string }
  ): void {
    const document = this.documents.get(documentId);
    if (!document) {
      return;
    }

    const logEntry: DocumentAccessLog = {
      userId,
      action,
      timestamp: new Date(),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    };

    document.accessLog.push(logEntry);
    document.lastAccessedAt = new Date();
  }

  /**
   * Check if user has access to document
   */
  canAccess(documentId: string, userId: string): boolean {
    const document = this.documents.get(documentId);
    if (!document) {
      return false;
    }

    // Check ownership
    if (document.ownerId === userId) {
      return true;
    }

    // Check allowed users
    if (document.allowedUsers.includes(userId)) {
      return true;
    }

    return false;
  }

  /**
   * Share document with additional users
   */
  shareDocument(documentId: string, userIds: string[]): void {
    const document = this.documents.get(documentId);
    if (!document) {
      return;
    }

    for (const userId of userIds) {
      if (!document.allowedUsers.includes(userId)) {
        document.allowedUsers.push(userId);

        // Update index
        if (!this.userDocuments.has(userId)) {
          this.userDocuments.set(userId, new Set());
        }
        this.userDocuments.get(userId)!.add(documentId);
      }
    }
  }

  /**
   * Delete document (mark as deleted, keep metadata for audit)
   */
  deleteDocument(documentId: string): boolean {
    const document = this.documents.get(documentId);
    if (!document) {
      return false;
    }

    // Remove blob
    this.blobs.delete(documentId);

    // Keep metadata for audit trail
    // In production, move to archived_documents table

    return true;
  }

  /**
   * Get access log for a document
   */
  getAccessLog(documentId: string): DocumentAccessLog[] {
    const document = this.documents.get(documentId);
    return document?.accessLog || [];
  }

  /**
   * Get documents by classification level
   */
  getDocumentsByClassification(
    userId: string,
    classification: Classification
  ): EncryptedDocument[] {
    const userDocs = this.getUserDocuments(userId);
    return userDocs.filter((doc) => doc.classification === classification);
  }

  /**
   * Get documents by TLP color
   */
  getDocumentsByTLP(userId: string, tlp: TLP): EncryptedDocument[] {
    const userDocs = this.getUserDocuments(userId);
    return userDocs.filter((doc) => doc.tlp === tlp);
  }

  /**
   * Search documents by tags
   */
  searchByTags(userId: string, tags: string[]): EncryptedDocument[] {
    const userDocs = this.getUserDocuments(userId);
    return userDocs.filter((doc) =>
      tags.some((tag) => doc.tags.includes(tag))
    );
  }

  /**
   * Get documents by engagement
   */
  getEngagementDocuments(userId: string, engagementId: string): EncryptedDocument[] {
    const userDocs = this.getUserDocuments(userId);
    return userDocs.filter((doc) => doc.engagementId === engagementId);
  }

  /**
   * Clean up expired documents (cron job)
   */
  cleanupExpired(): number {
    let deletedCount = 0;
    const now = new Date();

    for (const [docId, doc] of this.documents.entries()) {
      if (doc.expiresAt && doc.expiresAt <= now) {
        this.deleteDocument(docId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get storage statistics
   */
  getStats() {
    const totalDocuments = this.documents.size;
    let totalSize = 0;
    let totalEncryptedSize = 0;

    for (const doc of this.documents.values()) {
      totalSize += doc.size;
      totalEncryptedSize += doc.encryptedSize;
    }

    const classificationBreakdown: Record<Classification, number> = {
      'TOP SECRET': 0,
      'SECRET': 0,
      'CONFIDENTIAL': 0,
      'RESTRICTED': 0,
      'UNCLASSIFIED': 0,
    };

    for (const doc of this.documents.values()) {
      classificationBreakdown[doc.classification]++;
    }

    return {
      totalDocuments,
      totalSize,
      totalEncryptedSize,
      compressionRatio: totalSize > 0 ? totalEncryptedSize / totalSize : 0,
      classificationBreakdown,
    };
  }
}

// Singleton instance
export const documentStore = new DocumentStore();
