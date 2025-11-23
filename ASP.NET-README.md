# SWORD Intelligence - ASP.NET Core Implementation

## 🗡️ Overview

This is a sophisticated ASP.NET Core 8.0 implementation of the SWORD Intelligence platform, featuring **esoteric architecture choices** while maintaining the original aesthetic. The implementation showcases modern .NET capabilities with post-quantum cryptography, real-time messaging, and enterprise security features.

## 🎨 Esoteric Design Choices

### 1. **Hybrid Architecture**
- **Razor Pages** for public marketing site
- **Blazor Server** for interactive portal components
- **MVC Controllers** for REST APIs
- **Minimal APIs** for lightweight endpoints
- **SignalR** for real-time WebSocket communication

### 2. **F# Cryptography Library**
All cryptographic operations are implemented in **F#** for:
- Functional purity and immutability
- Type safety in security-critical code
- Mathematical elegance for crypto algorithms
- Pattern matching for protocol state machines

### 3. **Post-Quantum Cryptography**
- **ML-KEM-1024** (Kyber) for key encapsulation
- **ML-DSA-87** (Dilithium) for digital signatures
- **Hybrid encryption**: AES-256-GCM + PQC
- CNSA 2.0 compliant

### 4. **Vertical Slice Architecture**
Features organized by capability rather than technical layer:
```
/Features
  /Messaging
    - Commands
    - Queries
    - Handlers
  /Vault
    - UploadDocument
    - DownloadDocument
  /Intelligence
    - SearchIndicators
    - SyncFeeds
```

### 5. **Modern C# Patterns**
- **Record types** for all DTOs and entities
- **Pattern matching** throughout
- **Init-only setters** for immutability
- **Primary constructors** in services
- **Source generators** for boilerplate

## 📁 Project Structure

```
SwordIntel/
├── SwordIntel.sln
├── src/
│   ├── SwordIntel.Web/           # Main web application
│   │   ├── Program.cs             # Application entry point
│   │   ├── Pages/                 # Razor Pages (marketing site)
│   │   ├── Controllers/           # API controllers
│   │   ├── Hubs/                  # SignalR hubs
│   │   ├── Middleware/            # Custom middleware
│   │   ├── Services/              # Application services
│   │   └── wwwroot/               # Static assets (CSS, JS)
│   │
│   ├── SwordIntel.Core/           # Domain models & interfaces
│   │   ├── Entities/              # Domain entities (records)
│   │   ├── Commands/              # CQRS commands
│   │   └── Queries/               # CQRS queries
│   │
│   ├── SwordIntel.Infrastructure/ # Data & external services
│   │   ├── Data/                  # EF Core DbContext
│   │   ├── Entities/              # Database entities (records)
│   │   └── Repositories/          # Data access
│   │
│   └── SwordIntel.Crypto/         # F# cryptography library
│       ├── PostQuantum.fs         # ML-KEM & ML-DSA
│       ├── Steganography.fs       # LSB image hiding
│       └── MessageEncryption.fs   # E2E encryption
```

## 🔐 Security Features

### Authentication
- **FIDO2/WebAuthn** with hardware key support
- **JWT Bearer** tokens with refresh rotation
- **Multi-Factor Authentication** (TOTP)
- **Role-based authorization**

### Middleware Pipeline
```csharp
app.UseMiddleware<SecurityHeadersMiddleware>();      // CSP, HSTS, COEP
app.UseMiddleware<RequestLoggingMiddleware>();       // Audit trail
app.UseMiddleware<ThreatDetectionMiddleware>();      // Attack pattern detection
app.UseMiddleware<RateLimitingMiddleware>();         // Distributed rate limiting
```

### Security Headers
- **Content-Security-Policy** with dynamic nonces
- **HSTS** (2 years preload)
- **Cross-Origin-Embedder-Policy**
- **X-Frame-Options: DENY**
- **Referrer-Policy: strict-origin**

## 🚀 Key Features

### 1. **Secure Messaging** (SignalR)
- End-to-end encryption with double ratchet
- Real-time WebSocket communication
- Message padding for traffic analysis resistance
- Ephemeral messages with auto-expiration

### 2. **Document Vault**
- Hybrid encryption (AES-256-GCM + ML-KEM-1024)
- Time-limited share links
- Version control
- Client-side encryption

### 3. **OSINT Intelligence Feeds**
- 18+ threat intelligence sources
- Background sync service
- Real-time feed via SignalR
- Searchable indicators

### 4. **Canary Tokens**
- DNS, HTTP, Email, Document tokens
- Trigger tracking with GeoIP
- Alert notifications
- Honeypot detection

### 5. **Dead Drop System**
- Time-based triggers
- Heartbeat monitoring
- Location-based activation
- Self-destruct on delivery

## 🎨 Dual Theme System

### OPS Theme (Dark/Special-Ops)
```css
--background: #0a0a0a
--accent: #00ff88 (neon green)
--surface: #111111
```
Features:
- Animated grid background
- Scanline effect
- Terminal aesthetic

### Advisory Theme (Light/Professional)
```css
--background: #fafafa
--accent: #0066cc (blue)
--surface: #ffffff
```
Features:
- Clean, professional design
- High contrast
- Business-ready

Toggle with theme button or `localStorage.setItem('theme', 'ops')`.

## 🛠️ Technology Stack

### Backend
- **ASP.NET Core 8.0**
- **Entity Framework Core 8.0** with PostgreSQL
- **SignalR** with Redis backplane
- **Redis** for distributed caching
- **Serilog** with PostgreSQL sink

### Cryptography
- **F# 8.0** functional crypto library
- **BouncyCastle** for PQC primitives
- **SixLabors.ImageSharp** for steganography
- **Fido2.AspNet** for WebAuthn

### Frontend
- **Razor Pages** for server-rendered pages
- **Blazor Server** for interactive components
- **Custom CSS** (dual theme system)
- **Vanilla JavaScript** (no framework dependencies)

## 📦 Database Schema

### Core Tables
- **Users** - User accounts with PQC keys
- **Authenticators** - WebAuthn credentials
- **Rooms** - Secure messaging rooms
- **Messages** - E2E encrypted messages
- **Documents** - Encrypted file vault
- **DeadDrops** - Trigger-based delivery
- **CanaryTokens** - Honeypot detection
- **OSINTIndicators** - Threat intelligence
- **AuditLogs** - Tamper-evident logs

All entities use **C# records** for immutability.

## 🔌 API Endpoints

### Public API
```
GET  /api/health                    - Health check
GET  /api/canary/beacon/{tokenId}   - Canary token trigger
GET  /api/canary/pixel/{tokenId}.png - Tracking pixel
```

### Authenticated API
```
GET  /api/messages/rooms/{roomId}   - Get room messages
POST /api/messages                  - Send encrypted message
POST /api/vault/upload              - Upload encrypted document
GET  /api/vault/download/{id}       - Download document
POST /api/vault/share               - Create share link
GET  /api/intelligence/search       - Search threat indicators
```

### Admin API (Requires admin role)
```
POST /api/intelligence/sync         - Trigger OSINT sync
```

## 🎯 SignalR Hubs

### SecureMessageHub (`/hubs/messages`)
```csharp
Task SendMessage(string roomId, byte[] encryptedContent, ...)
Task JoinRoom(string roomId)
Task LeaveRoom(string roomId)
Task SendTypingIndicator(string roomId)
```

### IntelligenceFeedHub (`/hubs/intelligence`)
```csharp
Task SubscribeToCategory(string category)
```

## 🏃 Getting Started

### Prerequisites
```bash
# Install .NET 8.0 SDK
dotnet --version  # Should be 8.0.x

# Install PostgreSQL
psql --version    # 14.x or higher

# Install Redis
redis-cli --version
```

### Configuration

Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=swordintel;...",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "SecretKey": "CHANGE_THIS_TO_A_SECURE_KEY"
  }
}
```

### Run the Application

```bash
# Navigate to solution directory
cd SWORDINTELLIGENCE

# Restore dependencies
dotnet restore

# Run migrations
cd src/SwordIntel.Web
dotnet ef database update

# Run application
dotnet run
```

Visit `https://localhost:7001`

## 🧪 Testing Cryptography

The F# crypto library can be tested independently:

```fsharp
open SwordIntel.Crypto.PostQuantum

// Generate PQC keypair
let keyPair = generateKyberKeyPair()

// Encapsulate shared secret
let encapsulated = encapsulate keyPair.PublicKey

// Decapsulate
let secret = decapsulate keyPair.PrivateKey encapsulated.Ciphertext
```

## 🔒 Post-Quantum Crypto Flow

### Key Encapsulation
```
Client                          Server
------                          ------
   |                               |
   |  1. Request PQ public key     |
   |------------------------------>|
   |                               |
   |  2. KyberPublicKey (1568 B)   |
   |<------------------------------|
   |                               |
   |  3. Encapsulate shared secret |
   |      (ML-KEM-1024)            |
   |                               |
   |  4. Send ciphertext           |
   |------------------------------>|
   |                               |
   |  5. Decapsulate to get secret |
   |      (both now have AES key)  |
```

### Hybrid Encryption
```
Encrypt: AES-256-GCM(plaintext) + ML-KEM(AES_key)
Decrypt: ML-KEM^-1(ciphertext) -> AES_key -> AES^-1(data)
```

## 📊 Background Services

### OSINTSyncService
- Runs every 60 minutes (configurable)
- Syncs threat intelligence feeds
- Updates indicators in database
- Broadcasts new threats via SignalR

### DeadDropMonitorService
- Runs every 1 minute
- Checks time-based triggers
- Monitors heartbeat signals
- Evaluates location conditions
- Triggers message delivery

### HeartbeatMonitorService
- Runs every 6 hours
- Cleans old heartbeat data
- Removes stale location records
- Maintains database hygiene

## 🎨 Custom Tag Helpers

```csharp
// Theme-aware components
<theme-card theme="ops">
    Content
</theme-card>

// Security badge
<security-badge level="ml-kem-1024" />

// Encrypted field
<encrypted-input asp-for="SecretData" />
```

## 🚦 Middleware Architecture

### Request Pipeline Flow
```
Client Request
    ↓
SecurityHeadersMiddleware    (CSP, HSTS)
    ↓
RequestLoggingMiddleware     (Audit trail)
    ↓
ThreatDetectionMiddleware    (Pattern matching)
    ↓
RateLimitingMiddleware       (Redis-backed)
    ↓
Authentication               (JWT/WebAuthn)
    ↓
Authorization                (Role-based)
    ↓
Endpoint Routing
    ↓
Controller/Page/Hub
```

## 🌟 Unique Features vs Original Next.js

### 1. **F# Cryptography**
Original: TypeScript crypto → New: F# functional crypto

### 2. **SignalR vs WebSocket Server**
Original: Custom WS server → New: SignalR with Redis backplane

### 3. **Razor Pages + Blazor Hybrid**
Original: React components → New: Server-side rendering + Blazor

### 4. **EF Core Records**
Original: Prisma → New: EF Core with C# records

### 5. **Middleware Pipeline**
Original: Next.js middleware → New: Custom ASP.NET middleware chain

### 6. **Vertical Slices**
Original: Feature folders → New: CQRS-lite with MediatR

## 📈 Performance Optimizations

- **Redis caching** for hot data
- **SignalR backplane** for horizontal scaling
- **Response compression**
- **Static file caching**
- **Database query optimization** with indexes
- **Connection pooling** (Npgsql)

## 🔍 Logging & Monitoring

### Serilog Configuration
```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.PostgreSQL(...)  // Tamper-evident logs
    .Enrich.FromLogContext()
    .CreateLogger();
```

### Audit Trail
All sensitive operations logged:
- Authentication attempts
- Document access
- Message sending
- Admin actions
- Canary token triggers

## 🚀 Deployment

### Docker Support (Future)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SwordIntel.Web.dll"]
```

### Environment Variables
```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="..."
ConnectionStrings__Redis="..."
Jwt__SecretKey="..."
```

## 🤝 Contributing

This is a showcase implementation demonstrating:
- Modern ASP.NET architecture
- F# cryptography integration
- Post-quantum security
- Real-time messaging
- Hybrid UI approaches

## 📄 License

Same as original project.

## 🎯 Showcase Highlights

### Why This Implementation Stands Out

1. **F# for Security**: Functional programming for crypto = fewer bugs
2. **Record Immutability**: All entities are immutable C# records
3. **Post-Quantum Ready**: ML-KEM & ML-DSA from day one
4. **Hybrid Architecture**: Best of Razor, Blazor, MVC, and Minimal APIs
5. **Enterprise Patterns**: CQRS, vertical slices, middleware pipeline
6. **Real-time Everything**: SignalR for messaging and intelligence feeds
7. **Security First**: Defense in depth with multiple middleware layers
8. **Dual Themes**: Maintained aesthetic with theme system
9. **Type Safety**: Leverages C# 12 and F# type systems
10. **Scalable**: Redis backplane for horizontal scaling

---

**Built with ASP.NET Core 8.0 + F# | Post-Quantum Encrypted | Enterprise Ready**
