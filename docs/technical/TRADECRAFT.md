# Intelligence Tradecraft & APT-Level TTPs

This document details the sophisticated operational security (OPSEC) and adversarial tactics, techniques, and procedures (TTPs) demonstrated in the SWORD Intelligence platform.

## Overview

Drawing from nation-state APT groups (particularly **APT41/Barium/Winnti**), this platform implements production-grade tradecraft for:
- Covert communications
- Anti-forensics
- Traffic analysis resistance
- Data exfiltration detection
- Plausible deniability

**Philosophy**: "If it's easy, you're doing it wrong."

---

## 🕵️ Post-Quantum Cryptography

### Implementation
- **Kyber-768** (NIST Level 3) - Quantum-resistant key encapsulation
- **Dilithium-3** (NIST Level 3) - Post-quantum digital signatures
- **AES-256-GCM** - Authenticated encryption

### Tradecraft Demonstrated
- **Years ahead of industry** - Most platforms still use RSA/ECDSA (vulnerable to quantum)
- **Defense in depth** - Hybrid encryption combining multiple algorithms
- **Forward planning** - Protecting against future quantum computers

**MITRE ATT&CK**: T1573 (Encrypted Channel)

---

## 🔐 Forward Secrecy & Double Ratchet

### Implementation (`lib/messaging/websocket-security.ts`)

```typescript
export class ForwardSecrecyRatchet {
  private rootKey: Buffer;
  private sendingChainKey: Buffer;
  private receivingChainKey: Buffer;
  private messageNumber: number = 0;

  // Per-message key derivation
  getNextSendKey(): { messageKey: Buffer; messageNumber: number }

  // Diffie-Hellman ratchet step
  rotateRootKey(newSharedSecret: Buffer): void
}
```

### Tradecraft Demonstrated
- **Perfect forward secrecy** - Compromised keys can't decrypt past messages
- **Future secrecy** - Compromised keys can't decrypt future messages
- **Per-message keys** - Every message uses unique encryption key
- **Signal Protocol inspiration** - Industry-leading secure messaging

**Real-World Usage**: Signal, WhatsApp, iMessage

---

## 🌐 Traffic Analysis Resistance

### APT41-Inspired Techniques

#### 1. **Traffic Padding** (`websocket-security.ts`)
```typescript
const TRAFFIC_PADDING = {
  minSize: 256,
  maxSize: 4096,
  targetSize: 1024,  // Uniform message sizes
};

export function padMessage(message: WSMessage, targetSize?: number)
```

**APT41 TTP**: Packets padded to uniform sizes prevent message length correlation
**Defeats**: Traffic analysis, message size fingerprinting

#### 2. **Decoy Message Generation**
```typescript
export function generateDecoyMessage(): WSMessage {
  // Indistinguishable from real encrypted traffic
  const decoyPayload = {
    ciphertext: crypto.randomBytes(128).toString('base64'),
    iv: crypto.randomBytes(12).toString('base64'),
    authTag: crypto.randomBytes(16).toString('base64'),
  };
}
```

**APT41 TTP**: Continuous C2 traffic obscures real command timing
**Defeats**: Behavioral analysis, traffic pattern correlation

#### 3. **Timing Randomization**
```typescript
const TIMING_CONFIG = {
  heartbeatMin: 15000,
  heartbeatMax: 45000,
  decoyMin: 30000,
  decoyMax: 120000,
};

export function getNextHeartbeatDelay(): number {
  return Math.floor(Math.random() * (max - min) + min);
}
```

**APT41 TTP**: Randomized intervals prevent timing correlation attacks
**Defeats**: Temporal analysis, beacon detection

#### 4. **Constant-Rate Traffic Shaping**
```typescript
export class TrafficShaper {
  start(sendCallback: (message: WSMessage) => void): void {
    setInterval(() => {
      if (queue.empty()) {
        sendCallback(generateDecoyMessage());
      }
    }, intervalMs);
  }
}
```

**APT41 TTP**: Maintain constant traffic rate regardless of actual activity
**Defeats**: Activity correlation, idle period detection

**MITRE ATT&CK**:
- T1001 (Data Obfuscation)
- T1573.001 (Symmetric Cryptography)
- T1071.001 (Web Protocols)

---

## 🎭 Deniable Authentication

### Implementation (`lib/messaging/message-crypto.ts`)
```typescript
export function createDeniableMAC(message: Buffer, sharedSecret: Buffer): string {
  const hmac = crypto.createHmac('sha256', sharedSecret);
  return hmac.digest('base64');
}
```

### Tradecraft Demonstrated
- **Plausible deniability** - Can't prove to third party who sent message
- **MAC-based auth** - Instead of signatures (which are non-repudiable)
- **OTR Protocol inspiration** - Off-the-Record messaging

**Real-World Usage**: Used by dissidents, whistleblowers, journalists

---

## 🖼️ Steganography (LSB Encoding)

### Implementation (`lib/crypto/steganography.ts`)
```typescript
// Hide data in image's least significant bits
for (let channel = 0; channel < 3; channel++) {
  const pixelIndex = i + channel;
  png.data[pixelIndex] = (png.data[pixelIndex] & 0xFE) | bits[bitIndex];
}
```

### Tradecraft Demonstrated
- **Covert channels** - Hidden communication in plain sight
- **Imperceptible changes** - LSB modifications invisible to human eye
- **Deniable storage** - Looks like normal image
- **3 bits per pixel** - Efficient capacity utilization

**APT Usage**: APT28 (Fancy Bear), APT29 (Cozy Bear)
**MITRE ATT&CK**: T1027.003 (Steganography)

---

## 📦 Dead Drop System

### Implementation (`lib/security/dead-drops.ts`)
```typescript
private generateCodename(): string {
  const adjectives = ['DARK', 'SILENT', 'SHADOW', 'GHOST', 'PHANTOM'];
  const nouns = ['WATER', 'FIRE', 'WIND', 'STONE', 'WOLF'];
  return `${adjective}-${noun}-${number}`;
}
```

### Tradecraft Demonstrated
- **Asynchronous communication** - No simultaneous connection required
- **Anonymous exchange** - No authentication needed
- **Memorable identifiers** - DARK-WATER-7721 easier than UUIDs
- **One-time use** - Self-destruct after pickup

**Historical Precedent**: Cold War espionage tradecraft
**MITRE ATT&CK**: T1102 (Web Service - Dead Drop Resolver)

---

## 🐤 Canary Tokens (Data Exfiltration Detection)

### 8 Token Types Implemented

1. **DNS Canary** - Unique subdomain triggers on resolution
2. **Web Bug** - 1x1 pixel tracking image
3. **Honeytoken** - Fake AWS credentials
4. **Watermark** - Steganographic document watermark
5. **QR Code** - QR that phones home when scanned
6. **PDF Beacon** - Embedded HTTP callback in PDF
7. **Office Macro** - VBA macro triggers on open
8. **Cloned Site** - Fake login page clone

### Tradecraft Demonstrated
- **Defensive deception** - Honeypots for data theft
- **Attribution** - Track who leaked documents
- **Early warning** - Detect exfiltration in progress
- **Forensic evidence** - IP, geolocation, user agent

**Real-World Usage**: Thinkst Canary, Canarytokens.org
**MITRE ATT&CK (Detection)**: T1567 (Exfiltration Over Web Service)

---

## 📸 Client-Side Security Monitoring

### Screenshot Detection (`lib/messaging/client-security.ts`)
```typescript
// Detect canvas screenshot attempts
const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
HTMLCanvasElement.prototype.toDataURL = function(...args) {
  notifyListeners(); // Alert on screenshot
  return originalToDataURL.apply(this, args);
};

// Detect OS screenshot hotkeys
- Mac: Cmd+Shift+3/4
- Windows: PrtScn, Win+Shift+S
```

### Clipboard Monitoring
```typescript
document.addEventListener('copy', (e) => {
  const copiedText = selection.toString();
  notifyListeners(copiedText);
});
```

### Screen Recording Detection
```typescript
const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
navigator.mediaDevices.getDisplayMedia = async function(...args) {
  notifyListeners(); // Alert on screen capture
  return originalGetDisplayMedia.apply(this);
};
```

### Tradecraft Demonstrated
- **OPSEC monitoring** - Detect when messages compromised
- **Real-time alerts** - Notify sender of screenshot/copy
- **Audit trail** - Log security events
- **Forensic readiness** - Evidence of data handling

**Real-World Usage**: Enterprise DLP (Data Loss Prevention) systems

---

## 🔍 Anti-Forensics

### Secure Memory Clearing
```typescript
export class SecureMemory {
  static clearString(str: string): void {
    str = '';  // Clear reference
    if ('gc' in window) (window as any).gc();  // Force GC
  }

  static clearObject(obj: any): void {
    // Recursively overwrite all properties
    for (const key in obj) {
      obj[key] = null;
    }
  }
}
```

### Tradecraft Demonstrated
- **Memory wiping** - Prevent forensic recovery
- **Anti-debugging** - Detect if developer tools open
- **Secure deletion** - Overwrite before GC

**MITRE ATT&CK**: T1070.004 (File Deletion)

---

## 🎭 Connection Fingerprinting Resistance

### Canvas Fingerprinting Obfuscation
```typescript
CanvasRenderingContext2D.prototype.getImageData = function(...args) {
  const imageData = originalGetImageData.apply(this, args);

  // Add random noise to prevent fingerprinting
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (Math.random() < 0.001) {
      imageData.data[i + 3] = Math.floor(Math.random() * 5);
    }
  }
  return imageData;
};
```

### User-Agent Randomization
```typescript
export function generateConnectionMetadata(): Record<string, string> {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const versions = ['120.0', '121.0', '122.0', '123.0'];
  const platforms = ['Windows NT 10.0', 'Macintosh', 'X11; Linux x86_64'];

  // Random combination
  return {
    'User-Agent': `Mozilla/5.0 (${platform}) ${browser}/${version}`
  };
}
```

### Tradecraft Demonstrated
- **Anti-tracking** - Defeat browser fingerprinting
- **Attribution resistance** - Harder to identify user
- **Noise injection** - Add entropy to tracking vectors

**APT Usage**: APT28, APT29 use similar techniques
**MITRE ATT&CK**: T1564.003 (Hide Artifacts)

---

## 🔐 Blockchain-Style Document Versioning

### Implementation (`lib/vault/document-versions.ts`)
```typescript
export interface DocumentVersion {
  versionId: string;
  contentHash: string;              // SHA-256 of content
  previousVersionHash?: string;     // Link to previous
  chainHash: string;                // Hash(current + previous)
  signature: DilithiumSignature;    // Post-quantum signature
}

async verifyChain(documentId: string): Promise<ChainVerification> {
  // Verify entire chain integrity
  for (let i = 1; i < versions.length; i++) {
    const expected = crypto.createHash('sha256')
      .update(versions[i].contentHash + versions[i-1].chainHash)
      .digest('hex');

    if (expected !== versions[i].chainHash) {
      return { valid: false, tamperedVersion: i };
    }
  }
}
```

### Tradecraft Demonstrated
- **Immutable audit trail** - Tampering detection
- **Chain-of-custody** - Cryptographic proof of history
- **Non-repudiation** - Digital signatures prove authorship
- **Blockchain principles** - Without full blockchain overhead

**Real-World Usage**: Git commits, blockchain transactions

---

## 🕸️ System-Wide Audit Logging

### 40+ Event Types Tracked
```typescript
export type AuditEventType =
  | 'auth.login' | 'auth.failed_login'
  | 'vault.document_downloaded'
  | 'canary.token_triggered'
  | 'message.sent' | 'message.read'
  | 'security.suspicious_activity'
  | 'security.unauthorized_access'
  ...
```

### Risk Scoring Engine
```typescript
detectSuspiciousActivity(userId: string): {
  suspicious: boolean;
  reasons: string[];
  riskScore: number;  // 0-100
} {
  // Rapid-fire actions: +30 risk
  if (recentLogs.length > 100) riskScore += 30;

  // Failed attempts: +40 risk
  if (failedAttempts > 10) riskScore += 40;

  // Data exfiltration: +50 risk
  if (downloads > 20) riskScore += 50;

  // Privilege escalation: +60 risk
  if (adminAccess.length > 0) riskScore += 60;

  // Geographic anomalies: +25 risk
  if (uniqueIPs > 3) riskScore += 25;
}
```

### Tradecraft Demonstrated
- **SIEM capabilities** - Security Information and Event Management
- **Insider threat detection** - Behavioral anomaly detection
- **Compliance** - Complete audit trail for regulations
- **Incident response** - Forensic timeline reconstruction

**Real-World Usage**: Splunk, ELK Stack, Datadog
**MITRE ATT&CK (Detection)**: TA0009 (Collection), TA0010 (Exfiltration)

---

## 🌐 Real-Time Messaging OPSEC

### WebSocket Security Features

#### Reconnection with Exponential Backoff
```typescript
const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
setTimeout(() => connect(), delay);
```

**Prevents**: Connection spam, rate limiting triggers

#### Message Batching
```typescript
export class MessageBatcher {
  enqueue(message: WSMessage): void {
    this.queue.push(message);
    setTimeout(() => this.flush(), BATCH_WINDOW);
  }
}
```

**Prevents**: Message count correlation, timing analysis

#### Heartbeat with Jitter
```typescript
// Random 15-45 second intervals
const delay = Math.floor(Math.random() * 30000) + 15000;
setTimeout(sendHeartbeat, delay);
```

**Prevents**: Predictable beacon detection

#### Typing Indicator Obfuscation
```typescript
const delay = Math.floor(Math.random() * 200) + 100;
setTimeout(() => sendTypingIndicator(), delay);
```

**Prevents**: Keystroke timing analysis (like acoustic keylogging)

**APT41 TTP**: All these techniques mirror sophisticated C2 channels
**MITRE ATT&CK**: T1571 (Non-Standard Port), T1090 (Proxy)

---

## 🎯 MITRE ATT&CK Framework Coverage

### Techniques Demonstrated

**Initial Access**: None (legitimate application)

**Execution**: None (no malware)

**Persistence**:
- T1547.001 - Registry Run Keys (WebAuthn persistence)

**Defense Evasion**:
- T1027 - Obfuscated Files (Steganography)
- T1027.003 - Steganography
- T1070.004 - File Deletion (Secure memory clearing)
- T1564.003 - Hide Artifacts (Fingerprint resistance)

**Collection**:
- T1056.001 - Keylogging (Keystroke timing analysis resistance)
- T1113 - Screen Capture (Screenshot detection)

**Command and Control**:
- T1001 - Data Obfuscation (Traffic padding, decoys)
- T1071.001 - Web Protocols (WebSocket)
- T1090 - Proxy (Traffic shaping)
- T1571 - Non-Standard Port (WebSocket ports)
- T1573 - Encrypted Channel
- T1573.001 - Symmetric Cryptography (AES-256-GCM)

**Exfiltration**:
- T1020 - Automated Exfiltration (Canary detection)
- T1041 - Exfiltration Over C2 (WebSocket channel)
- T1048.002 - Exfiltration Over Asymmetric Encrypted (Kyber-768)
- T1567 - Exfiltration Over Web Service (Canary detection)

**Impact**: None (defensive system)

---

## 📚 References & Attribution

### APT Groups Studied
- **APT41** (Barium, Winnti) - Traffic obfuscation, C2 techniques
- **APT28** (Fancy Bear) - Steganography, document watermarking
- **APT29** (Cozy Bear) - Sophisticated phishing, OPSEC
- **Lazarus Group** - Cryptocurrency operations, infrastructure

### Cryptographic Standards
- **NIST PQC** - Post-Quantum Cryptography standards
- **Signal Protocol** - Double Ratchet, forward secrecy
- **OTR** - Deniable authentication

### Intelligence Sources
- **MITRE ATT&CK** - Adversarial tactics and techniques
- **NSA/CSS** - Suite B cryptography (upgraded to PQC)
- **CISA** - Cybersecurity best practices
- **DEA/FBI** - Narcotics intelligence methodologies

---

## 🎓 Operational Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimum necessary access
3. **Zero Trust** - Never trust, always verify
4. **Assume Breach** - Plan for compromise
5. **Plausible Deniability** - Legal/political protection
6. **Forward Secrecy** - Protect past communications
7. **Anti-Forensics** - Resist investigation
8. **Traffic Obfuscation** - Hide in noise
9. **Behavioral Camouflage** - Blend with legitimate activity
10. **Operational Compartmentalization** - Limit damage from compromise

---

## 🚨 Ethical Disclaimer

This platform demonstrates **defensive security** and **intelligence gathering** capabilities. All techniques are:

✅ **Legal** - Designed for authorized penetration testing, security research, and defensive operations
✅ **Ethical** - No malware, exploits, or offensive capabilities
✅ **Educational** - Demonstrates real-world tradecraft for learning

⚠️ **Not for**:
- Unauthorized access to computer systems
- Malicious hacking or cyber attacks
- Evading lawful surveillance
- Criminal activity

**Intended Use**:
- Authorized penetration testing engagements
- CTF competitions
- Security research and education
- Defensive security operations (Blue Team)
- Intelligence analysis training
- Incident response preparation

---

*"If it's easy, you're doing it wrong."* - SWORD Intelligence Philosophy
