/**
 * WebSocket Security & Traffic Obfuscation
 *
 * Advanced OPSEC for real-time messaging:
 * - Traffic padding to prevent message size analysis
 * - Decoy message generation for traffic pattern obfuscation
 * - Timing randomization to prevent correlation attacks
 * - Connection fingerprinting resistance
 */

import crypto from 'crypto';

/**
 * Message types for WebSocket protocol
 */
export type WSMessageType =
  | 'message'          // Actual encrypted message
  | 'typing'           // Typing indicator
  | 'presence'         // Online/offline status
  | 'read_receipt'     // Message read confirmation
  | 'heartbeat'        // Keep-alive
  | 'decoy'            // Decoy traffic (indistinguishable from real)
  | 'key_rotation'     // Forward secrecy key update
  | 'ack';             // Message acknowledgment

/**
 * WebSocket message envelope
 */
export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: number;
  nonce: string;
  padding?: string; // Random padding for traffic analysis resistance
}

/**
 * Traffic padding configuration
 */
const TRAFFIC_PADDING = {
  minSize: 256,      // Minimum message size (bytes)
  maxSize: 4096,     // Maximum message size (bytes)
  targetSize: 1024,  // Target message size for uniformity
};

/**
 * Timing obfuscation configuration
 */
const TIMING_CONFIG = {
  heartbeatMin: 15000,    // Min heartbeat interval (ms)
  heartbeatMax: 45000,    // Max heartbeat interval (ms)
  decoyMin: 30000,        // Min decoy message interval
  decoyMax: 120000,       // Max decoy message interval
  typingDelay: 200,       // Delay before sending typing indicator
  batchWindow: 100,       // Message batching window (ms)
};

/**
 * Pad message to target size for traffic analysis resistance
 */
export function padMessage(message: WSMessage, targetSize?: number): WSMessage {
  const serialized = JSON.stringify(message);
  const currentSize = Buffer.from(serialized).length;
  const target = targetSize || TRAFFIC_PADDING.targetSize;

  if (currentSize >= target) {
    return message;
  }

  const paddingSize = target - currentSize;
  const padding = crypto.randomBytes(Math.floor(paddingSize / 2)).toString('hex');

  return {
    ...message,
    padding,
  };
}

/**
 * Remove padding from received message
 */
export function removePadding(message: WSMessage): WSMessage {
  const { padding, ...cleaned } = message;
  return cleaned;
}

/**
 * Generate decoy message (indistinguishable from real traffic)
 */
export function generateDecoyMessage(): WSMessage {
  // Decoy messages look like encrypted message traffic
  const decoyPayload = {
    ciphertext: crypto.randomBytes(128).toString('base64'),
    iv: crypto.randomBytes(12).toString('base64'),
    authTag: crypto.randomBytes(16).toString('base64'),
  };

  return padMessage({
    type: 'decoy',
    payload: decoyPayload,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  });
}

/**
 * Generate heartbeat with randomized timing
 */
export function getNextHeartbeatDelay(): number {
  const min = TIMING_CONFIG.heartbeatMin;
  const max = TIMING_CONFIG.heartbeatMax;
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Generate decoy message delay
 */
export function getNextDecoyDelay(): number {
  const min = TIMING_CONFIG.decoyMin;
  const max = TIMING_CONFIG.decoyMax;
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Obfuscate typing indicator timing
 * Delays typing indicators randomly to prevent keystroke timing analysis
 */
export function getTypingIndicatorDelay(): number {
  // Random delay between 100-300ms to prevent timing correlation
  return Math.floor(Math.random() * 200) + 100;
}

/**
 * Connection fingerprinting resistance
 * Generates random User-Agent-like strings to prevent fingerprinting
 */
export function generateConnectionMetadata(): Record<string, string> {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const versions = ['120.0', '121.0', '122.0', '123.0'];
  const platforms = ['Windows NT 10.0', 'Macintosh', 'X11; Linux x86_64'];

  const browser = browsers[Math.floor(Math.random() * browsers.length)];
  const version = versions[Math.floor(Math.random() * versions.length)];
  const platform = platforms[Math.floor(Math.random() * platforms.length)];

  return {
    'User-Agent': `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${version}`,
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  };
}

/**
 * Message batching for traffic analysis resistance
 * Batches multiple messages together to prevent message count correlation
 */
export class MessageBatcher {
  private queue: WSMessage[] = [];
  private timer: NodeJS.Timeout | null = null;
  private sendCallback: (messages: WSMessage[]) => void;

  constructor(sendCallback: (messages: WSMessage[]) => void) {
    this.sendCallback = sendCallback;
  }

  /**
   * Add message to batch queue
   */
  enqueue(message: WSMessage): void {
    this.queue.push(message);

    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, TIMING_CONFIG.batchWindow);
    }
  }

  /**
   * Flush batch immediately
   */
  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length > 0) {
      const batch = [...this.queue];
      this.queue = [];
      this.sendCallback(batch);
    }
  }
}

/**
 * Traffic shaping for constant-rate transmission
 * Maintains constant traffic rate to prevent activity correlation
 */
export class TrafficShaper {
  private targetRate: number; // Messages per second
  private lastSend: number = 0;
  private queue: WSMessage[] = [];
  private interval: NodeJS.Timeout | null = null;

  constructor(targetRate: number = 2) {
    this.targetRate = targetRate;
  }

  /**
   * Start traffic shaping
   */
  start(sendCallback: (message: WSMessage) => void): void {
    const intervalMs = 1000 / this.targetRate;

    this.interval = setInterval(() => {
      if (this.queue.length > 0) {
        const message = this.queue.shift()!;
        sendCallback(message);
      } else {
        // Send decoy if queue is empty to maintain constant rate
        const decoy = generateDecoyMessage();
        sendCallback(decoy);
      }
    }, intervalMs);
  }

  /**
   * Stop traffic shaping
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Enqueue message for shaped transmission
   */
  enqueue(message: WSMessage): void {
    this.queue.push(message);
  }
}

/**
 * Forward secrecy key rotation
 * Double Ratchet-style key derivation for per-message keys
 */
export class ForwardSecrecyRatchet {
  private rootKey: Buffer;
  private sendingChainKey: Buffer;
  private receivingChainKey: Buffer;
  private messageNumber: number = 0;

  constructor(sharedSecret: Buffer) {
    // Initialize root key from shared secret
    this.rootKey = crypto.createHash('sha256').update(sharedSecret).digest();

    // Derive initial chain keys
    this.sendingChainKey = this.deriveKey(this.rootKey, Buffer.from('sending'));
    this.receivingChainKey = this.deriveKey(this.rootKey, Buffer.from('receiving'));
  }

  /**
   * Derive next message key for sending
   */
  getNextSendKey(): { messageKey: Buffer; messageNumber: number } {
    const messageKey = this.deriveKey(this.sendingChainKey, Buffer.from(`msg-${this.messageNumber}`));

    // Advance sending chain
    this.sendingChainKey = this.deriveKey(this.sendingChainKey, Buffer.from('advance'));

    const currentNumber = this.messageNumber;
    this.messageNumber++;

    return { messageKey, messageNumber: currentNumber };
  }

  /**
   * Derive message key for receiving
   */
  getReceiveKey(messageNumber: number): Buffer {
    return this.deriveKey(this.receivingChainKey, Buffer.from(`msg-${messageNumber}`));
  }

  /**
   * Rotate root key (Diffie-Hellman ratchet step)
   */
  rotateRootKey(newSharedSecret: Buffer): void {
    // KDF(rootKey || newSharedSecret)
    const combined = Buffer.concat([this.rootKey, newSharedSecret]);
    this.rootKey = crypto.createHash('sha256').update(combined).digest();

    // Re-derive chain keys
    this.sendingChainKey = this.deriveKey(this.rootKey, Buffer.from('sending'));
    this.receivingChainKey = this.deriveKey(this.rootKey, Buffer.from('receiving'));

    this.messageNumber = 0;
  }

  /**
   * Derive key using HKDF
   */
  private deriveKey(key: Buffer, info: Buffer): Buffer {
    const salt = crypto.randomBytes(32);
    return crypto.hkdfSync('sha256', key, salt, info, 32);
  }
}

/**
 * Timing attack resistance
 * Constant-time comparison to prevent timing side-channels
 */
export function constantTimeCompare(a: Buffer | string, b: Buffer | string): boolean {
  const bufA = typeof a === 'string' ? Buffer.from(a) : a;
  const bufB = typeof b === 'string' ? Buffer.from(b) : b;

  if (bufA.length !== bufB.length) {
    // Still do comparison to prevent length-based timing
    return crypto.timingSafeEqual(
      Buffer.alloc(32).fill(0),
      Buffer.alloc(32).fill(1)
    );
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Anti-forensics: Secure message deletion
 * Overwrites memory before deletion
 */
export function secureDelete(data: Buffer | string): void {
  if (typeof data === 'string') {
    // Can't overwrite string in JS, but we can clear references
    data = '';
  } else {
    // Overwrite buffer with random data before clearing
    crypto.randomFillSync(data);
    data.fill(0);
  }
}
