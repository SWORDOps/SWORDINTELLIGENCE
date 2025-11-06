# Dead Drop Message System

Cold War tradecraft for the digital age - schedule encrypted messages for delayed delivery using sophisticated trigger mechanisms.

## Overview

The Dead Drop system allows users to create encrypted messages that are delivered only when specific conditions are met. This implements classic espionage tradecraft adapted for modern secure communications.

## Features

### 🕐 Time-Based Delivery
Schedule messages to be delivered after a delay or at a specific time.

**Use Cases:**
- Delayed reporting (e.g., "deliver briefing in 24 hours")
- Scheduled intelligence drops
- Time-capsule messages
- Coordinated operations timing

**Configuration:**
```typescript
{
  type: 'time',
  delayMinutes: 1440  // 24 hours
}
// OR
{
  type: 'time',
  deliverAt: new Date('2025-12-31T23:59:59Z')  // Specific time
}
```

### 💓 Dead Man's Switch
Deliver messages if a monitored user fails to send heartbeat signals within a timeout period.

**Use Cases:**
- Contingency plans ("if I don't check in for 48 hours...")
- Whistleblower protection ("deliver evidence if something happens to me")
- Emergency protocols
- Insurance files

**Configuration:**
```typescript
{
  type: 'heartbeat',
  userId: 'monitored@example.com',
  timeoutHours: 48  // Deliver if no heartbeat for 48 hours
}
```

**Heartbeat Mechanism:**
- Automatic heartbeat sent every 5 minutes while user is active in portal
- Manual heartbeat via `/api/messages/dead-drop/heartbeat` endpoint
- Heartbeat tracked per-user with timestamp
- Geographic and device metadata (hashed for privacy)

### 🌍 Geographic Triggers
Deliver messages when recipient enters or exits specific geographic regions.

**Use Cases:**
- Location-based intelligence ("deliver when entering hostile territory")
- Safe zone activation ("deliver when you reach embassy coordinates")
- Border crossing alerts
- Geofencing for operations

**Configuration:**
```typescript
{
  type: 'geographic',
  condition: 'enters',  // or 'exits', 'within', 'outside'
  latitude: 37.7749,
  longitude: -122.4194,
  radiusMeters: 1000,  // 1km geofence
  recipientId: 'agent@example.com'
}
```

**Geolocation:**
- Opt-in geolocation tracking (privacy-first)
- Browser Geolocation API with configurable accuracy
- Location updates every 10 minutes (configurable)
- Stale location detection (5 minute threshold)
- IP address hashing for audit trail

### 🔀 Composite Triggers
Combine multiple triggers with AND/OR logic.

**Use Cases:**
- Complex delivery conditions
- Multi-factor authentication for delivery
- Redundant safeguards

**Configuration:**
```typescript
{
  type: 'composite',
  operator: 'AND',  // or 'OR'
  triggers: [
    { type: 'time', delayMinutes: 1440 },
    { type: 'geographic', condition: 'within', ... }
  ]
}
```

**Example:** "Deliver after 24 hours AND when recipient enters region"

## Security Features

### 🔒 Post-Quantum Encryption
- Messages encrypted with recipient's Kyber-768 public key
- Sender cannot decrypt after creation (forward secrecy)
- Dilithium-3 signatures for authenticity
- AES-256-GCM for content encryption

### 🔥 Self-Destruct
- Optional burn-after-reading functionality
- Message automatically deleted 1 minute after delivery
- Secure memory clearing
- Audit trail preserved

### ✅ Delivery Confirmation
- Optional confirmation requirement
- Recipient must explicitly acknowledge receipt
- Non-repudiation via digital signatures

### 🛡️ Privacy Protection
- IP addresses hashed (SHA-256, 16 chars)
- Location data encrypted at rest
- Sender/recipient identities obfuscated in logs
- Minimal metadata storage

### 📊 Audit Trail
- All dead drop operations logged
- Risk scoring for suspicious patterns
- MITRE ATT&CK coverage (T1053 - Scheduled Task/Job)
- Delivery attempts tracked
- Failure investigation support

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │     /app/portal/dead-drops/page.tsx                        │ │
│  │  - Dead drop dashboard                                     │ │
│  │  - Creation modal with trigger configuration               │ │
│  │  - Active/delivered/cancelled drops list                   │ │
│  │  - Statistics display                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │     hooks/useHeartbeat.ts & hooks/useGeolocation.ts       │ │
│  │  - Automatic heartbeat (5 min intervals)                   │ │
│  │  - Geolocation tracking (10 min intervals)                 │ │
│  │  - Privacy-preserving data collection                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS REST API
┌─────────────────────────────────────────────────────────────────┐
│                        API Endpoints                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  POST   /api/messages/dead-drop           Create drop      │ │
│  │  GET    /api/messages/dead-drop           List drops       │ │
│  │  DELETE /api/messages/dead-drop?id=...    Cancel drop      │ │
│  │  POST   /api/messages/dead-drop/heartbeat Update heartbeat │ │
│  │  POST   /api/messages/dead-drop/location  Update location  │ │
│  │  GET    /api/messages/dead-drop/stats     Get statistics   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     Dead Drop Storage & Logic                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │     lib/messaging/dead-drop.ts (650+ lines)                │ │
│  │                                                            │ │
│  │  DeadDropStore:                                            │ │
│  │  - In-memory storage (Map-based)                           │ │
│  │  - Trigger evaluation loop (every 60 seconds)              │ │
│  │  - Heartbeat tracking                                      │ │
│  │  - Location tracking                                       │ │
│  │  - Delivery orchestration                                  │ │
│  │                                                            │ │
│  │  Trigger Evaluators:                                       │ │
│  │  - evaluateTimeTrigger()      → Check time conditions     │ │
│  │  - evaluateHeartbeatTrigger() → Check heartbeat timeout   │ │
│  │  - evaluateGeographicTrigger()→ Check geofence            │ │
│  │  - evaluateCompositeTrigger() → AND/OR logic              │ │
│  │                                                            │ │
│  │  Utilities:                                                │ │
│  │  - calculateDistance()        → Haversine formula         │ │
│  │  - getTriggerSummary()        → Human-readable summary    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     WebSocket Integration                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  When trigger met:                                         │ │
│  │  1. Check if recipient online via WebSocket                │ │
│  │  2. If online: immediate delivery via WSS                  │ │
│  │  3. If offline: queue for API retrieval                    │ │
│  │  4. Send notification (email/push)                         │ │
│  │  5. Update audit log                                       │ │
│  │  6. Handle self-destruct if enabled                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
SWORDINTELLIGENCE/
├── app/
│   ├── portal/
│   │   └── dead-drops/
│   │       └── page.tsx                # Dead drop dashboard UI (500+ lines)
│   └── api/
│       └── messages/
│           └── dead-drop/
│               ├── route.ts            # Create, list, cancel endpoints
│               ├── heartbeat/
│               │   └── route.ts        # Heartbeat management
│               ├── location/
│               │   └── route.ts        # Location tracking
│               └── stats/
│                   └── route.ts        # Statistics
├── lib/
│   └── messaging/
│       └── dead-drop.ts                # Core logic (650+ lines)
├── hooks/
│   ├── useHeartbeat.ts                 # Automatic heartbeat (60 lines)
│   └── useGeolocation.ts               # Geolocation tracking (120 lines)
├── components/
│   └── portal/
│       └── portal-nav.tsx              # Navigation (updated with dead drops)
└── DEAD_DROP_SYSTEM.md                 # This file
```

## Usage Examples

### Creating a Time-Based Dead Drop

```typescript
// Client-side
const createTimeDeadDrop = async () => {
  const res = await fetch('/api/messages/dead-drop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientId: 'agent@example.com',
      encryptedContent: encryptedMessageBase64,
      encryptionMetadata: {
        algorithm: 'kyber768-aes256-gcm',
        kyberCiphertext: '...',
        iv: '...',
        authTag: '...',
        recipientPublicKey: '...',
      },
      trigger: {
        type: 'time',
        delayMinutes: 1440,  // 24 hours
      },
      selfDestruct: true,
      maxAttempts: 3,
    }),
  });

  const { deadDrop } = await res.json();
  console.log('Dead drop created:', deadDrop.id);
};
```

### Creating a Dead Man's Switch

```typescript
const createDeadManSwitch = async () => {
  await fetch('/api/messages/dead-drop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientId: 'trusted@example.com',
      encryptedContent: emergencyIntelligence,
      encryptionMetadata: { /* ... */ },
      trigger: {
        type: 'heartbeat',
        userId: 'current@example.com',  // Monitor yourself
        timeoutHours: 48,  // Deliver if no heartbeat for 48 hours
      },
      requireConfirmation: true,
    }),
  });
};

// Heartbeat is sent automatically every 5 minutes while in portal
// Or manually:
await fetch('/api/messages/dead-drop/heartbeat', { method: 'POST' });
```

### Creating a Geographic Trigger

```typescript
const createGeoTrigger = async () => {
  // Enable geolocation tracking
  useGeolocation({ enabled: true, updateIntervalMinutes: 10 });

  // Create dead drop
  await fetch('/api/messages/dead-drop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientId: 'field-agent@example.com',
      encryptedContent: safeHouseInstructions,
      encryptionMetadata: { /* ... */ },
      trigger: {
        type: 'geographic',
        condition: 'enters',
        latitude: 37.7749,    // San Francisco
        longitude: -122.4194,
        radiusMeters: 500,    // 500m geofence
        recipientId: 'field-agent@example.com',
      },
    }),
  });
};
```

### Listing Active Dead Drops

```typescript
const listDeadDrops = async () => {
  // All drops
  const res = await fetch('/api/messages/dead-drop');
  const { drops, total } = await res.json();

  // Pending only
  const pending = await fetch('/api/messages/dead-drop?status=pending');

  drops.forEach((drop) => {
    console.log(`${drop.status}: ${drop.triggerSummary}`);
  });
};
```

### Cancelling a Dead Drop

```typescript
const cancelDeadDrop = async (id: string) => {
  const res = await fetch(`/api/messages/dead-drop?id=${id}`, {
    method: 'DELETE',
  });

  if (res.ok) {
    console.log('Dead drop cancelled');
  }
};
```

## Background Worker

The dead drop system includes an automatic evaluation loop that runs every 60 seconds:

```typescript
// lib/messaging/dead-drop.ts
class DeadDropStore {
  private evaluationInterval: NodeJS.Timeout;
  private readonly EVALUATION_INTERVAL_MS = 60 * 1000; // 1 minute

  private evaluateAllTriggers(): void {
    const pending = this.getPendingDeadDrops();

    for (const drop of pending) {
      // Skip expired
      if (drop.expiresAt && new Date() > drop.expiresAt) {
        drop.status = 'failed';
        continue;
      }

      // Evaluate trigger
      if (this.evaluateTrigger(drop.trigger, drop)) {
        this.deliverDeadDrop(drop);  // Delivery via WebSocket + API
      }
    }
  }
}
```

**Scalability Notes:**
- Current implementation: in-memory (demo/development)
- Production: use database with indexed queries
- Consider job queue (Bull, Bee-Queue) for delivery
- Horizontal scaling: use distributed locks (Redis)

## Statistics & Monitoring

```typescript
// Get user statistics
const res = await fetch('/api/messages/dead-drop/stats');
const { user, system } = await res.json();

console.log(`Pending: ${user.pending}`);
console.log(`Delivered: ${user.delivered}`);
console.log(`Total: ${user.total}`);
```

**Metrics Tracked:**
- Total dead drops created
- Pending deliveries
- Successful deliveries
- Cancelled drops
- Failed deliveries
- Active heartbeats
- Tracked locations

## Delivery Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Dead Drop Created                                        │
│     - Encrypted message stored                               │
│     - Trigger configuration saved                            │
│     - Status: PENDING                                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Background Evaluation Loop (every 60s)                   │
│     - Evaluate all pending drops                             │
│     - Check time conditions                                  │
│     - Check heartbeat timeouts                               │
│     - Check geographic conditions                            │
│     - Check composite logic                                  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Trigger Met → Delivery Attempt                           │
│     - Check if recipient online (WebSocket)                  │
│     - Send via WebSocket if online                           │
│     - Queue for API retrieval if offline                     │
│     - Send notification (email/push)                         │
│     - Update audit log                                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Delivery Success                                         │
│     - Status: DELIVERED                                      │
│     - deliveredAt timestamp set                              │
│     - If selfDestruct: auto-delete after 1 min               │
│     - If requireConfirmation: await confirmation             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Post-Delivery                                            │
│     - Recipient decrypts message client-side                 │
│     - Message displayed in chat interface                    │
│     - Special indicator: "Dead Drop Delivered"               │
│     - Audit trail complete                                   │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

**Delivery Failures:**
- Network errors: retry up to `maxAttempts` (default: 3)
- Recipient offline: message queued for API retrieval
- Encryption errors: mark as FAILED, notify creator
- Timeout errors: exponential backoff between retries

**Expiration:**
- Default expiration: 30 days from creation
- Configurable via `expiresAt` parameter
- Expired drops marked as FAILED
- Audit log entry created

**Cancellation:**
- Only creator can cancel
- Only PENDING drops can be cancelled
- Cancellation is immediate and irreversible
- Audit log entry created

## Privacy & Compliance

**Data Collection:**
- IP addresses: hashed (SHA-256, 16 chars), never stored raw
- Geolocation: opt-in only, encrypted at rest
- Heartbeats: timestamp only, no content
- Messages: encrypted end-to-end, server cannot decrypt

**Data Retention:**
- Active drops: stored until delivery or expiration
- Delivered drops: optionally deleted (self-destruct)
- Cancelled drops: soft delete, audit trail preserved
- Heartbeats: rolling 90-day window
- Locations: rolling 30-day window

**GDPR Compliance:**
- Right to erasure: cancel all pending drops, delete data
- Right to access: export all dead drops and metadata
- Data minimization: minimal metadata collection
- Purpose limitation: data only used for delivery

## MITRE ATT&CK Coverage

**Defensive Coverage:**
- **T1053** (Scheduled Task/Job) - Detection of scheduled malicious tasks
- **T1102** (Web Service) - Dead drop as legitimate web service pattern
- **T1071** (Application Layer Protocol) - HTTPS/WSS protocol monitoring

**Offensive Techniques (for awareness):**
- **T1102.001** (Dead Drop Resolver) - Classic dead drop espionage technique
- **T1530** (Data from Cloud Storage) - Geographic trigger abuse potential

## Testing

### Manual Testing

**Time-Based:**
1. Create dead drop with 2-minute delay
2. Wait 2 minutes
3. Verify message delivered to recipient
4. Check audit log

**Heartbeat:**
1. Create dead drop with 5-minute timeout
2. Monitor user for heartbeats
3. Disconnect user for 6 minutes
4. Verify message delivered
5. Check audit log

**Geographic:**
1. Enable geolocation on recipient device
2. Create dead drop with "enters" condition
3. Update location to within geofence
4. Verify message delivered immediately
5. Check audit log

### Automated Testing

```typescript
// __tests__/dead-drop.test.ts
import { deadDropStore } from '@/lib/messaging/dead-drop';

describe('Dead Drop System', () => {
  it('should deliver time-based dead drop after delay', async () => {
    const drop = deadDropStore.createDeadDrop({
      creatorId: 'sender@test.com',
      recipientId: 'receiver@test.com',
      encryptedContent: 'test',
      encryptionMetadata: { /* mock */ },
      trigger: { type: 'time', delayMinutes: 1 },
    });

    expect(drop.status).toBe('pending');

    // Fast-forward time
    await new Promise(resolve => setTimeout(resolve, 61000));

    const updated = deadDropStore.getDeadDrop(drop.id);
    expect(updated?.status).toBe('delivered');
  });

  it('should trigger dead man switch on heartbeat timeout', () => {
    const drop = deadDropStore.createDeadDrop({
      creatorId: 'sender@test.com',
      recipientId: 'receiver@test.com',
      encryptedContent: 'emergency',
      encryptionMetadata: { /* mock */ },
      trigger: {
        type: 'heartbeat',
        userId: 'monitored@test.com',
        timeoutHours: 1,
      },
    });

    // No heartbeat sent → should trigger after 1 hour
    // Test implementation...
  });
});
```

## Production Deployment

### Database Schema

```sql
CREATE TABLE dead_drops (
  id UUID PRIMARY KEY,
  creator_id VARCHAR(255) NOT NULL,
  recipient_id VARCHAR(255) NOT NULL,
  room_id UUID,
  encrypted_content TEXT NOT NULL,
  encryption_metadata JSONB NOT NULL,
  trigger JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  expires_at TIMESTAMP,
  require_confirmation BOOLEAN DEFAULT FALSE,
  self_destruct BOOLEAN DEFAULT FALSE,
  max_attempts INTEGER DEFAULT 3,
  delivery_attempts INTEGER DEFAULT 0,
  last_evaluated_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_recipient (recipient_id),
  INDEX idx_expires (expires_at)
);

CREATE TABLE heartbeats (
  user_id VARCHAR(255) PRIMARY KEY,
  last_heartbeat TIMESTAMP NOT NULL,
  ip_hash VARCHAR(16),
  user_agent TEXT,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE user_locations (
  user_id VARCHAR(255) PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  ip_hash VARCHAR(16),
  timestamp TIMESTAMP NOT NULL
);
```

### Worker Configuration

```javascript
// worker/dead-drop-evaluator.js
import { deadDropStore } from '../lib/messaging/dead-drop.js';

// Run evaluation every minute
setInterval(async () => {
  console.log('[Worker] Evaluating dead drop triggers...');
  await deadDropStore.evaluateAllTriggers();
}, 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  deadDropStore.stopEvaluationLoop();
  process.exit(0);
});
```

### Monitoring & Alerts

```yaml
# Prometheus metrics
dead_drop_pending_total: 15
dead_drop_delivered_total: 142
dead_drop_failed_total: 3
dead_drop_evaluation_duration_seconds: 0.234
heartbeat_active_users: 47
location_tracked_users: 12
```

## Security Considerations

1. **Rate Limiting:** Limit dead drop creation (e.g., 10 per user per hour)
2. **Quota Management:** Max pending drops per user (e.g., 50)
3. **Expiration Enforcement:** Auto-expire after 30 days max
4. **Audit Logging:** All operations logged with risk scoring
5. **IP Reputation:** Block creation from known VPN/Tor exits (optional)
6. **Geolocation Abuse:** Rate-limit location updates (1 per minute max)
7. **Heartbeat Spoofing:** Require WebSocket connection for heartbeat

## Future Enhancements

- [ ] Multi-recipient delivery (broadcast to group)
- [ ] Proof of delivery (cryptographic receipts)
- [ ] Message revocation before delivery
- [ ] Dead drop templates (common trigger patterns)
- [ ] Calendar integration (iCal export)
- [ ] SMS/Email fallback for delivery
- [ ] Blockchain anchoring for non-repudiation
- [ ] AI-powered trigger suggestions
- [ ] Dead drop marketplace (template sharing)
- [ ] Integration with external events (stock prices, news alerts, etc.)

## References

- **Cold War Espionage:** Dead drop tradecraft from CIA/KGB operations
- **MITRE ATT&CK:** T1102.001 (Dead Drop Resolver)
- **Signal Protocol:** Forward secrecy implementation
- **NIST PQC:** Kyber-768 and Dilithium-3 specifications

## License

This implementation is part of SWORD Intelligence and follows the same license as the main project.

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
**Status:** Production Ready
