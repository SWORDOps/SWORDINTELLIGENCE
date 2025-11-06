# Real-Time WebSocket Messaging System

Complete implementation of real-time secure messaging with APT-level operational security.

## Features Overview

### 🔒 Security & Encryption

**Post-Quantum Cryptography:**
- Kyber-768 for quantum-resistant key encapsulation
- Dilithium-3 for post-quantum digital signatures
- AES-256-GCM for authenticated encryption
- Forward secrecy with double ratchet (Signal Protocol-inspired)

**Traffic Obfuscation (APT41-Inspired):**
- Message padding to uniform 1024-byte sizes (prevents size correlation attacks)
- Continuous decoy message generation (indistinguishable from real traffic)
- Timing randomization (15-45s heartbeats, 30-120s decoys)
- Constant-rate traffic shaping (defeats activity correlation)
- Connection fingerprinting resistance (randomized User-Agents)

**Client-Side OPSEC:**
- Screenshot detection (3 methods: canvas interception, keyboard shortcuts, visibility changes)
- Clipboard monitoring (copy/cut events)
- Screen recording detection (API interception, memory monitoring)
- Browser fingerprinting resistance (canvas/WebGL noise injection)
- Anti-debugging (DevTools detection)
- Secure memory clearing

### 💬 Real-Time Features

**Live Messaging:**
- Instant message delivery via WebSocket
- Optimistic UI updates for sent messages
- Message persistence via REST API fallback
- Automatic reconnection with exponential backoff

**Typing Indicators:**
- Live "user is typing..." notifications
- Obfuscated timing (prevents keystroke analysis)
- Auto-clear after 3 seconds of inactivity
- Per-room typing status

**Presence Tracking:**
- Online/offline status indicators
- Away status on visibility change
- Last seen timestamps
- Automated presence updates

**Security Alerts:**
- Real-time OPSEC breach notifications
- Screenshot/clipboard/recording detection alerts
- Visual alerts with dismiss functionality
- Audit trail integration

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         /app/portal/messages/page.tsx                      │ │
│  │  - Main messaging UI                                       │ │
│  │  - Real-time message display                               │ │
│  │  - Typing indicators                                       │ │
│  │  - Security alerts panel                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         hooks/useSecureWebSocket.ts                        │ │
│  │  - React hook for WebSocket management                     │ │
│  │  - Auto-reconnection logic                                 │ │
│  │  - Message queue for offline periods                       │ │
│  │  - Security event integration                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         lib/messaging/client-security.ts                   │ │
│  │  - Screenshot detection                                    │ │
│  │  - Clipboard monitoring                                    │ │
│  │  - Recording detection                                     │ │
│  │  - Anti-debugging                                          │ │
│  │  - Fingerprint resistance                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ WebSocket (WSS)
┌─────────────────────────────────────────────────────────────────┐
│                        Server Infrastructure                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         /app/api/ws/route.ts                               │ │
│  │  - WebSocket connection endpoint                           │ │
│  │  - Message broadcast handling                              │ │
│  │  - Authentication & authorization                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         lib/messaging/websocket-manager.ts                 │ │
│  │  - Connection lifecycle management                         │ │
│  │  - Room/user message routing                               │ │
│  │  - Presence tracking                                       │ │
│  │  - Heartbeat coordination                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         lib/messaging/websocket-security.ts                │ │
│  │  - Traffic padding (uniform 1024-byte messages)            │ │
│  │  - Decoy message generation                                │ │
│  │  - Timing randomization                                    │ │
│  │  - Forward secrecy (double ratchet)                        │ │
│  │  - Connection fingerprinting resistance                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
SWORDINTELLIGENCE/
├── app/
│   ├── portal/
│   │   └── messages/
│   │       └── page.tsx                    # Main messaging UI
│   └── api/
│       └── ws/
│           └── route.ts                    # WebSocket API endpoint
├── hooks/
│   └── useSecureWebSocket.ts               # React WebSocket hook
├── lib/
│   └── messaging/
│       ├── websocket-security.ts           # Traffic obfuscation & encryption
│       ├── websocket-manager.ts            # Server-side connection management
│       └── client-security.ts              # Client-side OPSEC monitoring
├── TRADECRAFT.md                           # Complete APT techniques documentation
└── WEBSOCKET_IMPLEMENTATION.md             # This file
```

## Component Details

### 1. `/app/portal/messages/page.tsx`

Main messaging interface with full WebSocket integration.

**Key Features:**
- Real-time message display
- Live typing indicators
- WebSocket connection status (Live/Connecting/Offline with latency)
- Security alerts panel (screenshot/clipboard/recording detection)
- Presence indicators
- Operations room support
- Direct messaging support

**State Management:**
```typescript
// WebSocket state
const { state, sendMessage, sendTyping, sendPresence } = useSecureWebSocket({
  roomId: selectedRoom,
  onMessage: handleIncomingMessage,
  onSecurityEvent: handleSecurityAlert,
});

// Message state
const [messages, setMessages] = useState<Message[]>([]);
const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
const [presenceMap, setPresenceMap] = useState<Map<string, PresenceInfo>>(new Map());
const [securityAlerts, setSecurityAlerts] = useState<SecurityEvent[]>([]);
```

**Message Flow:**
1. User types → `handleTyping()` → sends obfuscated typing indicator
2. User sends message → `sendMessage()` → WebSocket broadcast + API persistence
3. Incoming message → `onMessage()` callback → UI update
4. Security event → `onSecurityEvent()` → alert display

### 2. `hooks/useSecureWebSocket.ts`

React hook for WebSocket connection management with OPSEC features.

**Capabilities:**
- Automatic connection/disconnection
- Exponential backoff reconnection (1s → 2s → 4s → 8s → 16s → 30s max)
- Message queueing for offline periods
- Heartbeat with latency measurement (randomized 15-45s intervals)
- Automated presence updates (online/away/offline)
- Security event transmission
- Typing indicator obfuscation

**API:**
```typescript
const {
  state: {
    connected: boolean;
    connecting: boolean;
    error: Error | null;
    latency: number | null;
    reconnectAttempts: number;
  },
  sendMessage: (message: WSMessage) => void;
  sendTyping: (roomId: string, isTyping: boolean) => void;
  sendPresence: (status: 'online' | 'away' | 'offline') => void;
  connect: () => void;
  disconnect: () => void;
} = useSecureWebSocket(options);
```

**Usage Example:**
```typescript
const chat = useSecureWebSocket({
  roomId: 'operation-blue-magic',
  onMessage: (msg) => {
    if (msg.type === 'message') {
      addMessageToUI(msg.payload);
    }
  },
  onSecurityEvent: (event) => {
    showAlert(`${event.type} detected!`);
  },
});

// Send encrypted message
chat.sendMessage({
  type: 'message',
  payload: { encryptedContent: '...', roomId: '...' },
  timestamp: Date.now(),
  nonce: crypto.randomUUID(),
});
```

### 3. `lib/messaging/websocket-security.ts`

APT41-inspired traffic obfuscation and forward secrecy implementation.

**Traffic Padding:**
```typescript
export function padMessage(message: WSMessage, targetSize = 1024): WSMessage {
  // Pads messages to uniform size (prevents size correlation)
  // Random padding data is indistinguishable from ciphertext
}
```

**Decoy Messages:**
```typescript
export function generateDecoyMessage(): WSMessage {
  // Creates fake encrypted messages
  // Indistinguishable from real traffic
  // Maintains constant C2-like activity
}
```

**Timing Randomization:**
```typescript
export function getNextHeartbeatDelay(): number {
  // Returns random 15-45 second interval
  // Prevents timing analysis attacks
}
```

**Forward Secrecy (Double Ratchet):**
```typescript
export class ForwardSecrecyRatchet {
  getNextSendKey(): { messageKey: Buffer; messageNumber: number };
  rotateRootKey(newSharedSecret: Buffer): void;
  // Signal Protocol-inspired per-message key derivation
  // Perfect forward secrecy: compromise of one key doesn't affect others
}
```

**Traffic Shaping:**
```typescript
export class TrafficShaper {
  enqueue(message: WSMessage): void;
  start(sendCallback: (msg: WSMessage) => void): void;
  // Maintains constant-rate transmission
  // Sends decoys when queue is empty to maintain rate
}
```

### 4. `lib/messaging/websocket-manager.ts`

Server-side connection and message routing management.

**Connection Management:**
```typescript
export class WebSocketManager {
  registerConnection(userId: string, ws: any, ipAddress?: string): SecureWSConnection;
  unregisterConnection(connectionId: string): void;
  broadcastToRoom(roomId: string, message: WSMessage, excludeConnectionId?: string): void;
  sendToUser(userId: string, message: WSMessage): void;
  sendToConnection(connectionId: string, message: WSMessage): void;
}
```

**Features:**
- IP address hashing (SHA-256, 16 chars) for privacy
- Automated heartbeat with randomized timing
- Continuous decoy traffic generation
- Stale connection cleanup
- Per-connection session keys

**Security Properties:**
```typescript
export interface SecureWSConnection {
  id: string;
  userId: string;
  ws: any;
  ipHash?: string;                    // Hashed, not raw IP
  connectionFingerprint: string;       // Random fingerprint
  sessionKey: string;                  // Per-session encryption key
  heartbeatTimer?: NodeJS.Timeout;     // Randomized heartbeat
  decoyTimer?: NodeJS.Timeout;         // Continuous decoys
}
```

### 5. `lib/messaging/client-security.ts`

Client-side OPSEC monitoring and anti-forensics.

**Screenshot Detection (3 Methods):**
```typescript
export class ScreenshotDetector {
  // Method 1: Canvas toDataURL interception
  // Method 2: Keyboard shortcut detection (Cmd+Shift+3/4, PrtScn, Win+Shift+S)
  // Method 3: Visibility change patterns (screenshot tools hide browser)
  onScreenshot(callback: () => void): void;
}
```

**Clipboard Monitoring:**
```typescript
export class ClipboardMonitor {
  // Detects copy/cut events
  // Reports copied content length (not content itself)
  onCopy(callback: (text: string) => void): void;
}
```

**Screen Recording Detection:**
```typescript
export class ScreenRecordingDetector {
  // Monitors getDisplayMedia API calls
  // Detects performance/memory patterns of recording
  onRecording(callback: () => void): void;
}
```

**Fingerprinting Resistance:**
```typescript
export class FingerprintResistance {
  static obfuscateCanvas(): void;      // Canvas noise injection
  static obfuscateWebGL(): void;       // WebGL parameter randomization
  static spoofUserAgent(): string;     // Random UA generation
}
```

**Anti-Debugging:**
```typescript
export class AntiDebugging {
  // Detects developer tools via window size and debugger timing
  onDebugDetected(callback: () => void): void;
}
```

**Secure Memory:**
```typescript
export class SecureMemory {
  static clearString(str: string): void;
  static clearObject(obj: any): void;
  static clearArray(arr: any[]): void;
}
```

## Message Protocol

### Message Structure

All WebSocket messages follow this structure:

```typescript
interface WSMessage {
  type: 'message' | 'typing' | 'presence' | 'heartbeat' | 'security_event' | 'decoy';
  payload: any;
  timestamp: number;
  nonce: string;           // Replay attack prevention
  padding?: string;        // Traffic analysis resistance
}
```

### Message Types

**1. Chat Message:**
```json
{
  "type": "message",
  "payload": {
    "id": "uuid",
    "senderId": "user@example.com",
    "recipientId": "recipient@example.com",
    "roomId": "room-uuid",
    "encryptedContent": "base64-encrypted-data",
    "messageType": "text",
    "ephemeral": {
      "burnAfterReading": true,
      "expiresAt": 1234567890
    }
  },
  "timestamp": 1234567890,
  "nonce": "uuid"
}
```

**2. Typing Indicator:**
```json
{
  "type": "typing",
  "payload": {
    "userId": "user@example.com",
    "roomId": "room-uuid",
    "isTyping": true
  },
  "timestamp": 1234567890,
  "nonce": "uuid"
}
```

**3. Presence Update:**
```json
{
  "type": "presence",
  "payload": {
    "userId": "user@example.com",
    "status": "online",
    "lastSeen": 1234567890
  },
  "timestamp": 1234567890,
  "nonce": "uuid"
}
```

**4. Security Event:**
```json
{
  "type": "security_event",
  "payload": {
    "event": "screenshot",
    "details": "Canvas interception detected"
  },
  "timestamp": 1234567890,
  "nonce": "uuid"
}
```

**5. Heartbeat:**
```json
{
  "type": "heartbeat",
  "payload": {
    "timestamp": 1234567890
  },
  "timestamp": 1234567890,
  "nonce": "uuid"
}
```

**6. Decoy (Traffic Obfuscation):**
```json
{
  "type": "decoy",
  "payload": {
    "ciphertext": "random-base64-data",
    "iv": "random-base64-iv",
    "authTag": "random-base64-tag"
  },
  "timestamp": 1234567890,
  "nonce": "uuid",
  "padding": "random-hex-padding"
}
```

## Security Event Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Takes Screenshot                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          Client Security (lib/messaging/client-security.ts)     │
│  - ScreenshotDetector detects via canvas interception           │
│  - Triggers callback to useSecureWebSocket hook                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          useSecureWebSocket (hooks/useSecureWebSocket.ts)       │
│  - onSecurityEvent callback triggered                            │
│  - Sends security_event message to server                        │
│  - Updates local security alerts state                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          Messaging UI (app/portal/messages/page.tsx)            │
│  - Adds alert to securityAlerts array                            │
│  - Displays red notification panel in top-right                  │
│  - Shows "Screenshot Detected" with timestamp                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          Server (WebSocket Manager)                              │
│  - Logs security event to audit trail                            │
│  - Broadcasts to admins/room members                             │
│  - Updates user risk score                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Production Deployment

### Prerequisites

```bash
npm install ws @types/ws
npm install concurrently  # For running multiple processes
```

### WebSocket Server (`server/websocket.ts`)

See `/app/api/ws/route.ts` for complete production server setup code.

**Key steps:**
1. Create separate WebSocket server using `ws` library
2. Integrate with `wsManager` for OPSEC features
3. Implement authentication via session tokens
4. Add rate limiting and DDoS protection
5. Use Redis for multi-instance synchronization

### Environment Setup

```env
# .env.local
WEBSOCKET_PORT=3001
WEBSOCKET_URL=ws://localhost:3001
WEBSOCKET_SECURE=false

# Production
WEBSOCKET_URL=wss://ws.your-domain.com
WEBSOCKET_SECURE=true
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"ts-node server/websocket.ts\"",
    "build": "next build && tsc server/websocket.ts",
    "start": "concurrently \"next start\" \"node server/websocket.js\""
  }
}
```

### Infrastructure Requirements

**Platforms supporting WebSocket:**
- AWS (EC2, ECS with Application Load Balancer)
- Google Cloud Platform (Compute Engine, GKE)
- Azure (App Service, Container Instances)
- Railway.app
- Render.com
- Self-hosted VPS

**NOT supported:**
- Vercel (no persistent WebSocket connections)
- Netlify (no WebSocket support)
- Static hosting (GitHub Pages, S3, etc.)

### Scaling Considerations

**Single Instance:**
- Simple in-memory connection storage
- No additional infrastructure needed
- Suitable for up to ~10,000 concurrent connections

**Multi-Instance (Horizontal Scaling):**
- Use Redis for connection state sharing
- Implement Redis Pub/Sub for message broadcasting
- Session affinity (sticky sessions) on load balancer
- Shared message queue for offline message delivery

**Example Redis Integration:**
```typescript
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

// Broadcast message across all instances
await redisClient.publish('chat:messages', JSON.stringify(message));

// Subscribe to messages from other instances
await redisClient.subscribe('chat:messages', (msg) => {
  const message = JSON.parse(msg);
  broadcastToLocalConnections(message);
});
```

## Testing

### Manual Testing

1. **Connection Status:**
   - Open messaging page → verify "Live" status with latency
   - Disconnect network → verify "Offline" status
   - Reconnect → verify automatic reconnection

2. **Typing Indicators:**
   - Open two browser windows (different users)
   - Type in one window → verify "user is typing..." in other window
   - Stop typing for 3s → verify indicator disappears

3. **Security Alerts:**
   - Take screenshot (Cmd+Shift+4 or PrtScn) → verify red alert appears
   - Copy message text → verify clipboard alert
   - Open DevTools → verify debugging alert (may be delayed)

4. **Message Delivery:**
   - Send message → verify immediate appearance (optimistic update)
   - Check recipient window → verify real-time delivery
   - Disconnect and send → verify message queued and delivered on reconnect

### Automated Testing

```typescript
// __tests__/websocket.test.ts
import { useSecureWebSocket } from '@/hooks/useSecureWebSocket';
import { renderHook, act } from '@testing-library/react';

describe('WebSocket Hook', () => {
  it('should connect and send messages', async () => {
    const { result } = renderHook(() => useSecureWebSocket({
      roomId: 'test-room',
      onMessage: jest.fn(),
    }));

    await act(async () => {
      result.current.connect();
    });

    expect(result.current.state.connected).toBe(true);

    await act(async () => {
      result.current.sendMessage({
        type: 'message',
        payload: { text: 'test' },
        timestamp: Date.now(),
        nonce: 'test-nonce',
      });
    });

    // Verify message sent
  });

  it('should handle reconnection', async () => {
    const { result } = renderHook(() => useSecureWebSocket({}));

    // Simulate disconnect
    await act(async () => {
      result.current.disconnect();
    });

    expect(result.current.state.connected).toBe(false);

    // Wait for reconnection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    expect(result.current.state.reconnectAttempts).toBeGreaterThan(0);
  });
});
```

## Performance Metrics

**Expected Performance:**

| Metric | Value |
|--------|-------|
| Connection establishment | < 100ms |
| Message latency (same region) | < 50ms |
| Message latency (cross-region) | 100-300ms |
| Heartbeat interval | 15-45s (randomized) |
| Decoy interval | 30-120s (randomized) |
| Message padding overhead | ~20-30% |
| Reconnection backoff max | 30s |

**Bandwidth Usage:**

| Scenario | Bandwidth |
|----------|-----------|
| Idle connection (heartbeats + decoys) | ~1-2 KB/min |
| Active messaging (10 msg/min) | ~15-20 KB/min |
| Video call signaling | ~50-100 KB/min |

**Memory Usage:**

| Component | Memory |
|-----------|--------|
| Single connection | ~50-100 KB |
| 1000 connections | ~50-100 MB |
| Message history (1000 messages) | ~5-10 MB |

## Troubleshooting

### Connection Issues

**Problem:** WebSocket shows "Offline" permanently

**Solutions:**
1. Check browser console for errors
2. Verify WebSocket server is running (`netstat -an | grep 3001`)
3. Check firewall rules allow WebSocket port
4. Verify SSL certificate if using WSS
5. Test with `wscat -c ws://localhost:3001`

### Message Not Delivered

**Problem:** Messages sent but not received by recipient

**Solutions:**
1. Check both users are connected (look for "Live" status)
2. Verify users are in same room (for room messages)
3. Check browser console for WebSocket errors
4. Verify message format matches protocol
5. Check server logs for routing errors

### High Latency

**Problem:** Messages delayed by several seconds

**Solutions:**
1. Check network latency with `ping` command
2. Verify WebSocket server location (use same region as users)
3. Check for network throttling or VPN overhead
4. Monitor server CPU/memory usage
5. Consider using CDN with WebSocket support

### Security Alerts Not Working

**Problem:** Screenshot detection not triggering

**Solutions:**
1. Verify client-security.ts is imported and initialized
2. Check browser permissions (some detection methods may be blocked)
3. Test with different screenshot methods (keyboard vs. tools)
4. Check console for security initialization errors
5. Note: Detection is best-effort, not 100% reliable

## MITRE ATT&CK Coverage

This WebSocket implementation provides defensive coverage against:

- **T1071.001** (Application Layer Protocol: Web Protocols) - Encrypted WebSocket traffic
- **T1001** (Data Obfuscation) - Traffic padding and decoys
- **T1027** (Obfuscated Files or Information) - Encrypted payloads
- **T1573.001** (Encrypted Channel: Symmetric Cryptography) - Post-quantum encryption
- **T1027.010** (Command Obfuscation: Inline) - Timing randomization
- **T1056.001** (Input Capture: Keylogging) - Screenshot/clipboard detection
- **T1113** (Screen Capture) - Screenshot detection and alerts

## References

- **APT41 (Barium/Winnti)** - Traffic obfuscation techniques
- **Signal Protocol** - Double ratchet forward secrecy
- **NIST PQC** - Kyber-768 and Dilithium-3 specifications
- **RFC 6455** - WebSocket Protocol
- **MITRE ATT&CK** - Threat modeling framework

## License

This implementation is part of SWORD Intelligence and follows the same license as the main project.

## Support

For issues, questions, or contributions:
1. Check this documentation first
2. Review TRADECRAFT.md for security details
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
**Status:** Production Ready (with production WebSocket server deployment)
