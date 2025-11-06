/**
 * System-Wide Audit Logging
 *
 * Comprehensive audit trail for all system actions
 */

import crypto from 'crypto';

/**
 * Audit event types
 */
export type AuditEventType =
  // Authentication
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed_login'
  | 'auth.mfa_enabled'
  | 'auth.mfa_disabled'
  // User management
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.role_changed'
  | 'user.disabled'
  | 'user.enabled'
  // Vault operations
  | 'vault.document_uploaded'
  | 'vault.document_downloaded'
  | 'vault.document_deleted'
  | 'vault.version_created'
  | 'vault.share_created'
  | 'vault.share_accessed'
  | 'vault.share_expired'
  // Canary tokens
  | 'canary.token_created'
  | 'canary.token_triggered'
  | 'canary.token_deleted'
  // Dead drops
  | 'deaddrop.created'
  | 'deaddrop.accessed'
  | 'deaddrop.expired'
  // Messaging
  | 'message.sent'
  | 'message.read'
  | 'message.deleted'
  | 'message.room_created'
  | 'message.member_added'
  | 'message.member_removed'
  // Threat intelligence
  | 'threat.created'
  | 'threat.updated'
  | 'threat.deleted'
  | 'threat.ioc_searched'
  // Admin actions
  | 'admin.access'
  | 'admin.user_modified'
  | 'admin.system_config_changed'
  | 'admin.audit_log_viewed'
  | 'admin.export_data'
  // Security events
  | 'security.suspicious_activity'
  | 'security.rate_limit_exceeded'
  | 'security.unauthorized_access'
  | 'security.data_exfiltration_attempt';

/**
 * Audit event severity
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;

  // Actor information
  userId: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;

  // Context
  action: string;
  description: string;
  resource?: string;
  resourceId?: string;

  // Request metadata
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;

  // Additional data
  metadata?: Record<string, any>;

  // Success/failure
  success: boolean;
  errorMessage?: string;

  // Risk scoring
  riskScore?: number; // 0-100
}

/**
 * Audit query filters
 */
export interface AuditQueryFilters {
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  resource?: string;
  success?: boolean;
  minRiskScore?: number;
  searchQuery?: string;
}

/**
 * Audit Log Store
 */
class AuditLogStore {
  private logs: Map<string, AuditLogEntry> = new Map();
  private userLogs: Map<string, Set<string>> = new Map(); // userId -> logIds
  private typeLogs: Map<AuditEventType, Set<string>> = new Map(); // eventType -> logIds
  private chronologicalLogs: string[] = []; // Ordered by timestamp

  /**
   * Log an audit event
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...entry,
    };

    // Store log
    this.logs.set(logEntry.id, logEntry);
    this.chronologicalLogs.push(logEntry.id);

    // Index by user
    if (!this.userLogs.has(logEntry.userId)) {
      this.userLogs.set(logEntry.userId, new Set());
    }
    this.userLogs.get(logEntry.userId)!.add(logEntry.id);

    // Index by event type
    if (!this.typeLogs.has(logEntry.eventType)) {
      this.typeLogs.set(logEntry.eventType, new Set());
    }
    this.typeLogs.get(logEntry.eventType)!.add(logEntry.id);

    // Log to console for monitoring
    console.log(`[AUDIT] ${logEntry.eventType} | ${logEntry.userId} | ${logEntry.action}`);

    // Alert on critical events
    if (logEntry.severity === 'critical' || (logEntry.riskScore && logEntry.riskScore >= 80)) {
      console.error(`[CRITICAL AUDIT EVENT] ${logEntry.eventType}:`, logEntry);
    }

    return logEntry;
  }

  /**
   * Query audit logs
   */
  query(filters: AuditQueryFilters, limit: number = 100, offset: number = 0): {
    logs: AuditLogEntry[];
    total: number;
  } {
    let results: AuditLogEntry[] = [];

    // Start with all logs or filter by user/type
    if (filters.userId) {
      const userLogIds = this.userLogs.get(filters.userId);
      if (userLogIds) {
        results = Array.from(userLogIds).map(id => this.logs.get(id)!);
      }
    } else if (filters.eventType) {
      const typeLogIds = this.typeLogs.get(filters.eventType);
      if (typeLogIds) {
        results = Array.from(typeLogIds).map(id => this.logs.get(id)!);
      }
    } else {
      results = this.chronologicalLogs.map(id => this.logs.get(id)!);
    }

    // Apply filters
    results = results.filter(log => {
      if (filters.severity && log.severity !== filters.severity) return false;
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      if (filters.resource && log.resource !== filters.resource) return false;
      if (filters.success !== undefined && log.success !== filters.success) return false;
      if (filters.minRiskScore && (!log.riskScore || log.riskScore < filters.minRiskScore)) return false;

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(query) ||
          log.description.toLowerCase().includes(query) ||
          log.userId.toLowerCase().includes(query) ||
          log.userEmail?.toLowerCase().includes(query) ||
          false
        );
      }

      return true;
    });

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      logs: paginatedResults,
      total,
    };
  }

  /**
   * Get user activity summary
   */
  getUserActivity(userId: string, days: number = 30): {
    totalActions: number;
    byEventType: Record<string, number>;
    recentLogs: AuditLogEntry[];
    riskScore: number;
  } {
    const userLogIds = this.userLogs.get(userId);
    if (!userLogIds) {
      return { totalActions: 0, byEventType: {}, recentLogs: [], riskScore: 0 };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = Array.from(userLogIds)
      .map(id => this.logs.get(id)!)
      .filter(log => log.timestamp >= startDate);

    const byEventType: Record<string, number> = {};
    let totalRiskScore = 0;

    for (const log of logs) {
      byEventType[log.eventType] = (byEventType[log.eventType] || 0) + 1;
      totalRiskScore += log.riskScore || 0;
    }

    const avgRiskScore = logs.length > 0 ? totalRiskScore / logs.length : 0;

    return {
      totalActions: logs.length,
      byEventType,
      recentLogs: logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10),
      riskScore: Math.round(avgRiskScore),
    };
  }

  /**
   * Get system statistics
   */
  getStatistics(days: number = 7): {
    totalEvents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    successRate: number;
    highRiskEvents: number;
    topUsers: Array<{ userId: string; count: number }>;
  } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentLogs = this.chronologicalLogs
      .map(id => this.logs.get(id)!)
      .filter(log => log.timestamp >= startDate);

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    let successCount = 0;
    let highRiskCount = 0;

    for (const log of recentLogs) {
      byType[log.eventType] = (byType[log.eventType] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;

      if (log.success) successCount++;
      if (log.riskScore && log.riskScore >= 70) highRiskCount++;
    }

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: recentLogs.length,
      byType,
      bySeverity,
      successRate: recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 100,
      highRiskEvents: highRiskCount,
      topUsers,
    };
  }

  /**
   * Detect suspicious patterns
   */
  detectSuspiciousActivity(userId: string, timeWindowMinutes: number = 60): {
    suspicious: boolean;
    reasons: string[];
    riskScore: number;
  } {
    const userLogIds = this.userLogs.get(userId);
    if (!userLogIds) return { suspicious: false, reasons: [], riskScore: 0 };

    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() - timeWindowMinutes);

    const recentLogs = Array.from(userLogIds)
      .map(id => this.logs.get(id)!)
      .filter(log => log.timestamp >= startTime);

    const reasons: string[] = [];
    let riskScore = 0;

    // Check for rapid-fire actions
    if (recentLogs.length > 100) {
      reasons.push(`Unusually high activity: ${recentLogs.length} actions in ${timeWindowMinutes} minutes`);
      riskScore += 30;
    }

    // Check for failed attempts
    const failedAttempts = recentLogs.filter(log => !log.success);
    if (failedAttempts.length > 10) {
      reasons.push(`Multiple failed attempts: ${failedAttempts.length}`);
      riskScore += 40;
    }

    // Check for data exfiltration patterns
    const downloads = recentLogs.filter(log =>
      log.eventType === 'vault.document_downloaded' ||
      log.action.includes('download')
    );
    if (downloads.length > 20) {
      reasons.push(`Potential data exfiltration: ${downloads.length} downloads`);
      riskScore += 50;
    }

    // Check for privilege escalation attempts
    const adminAccess = recentLogs.filter(log =>
      log.eventType.startsWith('admin.') ||
      log.eventType === 'security.unauthorized_access'
    );
    if (adminAccess.length > 0) {
      reasons.push(`Admin access or unauthorized attempts: ${adminAccess.length}`);
      riskScore += 60;
    }

    // Check for geographic anomalies (multiple IPs)
    const uniqueIPs = new Set(recentLogs.map(log => log.ipAddress).filter(Boolean));
    if (uniqueIPs.size > 3) {
      reasons.push(`Multiple IP addresses: ${uniqueIPs.size}`);
      riskScore += 25;
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
      riskScore: Math.min(riskScore, 100),
    };
  }

  /**
   * Export logs (for compliance)
   */
  exportLogs(filters: AuditQueryFilters): string {
    const { logs } = this.query(filters, 10000);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get total log count
   */
  getTotalCount(): number {
    return this.logs.size;
  }
}

// Singleton instance
export const auditLog = new AuditLogStore();

/**
 * Helper function to log audit events
 */
export function logAuditEvent(
  userId: string,
  eventType: AuditEventType,
  action: string,
  options: {
    description?: string;
    severity?: AuditSeverity;
    resource?: string;
    resourceId?: string;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    riskScore?: number;
  } = {}
): AuditLogEntry {
  return auditLog.log({
    userId,
    eventType,
    severity: options.severity || 'info',
    action,
    description: options.description || action,
    resource: options.resource,
    resourceId: options.resourceId,
    success: options.success !== undefined ? options.success : true,
    errorMessage: options.errorMessage,
    metadata: options.metadata,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    riskScore: options.riskScore,
  });
}
