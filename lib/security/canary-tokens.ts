import crypto from 'crypto';

/**
 * Canary Token Types
 * Each type represents a different detection mechanism
 */
export type CanaryTokenType =
  | 'dns'           // DNS lookup canary - unique subdomain resolves to our server
  | 'web_bug'       // HTTP tracking pixel
  | 'honeytoken'    // Fake credentials (AWS keys, API tokens)
  | 'watermark'     // Steganographic document watermark
  | 'qr_code'       // QR code that phones home
  | 'pdf_beacon'    // Embedded HTTP callback in PDF
  | 'macro'         // Office macro that triggers on open
  | 'clonedsite';   // Fake login page clone

/**
 * Canary Token Status
 */
export type CanaryTokenStatus = 'active' | 'triggered' | 'expired' | 'revoked';

/**
 * Canary Token Alert Severity
 */
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Geolocation data from IP
 */
export interface GeoLocation {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
  asn?: string;
  timezone?: string;
}

/**
 * Threat intelligence data
 */
export interface ThreatIntel {
  isMalicious: boolean;
  reputation: 'clean' | 'suspicious' | 'malicious' | 'unknown';
  threatScore: number; // 0-100
  categories: string[]; // ['botnet', 'tor', 'proxy', 'vpn', etc]
  lastSeen?: string;
  reports?: number;
}

/**
 * Canary Token Trigger Event
 */
export interface CanaryTrigger {
  triggerId: string;
  tokenId: string;
  triggeredAt: Date;

  // Network information
  sourceIp: string;
  userAgent?: string;
  referer?: string;
  headers?: Record<string, string>;

  // Geolocation
  geolocation?: GeoLocation;

  // Threat intelligence
  threatIntel?: ThreatIntel;

  // Context
  triggerType: string; // 'http_request', 'dns_query', 'credential_use', etc
  metadata?: Record<string, any>;

  // Alert
  severity: AlertSeverity;
  alertSent: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

/**
 * Canary Token Definition
 */
export interface CanaryToken {
  tokenId: string; // Unique cryptographic ID
  type: CanaryTokenType;
  status: CanaryTokenStatus;

  // Association
  documentId?: string; // If embedded in document
  userId: string; // Owner who created the token
  targetUserId?: string; // Specific user this token is for

  // Token details
  tokenValue: string; // The actual token string (subdomain, URL, fake key, etc)
  tokenSecret: string; // Secret for verification
  tokenHash: string; // SHA-256 hash for quick lookup

  // Metadata
  label: string;
  description?: string;
  tags: string[];

  // Lifecycle
  createdAt: Date;
  expiresAt?: Date;
  firstTriggeredAt?: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;

  // Triggers
  triggers: CanaryTrigger[];

  // Alert configuration
  alertOnFirstTrigger: boolean;
  alertOnEveryTrigger: boolean;
  maxTriggers?: number; // Auto-revoke after N triggers

  // Additional payload
  payload?: Record<string, any>;
}

/**
 * Canary Token Generation Options
 */
export interface CanaryTokenOptions {
  type: CanaryTokenType;
  documentId?: string;
  targetUserId?: string;
  label: string;
  description?: string;
  tags?: string[];
  expiresIn?: number; // Seconds until expiration
  alertOnFirstTrigger?: boolean;
  alertOnEveryTrigger?: boolean;
  maxTriggers?: number;
  payload?: Record<string, any>;
}

/**
 * Canary Token Store
 * Manages all canary tokens and their triggers
 */
class CanaryTokenStore {
  private tokens: Map<string, CanaryToken> = new Map(); // tokenId -> token
  private tokensByHash: Map<string, string> = new Map(); // tokenHash -> tokenId
  private documentTokens: Map<string, string[]> = new Map(); // documentId -> tokenIds[]
  private userTokens: Map<string, string[]> = new Map(); // userId -> tokenIds[]

  /**
   * Generate a unique canary token
   */
  generateToken(userId: string, options: CanaryTokenOptions): CanaryToken {
    const tokenId = crypto.randomUUID();
    const tokenSecret = crypto.randomBytes(32).toString('hex');

    // Generate token value based on type
    let tokenValue: string;
    switch (options.type) {
      case 'dns':
        // Generate unique subdomain: [random].[tokenId].canary.swordintelli gence.com
        tokenValue = `${crypto.randomBytes(8).toString('hex')}.${tokenId.replace(/-/g, '')}.canary.swordintelligence.com`;
        break;

      case 'web_bug':
        // Generate tracking pixel URL
        tokenValue = `/api/canary/pixel/${tokenId}.gif?secret=${tokenSecret.substring(0, 16)}`;
        break;

      case 'honeytoken':
        // Generate fake AWS-style access key
        tokenValue = `AKIA${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
        break;

      case 'watermark':
        // Generate steganographic marker (embedded in document metadata)
        tokenValue = crypto.randomBytes(32).toString('base64url');
        break;

      case 'qr_code':
        // Generate URL for QR code
        tokenValue = `https://swordintelligence.com/verify?token=${tokenId}&sig=${tokenSecret.substring(0, 16)}`;
        break;

      case 'pdf_beacon':
        // Generate URL to embed in PDF (e.g., as external resource)
        tokenValue = `https://swordintelligence.com/api/canary/beacon/${tokenId}/${tokenSecret.substring(0, 12)}`;
        break;

      case 'macro':
        // Generate callback URL for Office macro
        tokenValue = `https://swordintelligence.com/api/canary/macro/${tokenId}?key=${tokenSecret.substring(0, 16)}`;
        break;

      case 'clonedsite':
        // Generate unique URL for cloned site
        tokenValue = `https://${crypto.randomBytes(8).toString('hex')}.swordintelligence.com/login`;
        break;

      default:
        tokenValue = crypto.randomBytes(32).toString('hex');
    }

    // Hash for quick lookup
    const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');

    const token: CanaryToken = {
      tokenId,
      type: options.type,
      status: 'active',
      documentId: options.documentId,
      userId,
      targetUserId: options.targetUserId,
      tokenValue,
      tokenSecret,
      tokenHash,
      label: options.label,
      description: options.description,
      tags: options.tags || [],
      createdAt: new Date(),
      expiresAt: options.expiresIn
        ? new Date(Date.now() + options.expiresIn * 1000)
        : undefined,
      triggerCount: 0,
      triggers: [],
      alertOnFirstTrigger: options.alertOnFirstTrigger ?? true,
      alertOnEveryTrigger: options.alertOnEveryTrigger ?? false,
      maxTriggers: options.maxTriggers,
      payload: options.payload,
    };

    // Store token
    this.tokens.set(tokenId, token);
    this.tokensByHash.set(tokenHash, tokenId);

    // Index by document
    if (options.documentId) {
      const docTokens = this.documentTokens.get(options.documentId) || [];
      docTokens.push(tokenId);
      this.documentTokens.set(options.documentId, docTokens);
    }

    // Index by user
    const userTokenList = this.userTokens.get(userId) || [];
    userTokenList.push(tokenId);
    this.userTokens.set(userId, userTokenList);

    console.log(
      `🕯️ Canary token created: ${options.type} - ${tokenValue.substring(0, 40)}...`
    );

    return token;
  }

  /**
   * Get token by ID
   */
  getToken(tokenId: string): CanaryToken | undefined {
    return this.tokens.get(tokenId);
  }

  /**
   * Get token by value hash
   */
  getTokenByValue(tokenValue: string): CanaryToken | undefined {
    const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
    const tokenId = this.tokensByHash.get(tokenHash);
    return tokenId ? this.tokens.get(tokenId) : undefined;
  }

  /**
   * Get all tokens for a document
   */
  getDocumentTokens(documentId: string): CanaryToken[] {
    const tokenIds = this.documentTokens.get(documentId) || [];
    return tokenIds.map(id => this.tokens.get(id)!).filter(Boolean);
  }

  /**
   * Get all tokens for a user
   */
  getUserTokens(userId: string): CanaryToken[] {
    const tokenIds = this.userTokens.get(userId) || [];
    return tokenIds.map(id => this.tokens.get(id)!).filter(Boolean);
  }

  /**
   * Trigger a canary token
   */
  async triggerToken(
    tokenId: string,
    triggerData: {
      sourceIp: string;
      userAgent?: string;
      referer?: string;
      headers?: Record<string, string>;
      triggerType: string;
      metadata?: Record<string, any>;
    }
  ): Promise<CanaryTrigger | null> {
    const token = this.tokens.get(tokenId);
    if (!token) {
      console.error(`Canary token not found: ${tokenId}`);
      return null;
    }

    // Check if token is active
    if (token.status !== 'active') {
      console.warn(`Canary token not active: ${tokenId} (status: ${token.status})`);
      return null;
    }

    // Check if expired
    if (token.expiresAt && token.expiresAt < new Date()) {
      token.status = 'expired';
      console.warn(`Canary token expired: ${tokenId}`);
      return null;
    }

    // Fetch geolocation (mock for now - in production use ipinfo.io or similar)
    const geolocation = await this.fetchGeolocation(triggerData.sourceIp);

    // Fetch threat intelligence (mock for now - in production use AbuseIPDB, VirusTotal, etc)
    const threatIntel = await this.fetchThreatIntel(triggerData.sourceIp);

    // Determine severity
    const severity = this.calculateSeverity(token, threatIntel);

    // Create trigger event
    const trigger: CanaryTrigger = {
      triggerId: crypto.randomUUID(),
      tokenId,
      triggeredAt: new Date(),
      sourceIp: triggerData.sourceIp,
      userAgent: triggerData.userAgent,
      referer: triggerData.referer,
      headers: triggerData.headers,
      geolocation,
      threatIntel,
      triggerType: triggerData.triggerType,
      metadata: triggerData.metadata,
      severity,
      alertSent: false,
    };

    // Add to token
    token.triggers.push(trigger);
    token.triggerCount++;
    token.lastTriggeredAt = new Date();

    if (!token.firstTriggeredAt) {
      token.firstTriggeredAt = new Date();
      token.status = 'triggered';
    }

    // Check if max triggers reached
    if (token.maxTriggers && token.triggerCount >= token.maxTriggers) {
      token.status = 'revoked';
      console.warn(`Canary token auto-revoked after ${token.triggerCount} triggers: ${tokenId}`);
    }

    // Determine if alert should be sent
    const shouldAlert =
      (token.alertOnFirstTrigger && token.triggerCount === 1) ||
      token.alertOnEveryTrigger;

    if (shouldAlert) {
      trigger.alertSent = true;
      await this.sendAlert(token, trigger);
    }

    console.log(
      `🚨 CANARY TRIGGERED: ${token.type} - ${token.label} ` +
      `(${triggerData.sourceIp}, severity: ${severity}, count: ${token.triggerCount})`
    );

    return trigger;
  }

  /**
   * Calculate severity based on threat intelligence
   */
  private calculateSeverity(token: CanaryToken, threatIntel?: ThreatIntel): AlertSeverity {
    // High sensitivity documents get higher severity
    if (token.tags.includes('TOP SECRET') || token.tags.includes('CONFIDENTIAL')) {
      if (threatIntel?.reputation === 'malicious') return 'critical';
      if (threatIntel?.reputation === 'suspicious') return 'high';
      return 'high'; // Any access to top secret is high severity
    }

    // Based on threat intel
    if (threatIntel?.reputation === 'malicious') return 'high';
    if (threatIntel?.reputation === 'suspicious') return 'medium';

    // First trigger is more important
    if (token.triggerCount === 0) return 'medium';

    return 'low';
  }

  /**
   * Fetch geolocation for IP (mock - in production use ipinfo.io, ipapi.co, etc)
   */
  private async fetchGeolocation(ip: string): Promise<GeoLocation> {
    // Mock data - in production, call real geolocation API
    return {
      ip,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
    };
  }

  /**
   * Fetch threat intelligence for IP (mock - in production use AbuseIPDB, VirusTotal, etc)
   */
  private async fetchThreatIntel(ip: string): Promise<ThreatIntel> {
    // Mock data - in production, call threat intel APIs
    // Check if IP is in known threat lists, Tor exit nodes, etc

    // Simple heuristic: check if it's a known cloud provider or VPN
    const isCloudProvider =
      ip.startsWith('13.') || // AWS
      ip.startsWith('34.') || // Google Cloud
      ip.startsWith('20.') || // Azure
      ip.startsWith('104.');   // Cloudflare

    return {
      isMalicious: false,
      reputation: isCloudProvider ? 'suspicious' : 'unknown',
      threatScore: 0,
      categories: isCloudProvider ? ['cloud'] : [],
    };
  }

  /**
   * Send alert for triggered canary
   */
  private async sendAlert(token: CanaryToken, trigger: CanaryTrigger): Promise<void> {
    // In production: send email, Slack, PagerDuty, webhook, etc
    console.log(
      `🚨 ALERT: Canary token triggered!\n` +
      `  Token: ${token.label}\n` +
      `  Type: ${token.type}\n` +
      `  Severity: ${trigger.severity}\n` +
      `  Source IP: ${trigger.sourceIp}\n` +
      `  Location: ${trigger.geolocation?.city}, ${trigger.geolocation?.country}\n` +
      `  Threat: ${trigger.threatIntel?.reputation}\n` +
      `  User Agent: ${trigger.userAgent}\n` +
      `  Trigger #${token.triggerCount}`
    );
  }

  /**
   * Revoke a canary token
   */
  revokeToken(tokenId: string, userId: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) return false;

    // Check ownership
    if (token.userId !== userId) {
      console.error(`User ${userId} cannot revoke token owned by ${token.userId}`);
      return false;
    }

    token.status = 'revoked';
    console.log(`Canary token revoked: ${tokenId}`);
    return true;
  }

  /**
   * Get all active tokens
   */
  getActiveTokens(): CanaryToken[] {
    return Array.from(this.tokens.values()).filter(t => t.status === 'active');
  }

  /**
   * Get all triggered tokens
   */
  getTriggeredTokens(): CanaryToken[] {
    return Array.from(this.tokens.values()).filter(t => t.status === 'triggered');
  }

  /**
   * Get statistics
   */
  getStats() {
    const tokens = Array.from(this.tokens.values());
    const totalTriggers = tokens.reduce((sum, t) => sum + t.triggerCount, 0);

    return {
      totalTokens: tokens.length,
      activeTokens: tokens.filter(t => t.status === 'active').length,
      triggeredTokens: tokens.filter(t => t.status === 'triggered').length,
      expiredTokens: tokens.filter(t => t.status === 'expired').length,
      revokedTokens: tokens.filter(t => t.status === 'revoked').length,
      totalTriggers,
      uniqueIPs: new Set(
        tokens.flatMap(t => t.triggers.map(tr => tr.sourceIp))
      ).size,
      byType: {
        dns: tokens.filter(t => t.type === 'dns').length,
        web_bug: tokens.filter(t => t.type === 'web_bug').length,
        honeytoken: tokens.filter(t => t.type === 'honeytoken').length,
        watermark: tokens.filter(t => t.type === 'watermark').length,
        qr_code: tokens.filter(t => t.type === 'qr_code').length,
        pdf_beacon: tokens.filter(t => t.type === 'pdf_beacon').length,
        macro: tokens.filter(t => t.type === 'macro').length,
        clonedsite: tokens.filter(t => t.type === 'clonedsite').length,
      },
    };
  }

  /**
   * Get recent triggers
   */
  getRecentTriggers(limit: number = 50): CanaryTrigger[] {
    const allTriggers = Array.from(this.tokens.values())
      .flatMap(token => token.triggers);

    return allTriggers
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit);
  }
}

// Singleton instance
export const canaryTokenStore = new CanaryTokenStore();
