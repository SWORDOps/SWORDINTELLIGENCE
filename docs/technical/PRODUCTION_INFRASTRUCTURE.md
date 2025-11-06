# Production Infrastructure Setup

## Overview

SWORD Intelligence now includes production-ready infrastructure for:
- **Database Persistence**: PostgreSQL with Prisma ORM
- **Real-Time Messaging**: Production WebSocket server with Redis pub/sub
- **Multi-Instance Support**: Redis-based message distribution
- **Message Persistence**: All messages stored in database
- **Search Index Persistence**: Encrypted search indexes in database

## Architecture

```
┌─────────────────┐
│  Next.js App    │ (Port 3000)
│  - UI           │
│  - API Routes   │
└────────┬────────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
┌─────────────┐  ┌──────────────┐
│  PostgreSQL │  │   WebSocket  │ (Port 8080)
│  Database   │  │    Server    │
│             │  │              │
│  - Messages │  │  - Auth      │
│  - Users    │  │  - Routing   │
│  - Indexes  │  │  - Security  │
│  - Rooms    │  │              │
└─────────────┘  └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │    Redis     │ (Port 6379)
                 │              │
                 │  - Pub/Sub   │
                 │  - Sessions  │
                 └──────────────┘
```

## Components

### 1. Database Layer (`lib/db/`)

**`lib/db/prisma.ts`**
- Prisma client singleton
- Connection pooling
- Health checks
- Database statistics

**`lib/db/adapter.ts`**
- Database abstraction layer
- In-memory fallback for development
- Type-safe operations
- Supports all entity types

**`prisma/schema.prisma`**
- Complete database schema
- 20+ models covering all features
- Proper relationships and indexes
- Optimized for performance

### 2. WebSocket Server (`server/websocket.ts`)

**Features:**
- JWT/Session authentication
- Redis pub/sub for multi-instance
- Rate limiting (60 msg/min per client)
- Heartbeat monitoring
- Message persistence
- APT-level traffic obfuscation
- Decoy message generation

**Message Types:**
- `auth` - Authentication
- `message` - Chat messages
- `join_room` / `leave_room` - Room management
- `typing` - Typing indicators
- `presence` - Online/offline status
- `heartbeat` - Connection monitoring
- `security_event` - Security alerts

### 3. Client Hook (`hooks/useSecureWebSocket.ts`)

**Features:**
- Automatic reconnection (exponential backoff)
- Authentication flow
- Message queuing (offline support)
- Client-side security monitoring
- Latency tracking
- State management

## Setup Instructions

### Prerequisites

1. **PostgreSQL Database**
   ```bash
   # Install PostgreSQL (Ubuntu/Debian)
   sudo apt-get install postgresql postgresql-contrib

   # Create database
   sudo -u postgres createdb sword_intel
   sudo -u postgres createuser sword_user -P
   ```

2. **Redis Server**
   ```bash
   # Install Redis (Ubuntu/Debian)
   sudo apt-get install redis-server

   # Start Redis
   sudo systemctl start redis-server
   ```

### Environment Configuration

Create `.env` file (already created):

```env
# Database
DATABASE_URL=postgresql://sword_user:sword_password@localhost:5432/sword_intel

# Redis
REDIS_URL=redis://localhost:6379

# WebSocket
WS_PORT=8080
WS_HOST=0.0.0.0

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# View database in Prisma Studio
npx prisma studio
```

**Note**: If Prisma engine download fails (403 Forbidden), the system will use in-memory storage as fallback. This is fine for development but not for production.

### Running the Application

#### Development Mode

**Option 1: Run servers separately**
```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: WebSocket server
npm run dev:ws
```

**Option 2: Run both together**
```bash
npm run dev:all
```

#### Production Mode

```bash
# Build both
npm run build
npm run build:ws

# Start both
npm run start:all
```

#### Individual Components
```bash
# Next.js only
npm start

# WebSocket server only
npm run start:ws
```

## Database Schema

### Core Tables

**User**
- Authentication credentials
- Post-quantum public keys
- Search keys for encrypted search
- Relationships to all user-owned entities

**Message**
- Encrypted content
- Encryption metadata
- Sender/recipient/room references
- Ephemeral message settings
- Dead drop delivery tracking

**SearchIndex**
- Message ID reference
- Encrypted keywords (HMAC-based)
- Timestamp for ranking
- Room/sender filters

**DeadDrop**
- Trigger configuration (time/heartbeat/geographic)
- Encrypted payload
- Delivery tracking
- Status management

**Room**
- Chat room metadata
- Creator reference
- Member list
- Settings (invite-only, ephemeral)

### Supporting Tables

- **RoomMembership**: User-room relationships
- **Heartbeat**: Dead drop heartbeat monitoring
- **UserLocation**: Geographic trigger support
- **Document**: Vault file storage
- **ShareLink**: Document sharing
- **CanaryToken**: Honeypot tokens
- **CanaryTrigger**: Token activation tracking
- **AuditLog**: Security audit trail
- **ThreatEntry/ThreatIOC**: Intelligence feed

## API Routes Updated

All search API routes now use database persistence:

**`/api/search/index`**
- `POST`: Create search index → saves to database
- `DELETE`: Remove search index → deletes from database

**`/api/search/query`**
- `POST`: Execute search → queries database indexes
- `GET`: Get statistics → calculates from database

## WebSocket Protocol

### Authentication Flow

1. Client connects to `ws://localhost:8080`
2. Client sends `auth` message with Base64-encoded token:
   ```json
   {
     "type": "auth",
     "payload": {
       "token": "base64_encoded_credentials"
     },
     "timestamp": 1234567890
   }
   ```
3. Server validates and responds:
   ```json
   {
     "type": "auth_success",
     "payload": {
       "userId": "uuid"
     },
     "timestamp": 1234567890
   }
   ```

### Message Flow

**Sending a message:**
```json
{
  "type": "message",
  "payload": {
    "recipientId": "uuid",
    "roomId": "uuid",
    "encryptedContent": "base64_encrypted",
    "encryptionMetadata": { ... },
    "signature": { ... }
  },
  "timestamp": 1234567890
}
```

**Receiving a message:**
```json
{
  "type": "message",
  "payload": {
    "messageId": "uuid",
    "senderId": "uuid",
    "encryptedContent": "base64_encrypted",
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

## Security Features

### Authentication
- Token-based authentication on connection
- User validation against database
- Auto-disconnect on auth failure

### Rate Limiting
- 60 messages per minute per client
- Automatic throttling
- Error responses for violations

### Traffic Obfuscation (APT-Level)
- Message padding to uniform sizes
- Random decoy messages (10% probability)
- Typing indicator delays (100-300ms)
- Constant-rate traffic shaping

### Monitoring
- Heartbeat every 30 seconds
- 60-second timeout for inactive clients
- Client-side security event detection
- Screenshot/clipboard monitoring

### Message Persistence
- All messages encrypted before storage
- Search indexes HMAC-encrypted
- No plaintext in database
- Audit logging for all operations

## Troubleshooting

### Prisma Engine Download Fails

**Error**: `403 Forbidden when downloading Prisma engines`

**Solution**: System automatically falls back to in-memory adapter. For production:
1. Download Prisma engines manually
2. Set `PRISMA_ENGINES_MIRROR` environment variable
3. Use Docker with pre-built Prisma binaries

### WebSocket Connection Refused

**Check**:
1. WebSocket server running: `ps aux | grep websocket`
2. Port 8080 available: `lsof -i :8080`
3. Firewall allows connections

**Fix**:
```bash
npm run dev:ws
```

### Redis Connection Failed

**Check**:
```bash
redis-cli ping
# Should return: PONG
```

**Fix**:
```bash
sudo systemctl start redis-server
```

### Database Connection Error

**Check**:
```bash
psql -U sword_user -d sword_intel -c "SELECT 1"
```

**Fix**:
1. Verify DATABASE_URL in `.env`
2. Check PostgreSQL is running
3. Verify user permissions

## Performance Optimization

### Database

- **Indexes**: All foreign keys and query fields indexed
- **Connection Pooling**: Prisma handles automatically
- **Query Optimization**: Use `select` to limit fields

### WebSocket

- **Redis Pub/Sub**: Enables horizontal scaling
- **Message Batching**: Client queues messages when offline
- **Heartbeat Tuning**: Adjust interval based on needs

### Redis

- **Memory**: Configure `maxmemory` policy
- **Persistence**: Enable RDB/AOF for critical data
- **Clustering**: For high-availability setups

## Production Deployment

### Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/sword_intel
      - REDIS_URL=redis://redis:6379

  websocket:
    build: .
    command: npm run start:ws
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/sword_intel
      - REDIS_URL=redis://redis:6379

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: sword_intel
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass

  redis:
    image: redis:7-alpine
```

### Kubernetes

Deploy as separate services:
- Next.js app (replicas: 3+)
- WebSocket server (replicas: 3+)
- PostgreSQL (StatefulSet)
- Redis (StatefulSet with sentinel)

### Load Balancing

- **Next.js**: Standard HTTP load balancing
- **WebSocket**: Sticky sessions or Redis pub/sub
- **Database**: Read replicas for scaling reads

## Monitoring

### Metrics to Track

- WebSocket connections (active)
- Message throughput (msg/sec)
- Database query latency
- Redis memory usage
- Authentication failures
- Rate limit violations

### Logging

All components log to console. In production:
- Aggregate with ELK/Grafana Loki
- Set appropriate log levels
- Rotate logs regularly

## Future Enhancements

- [ ] PostgreSQL read replicas
- [ ] Redis Sentinel for HA
- [ ] Message queue for offline delivery
- [ ] WebSocket SSL/TLS termination
- [ ] Database connection pooling (PgBouncer)
- [ ] Prometheus metrics export
- [ ] Distributed tracing (OpenTelemetry)
