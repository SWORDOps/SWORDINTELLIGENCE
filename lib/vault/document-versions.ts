import crypto from 'crypto';
import { DilithiumSignature } from '../crypto/pqc';

/**
 * Document version status
 */
export type VersionStatus = 'DRAFT' | 'REVIEW' | 'FINAL' | 'AMENDED' | 'REDACTED' | 'SUPERSEDED';

/**
 * A single version of a document with cryptographic chain-of-custody
 */
export interface DocumentVersion {
  versionId: string; // UUID
  documentId: string; // Parent document ID
  versionNumber: number; // Sequential version number (1, 2, 3...)
  filename: string;
  fileSize: number;
  mimeType: string;

  // Cryptographic chain
  contentHash: string; // SHA-256 hash of decrypted content
  previousVersionHash?: string; // Hash of previous version's contentHash (blockchain-style)
  chainHash: string; // Hash of (contentHash + previousVersionHash)
  signature: DilithiumSignature; // Dilithium-3 signature of chainHash

  // Version metadata
  status: VersionStatus;
  createdAt: Date;
  createdBy: string; // User ID
  comment?: string; // Version comment (e.g., "Fixed typos", "Added section 3")
  tags: string[];

  // Change tracking
  changedBy: string;
  changeReason?: string;

  // Storage (encrypted with same keys as parent document)
  encryptedData: Buffer;
  iv: Buffer;
  authTag: Buffer;
  ciphertext: Buffer; // Kyber ciphertext
}

/**
 * Version comparison/diff result
 */
export interface VersionDiff {
  fromVersion: number;
  toVersion: number;
  fromHash: string;
  toHash: string;
  sizeChange: number; // Bytes
  diffSummary?: string;
  changes?: {
    added?: number;
    removed?: number;
    modified?: number;
  };
}

/**
 * Chain-of-custody verification result
 */
export interface ChainVerification {
  valid: boolean;
  totalVersions: number;
  verifiedVersions: number;
  brokenLinks: Array<{
    versionNumber: number;
    reason: string;
  }>;
  signatureFailures: Array<{
    versionNumber: number;
    versionId: string;
  }>;
}

/**
 * Version statistics
 */
export interface VersionStats {
  totalDocuments: number;
  totalVersions: number;
  averageVersionsPerDocument: number;
  totalStorageUsed: number;
  versionsByStatus: Record<VersionStatus, number>;
  largestChain: {
    documentId: string;
    versionCount: number;
  };
}

/**
 * Document Version Store
 * Manages document versions with blockchain-style cryptographic chain-of-custody
 */
class DocumentVersionStore {
  private versions: Map<string, DocumentVersion> = new Map(); // versionId -> version
  private documentVersions: Map<string, string[]> = new Map(); // documentId -> versionIds[]

  /**
   * Add a new version to a document
   */
  addVersion(version: DocumentVersion): void {
    // Validate chain integrity before adding
    if (version.versionNumber > 1) {
      const previousVersion = this.getVersion(
        this.getDocumentVersions(version.documentId)[version.versionNumber - 2]
      );

      if (!previousVersion) {
        throw new Error('Previous version not found - cannot maintain chain integrity');
      }

      // Verify previousVersionHash matches
      if (version.previousVersionHash !== previousVersion.contentHash) {
        throw new Error('Version chain broken - previousVersionHash mismatch');
      }

      // Verify chainHash
      const expectedChainHash = crypto
        .createHash('sha256')
        .update(version.contentHash)
        .update(version.previousVersionHash!)
        .digest('hex');

      if (version.chainHash !== expectedChainHash) {
        throw new Error('Invalid chainHash - cryptographic integrity check failed');
      }
    } else {
      // First version - verify chainHash is just contentHash
      const expectedChainHash = crypto
        .createHash('sha256')
        .update(version.contentHash)
        .digest('hex');

      if (version.chainHash !== expectedChainHash) {
        throw new Error('Invalid chainHash for first version');
      }
    }

    this.versions.set(version.versionId, version);

    // Add to document's version list
    const docVersions = this.documentVersions.get(version.documentId) || [];
    docVersions.push(version.versionId);
    this.documentVersions.set(version.documentId, docVersions);

    console.log(
      `✓ Version ${version.versionNumber} added to document ${version.documentId} ` +
      `(chainHash: ${version.chainHash.substring(0, 8)}...)`
    );
  }

  /**
   * Get a specific version by ID
   */
  getVersion(versionId: string): DocumentVersion | undefined {
    return this.versions.get(versionId);
  }

  /**
   * Get all versions of a document (ordered by version number)
   */
  getDocumentVersions(documentId: string): string[] {
    return this.documentVersions.get(documentId) || [];
  }

  /**
   * Get the latest version of a document
   */
  getLatestVersion(documentId: string): DocumentVersion | undefined {
    const versionIds = this.getDocumentVersions(documentId);
    if (versionIds.length === 0) return undefined;

    return this.versions.get(versionIds[versionIds.length - 1]);
  }

  /**
   * Get a specific version number
   */
  getVersionByNumber(documentId: string, versionNumber: number): DocumentVersion | undefined {
    const versionIds = this.getDocumentVersions(documentId);
    if (versionNumber < 1 || versionNumber > versionIds.length) return undefined;

    return this.versions.get(versionIds[versionNumber - 1]);
  }

  /**
   * Get version history metadata (without encrypted data)
   */
  getVersionHistory(documentId: string): Array<Omit<DocumentVersion, 'encryptedData' | 'signature'>> {
    const versionIds = this.getDocumentVersions(documentId);

    return versionIds.map(versionId => {
      const version = this.versions.get(versionId)!;

      // Return metadata only (no encrypted data or full signature)
      const { encryptedData, signature, ...metadata } = version;

      return {
        ...metadata,
        signature: {
          value: signature.value.slice(0, 32), // Truncate signature for metadata
          publicKey: signature.publicKey.slice(0, 32),
        } as DilithiumSignature,
      };
    });
  }

  /**
   * Verify the entire chain-of-custody for a document
   */
  async verifyChain(
    documentId: string,
    verifySignature: (chainHash: string, signature: DilithiumSignature) => Promise<boolean>
  ): Promise<ChainVerification> {
    const versionIds = this.getDocumentVersions(documentId);

    if (versionIds.length === 0) {
      return {
        valid: false,
        totalVersions: 0,
        verifiedVersions: 0,
        brokenLinks: [],
        signatureFailures: [],
      };
    }

    const brokenLinks: ChainVerification['brokenLinks'] = [];
    const signatureFailures: ChainVerification['signatureFailures'] = [];
    let verifiedVersions = 0;

    for (let i = 0; i < versionIds.length; i++) {
      const version = this.versions.get(versionIds[i])!;

      // 1. Verify chainHash calculation
      let expectedChainHash: string;
      if (i === 0) {
        // First version: chainHash = hash(contentHash)
        expectedChainHash = crypto
          .createHash('sha256')
          .update(version.contentHash)
          .digest('hex');
      } else {
        // Subsequent versions: chainHash = hash(contentHash + previousVersionHash)
        const previousVersion = this.versions.get(versionIds[i - 1])!;

        if (version.previousVersionHash !== previousVersion.contentHash) {
          brokenLinks.push({
            versionNumber: version.versionNumber,
            reason: `previousVersionHash mismatch (expected ${previousVersion.contentHash.substring(0, 8)}..., got ${version.previousVersionHash?.substring(0, 8)}...)`,
          });
          continue;
        }

        expectedChainHash = crypto
          .createHash('sha256')
          .update(version.contentHash)
          .update(version.previousVersionHash!)
          .digest('hex');
      }

      if (version.chainHash !== expectedChainHash) {
        brokenLinks.push({
          versionNumber: version.versionNumber,
          reason: `chainHash mismatch (expected ${expectedChainHash.substring(0, 8)}..., got ${version.chainHash.substring(0, 8)}...)`,
        });
        continue;
      }

      // 2. Verify Dilithium signature
      const signatureValid = await verifySignature(version.chainHash, version.signature);

      if (!signatureValid) {
        signatureFailures.push({
          versionNumber: version.versionNumber,
          versionId: version.versionId,
        });
        continue;
      }

      verifiedVersions++;
    }

    return {
      valid: brokenLinks.length === 0 && signatureFailures.length === 0,
      totalVersions: versionIds.length,
      verifiedVersions,
      brokenLinks,
      signatureFailures,
    };
  }

  /**
   * Update version status
   */
  updateVersionStatus(versionId: string, status: VersionStatus, updatedBy: string): boolean {
    const version = this.versions.get(versionId);
    if (!version) return false;

    version.status = status;
    console.log(`Version ${version.versionNumber} status updated to ${status} by ${updatedBy}`);

    return true;
  }

  /**
   * Get diff between two versions
   */
  compareVersions(versionId1: string, versionId2: string): VersionDiff | null {
    const v1 = this.versions.get(versionId1);
    const v2 = this.versions.get(versionId2);

    if (!v1 || !v2) return null;
    if (v1.documentId !== v2.documentId) return null;

    return {
      fromVersion: v1.versionNumber,
      toVersion: v2.versionNumber,
      fromHash: v1.contentHash,
      toHash: v2.contentHash,
      sizeChange: v2.fileSize - v1.fileSize,
      diffSummary: `Version ${v1.versionNumber} → ${v2.versionNumber}`,
    };
  }

  /**
   * Get statistics across all documents
   */
  getStats(): VersionStats {
    const versionsByStatus: Record<VersionStatus, number> = {
      DRAFT: 0,
      REVIEW: 0,
      FINAL: 0,
      AMENDED: 0,
      REDACTED: 0,
      SUPERSEDED: 0,
    };

    let totalStorageUsed = 0;
    let largestChain = { documentId: '', versionCount: 0 };

    // Count versions by status and calculate storage
    for (const version of this.versions.values()) {
      versionsByStatus[version.status]++;
      totalStorageUsed += version.fileSize;
    }

    // Find largest chain
    for (const [documentId, versionIds] of this.documentVersions.entries()) {
      if (versionIds.length > largestChain.versionCount) {
        largestChain = { documentId, versionCount: versionIds.length };
      }
    }

    return {
      totalDocuments: this.documentVersions.size,
      totalVersions: this.versions.size,
      averageVersionsPerDocument: this.documentVersions.size > 0
        ? this.versions.size / this.documentVersions.size
        : 0,
      totalStorageUsed,
      versionsByStatus,
      largestChain,
    };
  }

  /**
   * Delete all versions of a document (admin only)
   */
  deleteDocumentVersions(documentId: string): number {
    const versionIds = this.getDocumentVersions(documentId);

    for (const versionId of versionIds) {
      this.versions.delete(versionId);
    }

    this.documentVersions.delete(documentId);

    console.log(`Deleted ${versionIds.length} versions for document ${documentId}`);
    return versionIds.length;
  }
}

// Singleton instance
export const versionStore = new DocumentVersionStore();
