# SWORD Intelligence

**Independent private intelligence firm specializing in Web3 and cyber threats.**

> Adversaries don't play fair. Nor do we,except the laws on our side and im a patient man...hiding a very impatient one so we get shit done.

---

## 🚀 Dual Implementation Architecture

This repository contains **TWO complete implementations** of the SWORD Intelligence platform:

### 1️⃣ **Next.js Platform** (Original - Production)
- **Location**: Root directory
- **Purpose**: Primary production platform
- **Stack**: Next.js 15, React 18, TypeScript, PostgreSQL, Redis
- **Status**: ✅ Production-ready with full feature set

### 2️⃣ **ASP.NET Core Platform** (Showcase - Esoteric)
- **Location**: `src/` directory
- **Purpose**: Showcase advanced .NET capabilities with experimental architecture
- **Stack**: ASP.NET Core 8.0, F#, C# 12, PostgreSQL, Redis
- **Status**: ✅ Feature-complete with tactical military theme
- **Special**: Hybrid architecture + F# cryptography + retro 90s aesthetic

Both implementations share the same mission and security standards but demonstrate different architectural approaches and technology stacks.

---

## 🎯 Mission

SWORD Intelligence helps funds, founders, enterprises, and government clients prevent loss, hunt threat actors, and respond to high-stakes incidents across Web3 and traditional cyber infrastructure.

### Core Focus Areas

- **Threat Actor Hunter**: I will find your target,i will dissect their life,TTP's and somehow become their best friend right up until the door gets kicked down...no target too much give the right pay.
- **Cyber Threat Intelligence**: APT tracking, nation-state operations, infrastructure analysis , focus on APT-41 in particular they seem to be very fond of me even burnt 11 0days trying to hit me.
- **Counter-Narcotics Intelligence**: Fighting synthetic opioid supply chains and other components of the chemical warfare PRC program..at the same time i liase with chinese labs encouraging safer drugs.
- **Web3 & Crypto Crime**:asset tracking and detainment given the right budget ill do it myself, ransomware negotiator andasset recovery , sanctioned red team ops all the way up to nation state level with the paperwork.
- **Executive Protection**: UHNWI and C-suite cyber security (OPSEC, identity fragmentation , cybersecurity)...having had my own identiy and full passport etc leaked by the PRC i know how to handle this.
- **Bespoke Services**: Variety of services on inquiry from logistics,laboratory design to private jet charter just ask...maybe i can even get you on a phone call with john mcaffee for your virus problem who knows.


---

## 🏗️ Technical Stack(OK i showed off a tiny bit)

### Next.js Platform Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom theme system
- **Components**: shadcn/ui + custom components

#### Backend & Infrastructure
- **Database**: PostgreSQL with Prisma ORM
- **Real-Time**: WebSocket server (ws) with Redis pub/sub
- **Caching**: Redis for multi-instance coordination
- **Authentication**: NextAuth with MFA support

### Security (CNSA 2.0 Compliant)
- **Post-Quantum Cryptography**: ML-KEM-1024 + ML-DSA-87 (NIST FIPS 203/204, Level 5)
- **Hashing**: SHA-384 for all cryptographic operations
### ASP.NET Core Platform Stack (Esoteric Showcase)

#### Hybrid Architecture (Why Choose One?)
- **Razor Pages**: Public marketing site (Index, About, Programs, DirectEye)
- **Blazor Server**: Interactive portal with real-time UI updates
- **MVC Controllers**: RESTful API endpoints
- **SignalR**: Real-time messaging with MessagePack protocol
- **Minimal APIs**: Lightweight HTTP endpoints for microservices

#### Cryptography Layer (F# Functional Implementation)
- **Language**: F# 8.0 for cryptographic operations
- **Modules**:
  - `PostQuantum.fs`: ML-KEM-1024 + ML-DSA-87 (BouncyCastle)
  - `Steganography.fs`: LSB image encoding (SixLabors.ImageSharp)
  - `MessageEncryption.fs`: AES-256-GCM + Double Ratchet
- **Design**: Pure functions, immutable data structures, railway-oriented error handling

#### Core Services (C# 12 with Records)
- **Entity Framework Core 8.0**: PostgreSQL with compiled models
- **Database Entities**: All C# records for immutability
- **Services**: Message, Vault, Authentication, OSINT, DeadDrop
- **Middleware**: Custom pipeline (SecurityHeaders, ThreatDetection, RateLimit)

#### Infrastructure
- **Database**: PostgreSQL 16 with EF Core migrations
- **Caching**: Redis with StackExchange.Redis
- **SignalR Backplane**: Redis for horizontal scaling
- **Background Services**: IHostedService for OSINT sync and dead drop monitoring

#### Theme System
- **Aesthetic**: Retro 90s military/tactical contractor
- **Themes**: OPS (dark/tactical), Advisory (light/professional)
- **Effects**: CRT scanlines, radar sweep, tactical grid overlays, corner cuts
- **Fonts**: Orbitron (headers), Share Tech Mono (code/data)
- **Colors**: Tactical green (#76ff03), milspec green (#4caf50), radar green (#00ff41)

#### Docker Infrastructure
- **Multi-Stage Build**: SDK Alpine → Runtime Alpine
- **Services**: PostgreSQL 16, Redis 7, pgAdmin 4, Redis Commander
- **Setup Scripts**: Bash (`setup.sh`) and PowerShell (`setup.ps1`) with ASCII art
- **Health Checks**: Container dependency management

### Shared Security Features
- **Post-Quantum Cryptography**: ML-KEM-1024 + ML-DSA-87 (NIST FIPS 203/204, Level 5) - All my work is CNSA 2.0 compliant.
- **Encryption**: AES-256-GCM with forward secrecy (double ratchet)
- **Key Derivation**: PBKDF2-SHA384, HKDF-SHA384
- **Message Authentication**: HMAC-SHA384
- **Standards Compliance**: **CNSA 2.0** (Commercial National Security Algorithm Suite)
- **Biometric Authentication**: WebAuthn/FIDO2 (YubiKey, CAC, platform authenticators)
- **Steganography**: LSB (Least Significant Bit) image encoding with AES-256-GCM
- **Searchable Encryption**: HMAC-SHA384 based SSE for privacy-preserving search
- **Headers**: CSP with nonce, HSTS, COOP/COEP, strict referrers

### Privacy & Compliance
- **Baseline**: U.S./Iowa with regional compliance switches(Privacy is dead palantir killed it)
- **Audit**: Comprehensive tamper-evident logging aka full IA3 self-snitching capability...that being said off the record talks are possible just ask
- **Vetting**: KYC/KYB with sanctions screening

---

## 🚀 Features

### Public Site

- **Dual Theme System**: Special-Ops (dark) and Advisory (light) themes with instant switching
- **Service Pages**: Intelligence, Response, Resilience with detailed capability breakdowns
- **Live Threat Intel Feed**: Real-time threat data across multiple categories:
  - Nation-state APT operations (APT28, APT41, Lazarus Group all the way to minor ones like TeamTNT)
  - Critical infrastructure incidents(Big fan of SCADA i host a fake nuclear reactor thats melted down 3 times now)
  - Web3/DeFi exploits and crypto crime(Lazarus love this)
  - **Narcotics trafficking** (fentanyl precursors, ultra-potent opioids, darknet markets, development of safer alternatives and mitigation + work w/ customs)
  - Supply chain vulnerabilities
- **Animated Stats**: Scroll-triggered counters showing operational track record
- **Methods & Compliance**: Transparent lawful methodologies and client vetting procedures...really extensive ones i will not lie(ever)
- **Secure Contact**: PGP-encrypted contact forms with progressive profiling but if thats not safe enough i have other options up to a 1 use program that joins you to my quantum backed worldwide mesh comnet

### Strategic Capabilities (Public)

- **Shenzhen Supply Chain Intelligence**: Full access to electronics manufacturing ecosystem(Special Inventory to NATO vetted contractors/groups...so you can buy your own stuff just copied)
- **Russian Technology Access**: Procurement and analysis capability for dual-use tech (lawful purposes, rigorous vetting) all the way to very unique items(collectors amount of lithium deuteride for anyone who wants it)
- **Global Rapid Response**: UK-based with 24-hour deployment capability worldwide you make the calll foot the bill provide the brief im there with a team if the job needs it.
- **Intelligence Community Coordination**: Relationships with government/IC partners across the world (need to know basis...you dont right now.)

### 🎨 ASP.NET Core Public Pages

#### Home (`/`)
- **Hero Section**: SWORD Intelligence branding with tactical shield logo
- **Stats Grid**: 4 animated counters (ML-KEM-1024, 87-param DSA, 256-bit AES, 18 OSINT feeds)
- **Features**: 8 capability cards with tactical clip-path borders
- **Technology Stack**: Overview of hybrid architecture
- **Loading Screen**: Tactical spinner with progress bar
- **Back-to-Top**: Floating button with corner cuts
- **Keyboard Shortcuts**: Ctrl+K (theme toggle), Ctrl+/ (search), ESC (close modals)

#### Programs (`/programs`)
- **KP14**: Advanced malware analysis platform
  - Hybrid VM execution (Cuckoo + QEMU + custom sandbox)
  - 37 behavioral indicators, ML scoring
  - Automated IoC extraction and YARA generation
- **Kyberlock**: Post-quantum key management
  - ML-KEM-1024 + ML-DSA-87 (NIST Level 5)
  - <1ms key rotation, HSM integration
  - CNSA 2.0 compliant
- **SwordComm**: Secure messaging platform
  - Double ratchet E2EE, APT-level obfuscation
  - WebAuthn MFA, dead drop system
  - Geographic/heartbeat triggers
- **SPINDEX**: Searchable encryption engine
  - HMAC-based SSE, Bloom filters
  - Porter stemming, Soundex phonetic matching
  - Privacy-preserving search (no plaintext exposure)

#### DirectEye (`/directeye`) - **RESTRICTED ACCESS**
- **Access Level**: Government agencies & approved contractors only
- **Restricted Banner**: Hazard stripe pattern with ⚠ classified marker
- **Capabilities**: 6 core features
  - 40+ OSINT services (398+ government endpoints)
  - Blockchain analysis (100K+ labeled addresses)
  - ML analytics (99.7% detection accuracy)
  - Post-quantum crypto (NIST Level 5)
  - Key rotation (<1ms rotation time)
  - Real-time monitoring (10K+ tx/sec capacity)
- **Technical Specs**: 4 categories (ML, Cryptography, Blockchain, Data Intelligence)
- **Development Timeline**: Phase 1-6 all marked COMPLETE
- **Performance Metrics**:
  - 51,906 addresses/second (5.2x faster)
  - <100ms ML risk scoring (5x faster)
  - 10-15ms encryption flow (6-10x faster)
  - 10K+ tx/sec monitoring (10x capacity)
  - 100% test coverage (78+ tests passing)
  - 99.7% detection rate
- **Approved Organizations**: Law enforcement, intelligence community, defense contractors, FinCEN/OFAC, blockchain forensics

#### About (`/about`)
- **Technology Overview**: Dual architecture explanation
- **Esoteric Design Choices**: F# cryptography rationale
- **Architecture Highlights**: Hybrid pattern benefits

#### Error Pages
- **404 Page**: Custom "ACCESS DENIED" with glitch effect
- **Tactical Aesthetic**: Large 404 with terminal-style messaging

#### SEO & Metadata
- **Meta Tags**: Description, keywords, author
- **Open Graph**: Full OG tag suite for social sharing
- **Twitter Cards**: Summary cards with images
- **Favicons**: SVG tactical shield icon
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Search engine directives with portal/admin exclusions

### 🔐 Client Portal - Secure Operations Center

#### Authentication & Access Control (CNSA 2.0 Compliant)
- **Post-Quantum Encryption**: ML-KEM-1024 key encapsulation + ML-DSA-87 digital signatures (NIST Level 5)
- **Cryptographic Hashing**: SHA-384 for all signatures and key derivation (CNSA 2.0 compliant)
- **Hardware Security Keys**: WebAuthn/FIDO2 with database persistence (YubiKey, CAC/PIV, Titan Security Key)
- **Biometric Authentication**: Platform authenticators (Face ID, Touch ID, Windows Hello, fingerprint readers)
- **Multi-Factor Authentication**: TOTP, hardware keys, biometric verification
- **Session Management**: Secure token rotation with automatic timeout
- **Authenticator Management**: Register, list, and revoke hardware security keys via portal
- **Standards Compliance**: Full CNSA 2.0 alignment for national security applications

#### 🗂️ Encrypted Document Vault
- **Hybrid Encryption**: AES-256-GCM + Post-Quantum KEMs
- **File Organization**: Tags, metadata, versioning
- **Secure Sharing**: Time-limited share links with access logs
- **Client-Side Encryption**: Files encrypted before upload
- **Canary Tokens**: Honeypot documents for breach detection

#### 💬 Secure Messaging (APT-Level Tradecraft)
- **Real-Time WebSocket**: Production server with database persistence
- **End-to-End Encryption**: Double ratchet with forward secrecy
- **Traffic Obfuscation**: APT41-inspired techniques
  - Message padding to uniform sizes
  - Random decoy message generation
  - Timing randomization
  - Constant-rate traffic shaping
- **Room-Based Chat**: Private channels with member management
- **Ephemeral Messages**: Burn-after-reading, auto-expiration
- **Typing Indicators**: Obfuscated timing for OPSEC
- **Presence Tracking**: Online/offline status with privacy controls
- **Security Monitoring**: Screenshot/clipboard detection alerts

#### 📨 Dead Drop System (Cold War Tradecraft)
- **Time-Based Release**: Schedule messages for future delivery
- **Heartbeat Triggers**: Auto-deliver if no check-in for N hours
- **Geographic Triggers**: Deliver when entering/leaving region (Haversine distance)
- **Composite Triggers**: AND/OR logic for complex conditions
- **Self-Destruct**: Automatic payload deletion after delivery
- **Confirmation Required**: Optional recipient acknowledgment
- **Delivery Tracking**: Full audit trail of trigger evaluations

#### 🖼️ Steganographic Attachments (LSB Encoding)
- **Image Embedding**: Hide files in PNG images using Least Significant Bit
- **Encryption Layer**: AES-256-GCM encryption of payload before embedding
- **Format Support**: PNG carrier images, any file type payload
- **Capacity Analysis**: Pre-flight checks for sufficient carrier capacity
- **Checksum Verification**: SHA-256 integrity validation
- **Metadata Preservation**: File type, name, size embedded with payload
- **Extraction**: Decrypt and extract hidden files from carrier images

#### 🔍 Encrypted Message Search
- **Searchable Symmetric Encryption (SSE)**: Privacy-preserving search without decryption
- **HMAC-Based Indexing**: Keywords encrypted with keyed hash
- **Trapdoor Queries**: Generate search tokens without exposing terms
- **Fuzzy Matching**:
  - Porter stemming (running → run)
  - Soundex phonetic matching (Smith → S530)
  - Levenshtein distance for typo tolerance
- **Stop Word Filtering**: Remove common words for efficiency
- **Bloom Filters**: Fast index lookups
- **Privacy-Preserving**: Server never sees plaintext search terms or message content

#### 👑 Admin Panel (Oversight & Control)
- **Role-Based Access Control**: 4 tiers (user, analyst, admin, super_admin)
- **Permission System**: 25+ granular permissions
- **Audit Logging**: 40+ event types with tamper-evident logs
- **Risk Scoring**: Automated suspicious activity detection
- **System-Wide Oversight**:
  - User management (roles, permissions, disable/enable)
  - Vault document monitoring and quarantine
  - Canary token tracking and alert management
  - Message metadata analysis (no content access)
  - Search activity monitoring
  - Dead drop trigger oversight
- **Metrics Dashboard**: Real-time operational statistics
- **Security Events**: Centralized alert console

#### 🔍 OSINT Threat Intelligence (DIRECTEYE)
- **18 Integrated Feeds**: Automated threat intelligence aggregation
  - **Malware**: URLhaus, Feodo Tracker, SSL Blacklist, DigitalSide Threat-Intel
  - **Phishing**: PhishTank, OpenPhish
  - **Threat Intel**: AlienVault OTX, VirusTotal
  - **Infrastructure**: Shodan, FBI InfraGard, Blocklist.de, Tor Exit Nodes
  - **Narcotics**: DEA Most Wanted, Ultrapotent Synthetic Opioids
  - **Darknet**: Tor Onion Markets
  - **Cryptojacking**: Mining Pool IPs
- **Database Caching**: PostgreSQL-backed indicator storage for fast lookups
- **Background Sync**: Automatic feed updates with configurable intervals
- **Deduplication**: Unique constraints prevent duplicate indicators
- **Search & Filtering**: Query by feed, severity, type, keyword
- **Feed Health Monitoring**: Track last sync, errors, and indicator counts

#### 📊 Intelligence Reporting
- **ICD-203 Compliant**: Intelligence Community Directive formatting
- **Digital Signatures**: ML-DSA-87 post-quantum signatures (NIST FIPS 204)
- **Confidence Levels**: Structured analytic assessments
- **Source Attribution**: SIGINT, OSINT, HUMINT tagging
- **Distribution Controls**: TLP (Traffic Light Protocol) markings

### 🏗️ Production Infrastructure

#### Database Layer
- **PostgreSQL**: Enterprise-grade persistence
- **Prisma ORM**: Type-safe database operations
- **Schema**: 22+ models covering all entities
  - Users & authentication
  - **Authenticators**: WebAuthn/FIDO2 hardware security keys
  - Messages & rooms
  - Search indexes
  - Dead drops & triggers
  - Heartbeats & locations
  - Documents & shares
  - Canary tokens
  - Audit logs
  - **OSINT Feeds**: Threat intelligence feed metadata
  - **OSINT Indicators**: Cached threat indicators (IPs, domains, hashes, URLs)
- **Connection Pooling**: Automatic resource management
- **Health Checks**: Monitoring and diagnostics
- **Fallback Support**: In-memory adapter for development

#### WebSocket Server
- **Standalone Service**: Independent WebSocket server (port 8080)
- **Authentication**: Token-based auth with JWT validation
- **Redis Pub/Sub**: Multi-instance horizontal scaling
- **Rate Limiting**: 60 messages/minute per client
- **Heartbeat Monitoring**: 30-second intervals, 60-second timeout
- **Message Persistence**: All messages stored to database
- **Graceful Shutdown**: Clean connection termination
- **Error Recovery**: Automatic reconnection with exponential backoff

#### Scalability & Reliability
- **Multi-Instance**: Deploy N instances with Redis coordination
- **Load Balancing**: Sticky sessions or Redis pub/sub routing
- **Offline Support**: Message queuing for disconnected clients
- **Message History**: Paginated history loading from database
- **Database Replication**: Read replicas for scaling
- **High Availability**: Redis Sentinel for failover

---

## 📂 Project Structure

### Next.js Platform

```
├── app/                      # Next.js app directory
│   ├── about/               # Company information, capabilities
│   ├── contact/             # Secure intake forms
│   ├── insights/            # Blog / case studies
│   ├── intel-feed/          # Live threat intelligence dashboard
│   ├── methods/             # Compliance & methodologies
│   ├── portal/              # Secure client portal (auth-gated)
│   │   ├── admin/           # Admin oversight panel
│   │   ├── canary/          # Canary token management
│   │   ├── messages/        # Real-time secure messaging
│   │   ├── reports/         # Intelligence reports
│   │   └── vault/           # Encrypted document storage
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── search/          # Encrypted search API
│   │   └── ...              # Other API routes
│   ├── privacy/             # Privacy notice
│   ├── services/            # Service detail pages
│   └── terms/               # Terms of service
├── components/              # React components
│   ├── ui/                  # Base UI components (shadcn)
│   ├── admin/               # Admin panel components
│   ├── messaging/           # Chat components
│   ├── vault/               # Document vault components
│   └── ...                  # Other components
├── lib/                     # Utilities and libraries
│   ├── admin/               # Admin logic & audit logging
│   ├── auth/                # Authentication logic
│   ├── crypto/              # Post-quantum cryptography
│   ├── db/                  # Database adapters (Prisma)
│   ├── intelligence/        # Threat feed data
│   ├── messaging/           # WebSocket, dead drops, security
│   ├── search/              # Searchable encryption (SSE)
│   ├── steganography/       # LSB encoding/decoding
│   └── vault/               # Document encryption
├── server/                  # Backend servers
│   └── websocket.ts         # Production WebSocket server
├── prisma/                  # Database schema
│   └── schema.prisma        # Prisma models
├── hooks/                   # React hooks
│   ├── useSecureWebSocket.ts # WebSocket client hook
│   └── ...                  # Other hooks
├── docs/                    # Documentation
│   ├── technical/           # Technical implementation docs
│   │   ├── BIOMETRIC_AUTH.md
│   │   ├── OSINT_FEEDS.md
│   │   ├── PRODUCTION_INFRASTRUCTURE.md
│   │   ├── DEAD_DROP_SYSTEM.md
│   │   ├── TRADECRAFT.md
│   │   └── WEBSOCKET_IMPLEMENTATION.md
│   ├── setup/               # Setup and deployment guides
│   │   ├── SETUP_GUIDE.md
│   │   ├── API_KEY_TROUBLESHOOTING.md
│   │   ├── API_KEYS_STATUS.md
│   │   └── SETUP_STATUS.md
│   └── legal/               # Legal documents
│       ├── PRIVACY_POLICY.md
│       └── TERMS_OF_SERVICE.md
├── scripts/                 # Utility scripts
│   ├── osint-sync-worker.ts # OSINT background sync worker
│   └── apply-migration.sh   # Database migration helper
└── public/                  # Static assets
```

### ASP.NET Core Platform

```
src/
├── SwordIntel.sln                         # Solution file (4 projects)
│
├── SwordIntel.Web/                        # Main web application (ASP.NET Core 8.0)
│   ├── SwordIntel.Web.csproj             # Project file with PackageReferences
│   ├── Program.cs                         # Application entry point & middleware pipeline
│   ├── appsettings.json                   # Configuration (DB, Redis, FIDO2, JWT)
│   │
│   ├── Pages/                             # Razor Pages (public site)
│   │   ├── _Layout.cshtml                 # Master layout with themes
│   │   ├── Index.cshtml                   # Home page with stats grid
│   │   ├── Programs.cshtml                # KP14, Kyberlock, SwordComm, SPINDEX
│   │   ├── DirectEye.cshtml               # RESTRICTED - Government/contractor only
│   │   ├── About.cshtml                   # Technology overview
│   │   ├── Error.cshtml                   # Custom 404 with glitch effect
│   │   └── *.cshtml.cs                    # Page models (C# code-behind)
│   │
│   ├── Controllers/                       # MVC API Controllers
│   │   ├── AuthController.cs              # JWT authentication, WebAuthn
│   │   ├── VaultController.cs             # Document encryption/decryption
│   │   ├── MessageController.cs           # E2EE messaging API
│   │   ├── SearchController.cs            # SSE trapdoor queries
│   │   └── AdminController.cs             # Admin panel endpoints
│   │
│   ├── Hubs/                              # SignalR Real-Time Hubs
│   │   ├── SecureMessageHub.cs            # E2EE chat with Redis backplane
│   │   ├── PresenceHub.cs                 # User online/offline tracking
│   │   └── NotificationHub.cs             # Real-time alerts
│   │
│   ├── Services/                          # Business logic services
│   │   ├── IAuthenticationService.cs      # Authentication interface
│   │   ├── AuthenticationService.cs       # JWT, FIDO2, ML-KEM support
│   │   ├── MessageService.cs              # E2EE messaging, ratchet state
│   │   ├── VaultService.cs                # Hybrid PQC encryption
│   │   ├── SearchService.cs               # HMAC-based SSE
│   │   ├── OSINTService.cs                # Threat intelligence feeds
│   │   ├── DeadDropService.cs             # Trigger evaluation
│   │   └── CanaryTokenService.cs          # Honeypot tracking
│   │
│   ├── Middleware/                        # Custom middleware pipeline
│   │   ├── SecurityHeadersMiddleware.cs   # CSP, HSTS, COOP/COEP
│   │   ├── ThreatDetectionMiddleware.cs   # Pattern-based attack detection
│   │   ├── RateLimitingMiddleware.cs      # Distributed rate limiting (Redis)
│   │   └── RequestLoggingMiddleware.cs    # Audit trail
│   │
│   ├── BackgroundServices/                # IHostedService implementations
│   │   ├── OSINTSyncService.cs            # Automated feed updates
│   │   ├── DeadDropMonitorService.cs      # Trigger evaluation loop
│   │   └── CleanupService.cs              # Expired data removal
│   │
│   ├── wwwroot/                           # Static files
│   │   ├── css/site.css                   # 900+ lines tactical theme CSS
│   │   ├── js/site.js                     # Theme toggle, keyboard shortcuts
│   │   ├── favicon.svg                    # Tactical shield icon
│   │   ├── robots.txt                     # Search engine directives
│   │   └── sitemap.xml                    # SEO sitemap
│   │
│   └── Areas/Portal/                      # Blazor Server portal (auth-gated)
│       ├── Pages/                         # Blazor pages
│       ├── Components/                    # Blazor components
│       └── _Imports.razor                 # Global using directives
│
├── SwordIntel.Core/                       # Domain models & interfaces (C# 12)
│   ├── SwordIntel.Core.csproj            # Class library project
│   ├── Entities/                          # Domain entities (all C# records)
│   │   ├── User.cs                        # User record with KyberPublicKey
│   │   ├── Authenticator.cs               # WebAuthn/FIDO2 record
│   │   ├── Message.cs                     # E2EE message record
│   │   ├── Room.cs                        # Chat room record
│   │   ├── Document.cs                    # Vault document record
│   │   ├── CanaryToken.cs                 # Honeypot record
│   │   └── ...                            # 30+ entity records
│   │
│   ├── Interfaces/                        # Service contracts
│   │   ├── IAuthenticationService.cs
│   │   ├── IMessageService.cs
│   │   └── ...                            # Interface definitions
│   │
│   └── Constants/                         # Application constants
│       ├── Permissions.cs                 # 25+ granular permissions
│       └── Roles.cs                       # RBAC roles
│
├── SwordIntel.Infrastructure/             # Data access & external services (C#)
│   ├── SwordIntel.Infrastructure.csproj  # EF Core, Redis, external APIs
│   ├── Data/
│   │   ├── SwordIntelDbContext.cs         # EF Core DbContext (30+ DbSets)
│   │   └── Migrations/                    # EF Core migrations
│   │
│   ├── Repositories/                      # Repository pattern implementations
│   │   ├── UserRepository.cs
│   │   ├── MessageRepository.cs
│   │   └── ...                            # Data access layer
│   │
│   └── ExternalServices/                  # Third-party integrations
│       ├── RedisService.cs                # StackExchange.Redis wrapper
│       └── OSINTProviders/                # 18 threat feed clients
│
└── SwordIntel.Crypto/                     # Cryptography library (F# 8.0)
    ├── SwordIntel.Crypto.fsproj          # F# library project
    │
    ├── PostQuantum.fs                     # Post-quantum cryptography
    │   ├── KyberKeyPair record            # ML-KEM-1024 keypair type
    │   ├── generateKyberKeyPair           # Keypair generation
    │   ├── encapsulate                    # KEM encapsulation
    │   ├── decapsulate                    # KEM decapsulation
    │   ├── encryptHybrid                  # PQC + AES-256-GCM
    │   └── decryptHybrid                  # Hybrid decryption
    │
    ├── Steganography.fs                   # LSB image encoding
    │   ├── embedLSB                       # Embed data in PNG
    │   ├── extractLSB                     # Extract hidden data
    │   └── analyzeLSB                     # Capacity analysis
    │
    └── MessageEncryption.fs               # E2EE messaging
        ├── EncryptedMessage record        # Encrypted message type
        ├── RatchetState record            # Double ratchet state
        ├── encrypt                        # AES-256-GCM encryption
        ├── decrypt                        # Authenticated decryption
        ├── advanceRatchet                 # Key rotation
        └── addPadding                     # APT41-style obfuscation

Docker Infrastructure:
├── docker-compose.yml                     # Multi-service orchestration
│   ├── postgres                           # PostgreSQL 16 Alpine
│   ├── redis                              # Redis 7 Alpine with AOF
│   ├── web                                # ASP.NET Core app (optional)
│   ├── pgadmin                            # pgAdmin 4 (admin tools profile)
│   └── redis-commander                    # Redis GUI (admin tools profile)
│
├── Dockerfile                             # Multi-stage ASP.NET build
│   ├── Stage 1: Build                     # dotnet/sdk:8.0-alpine
│   ├── Stage 2: Publish                   # Release build
│   └── Stage 3: Runtime                   # dotnet/aspnet:8.0-alpine
│
├── setup.sh                               # Bash setup script with ASCII art
├── setup.ps1                              # PowerShell setup script
├── QUICKSTART.md                          # Quick start guide
└── README.md                              # This file
```

---

## 🔒 Security & Privacy

### Cryptographic Primitives

**Post-Quantum Cryptography (NIST Level 5):**
- **ML-KEM-1024**: Key encapsulation mechanism (NIST FIPS 203, Kyber-1024)
- **ML-DSA-87**: Digital signature algorithm (NIST FIPS 204, Dilithium-5)
- **Security Level**: 256-bit quantum security (equivalent to AES-256)

**Symmetric Encryption:**
- **AES-256-GCM**: Authenticated encryption with associated data
- **PBKDF2**: Key derivation (100,000 iterations)
- **ChaCha20-Poly1305**: Alternative stream cipher

**Hashing & MAC:**
- **SHA-256/SHA-512**: Cryptographic hashing
- **HMAC-SHA256**: Message authentication codes

### Forward Secrecy
- **Double Ratchet**: Signal Protocol-inspired key rotation
- **Per-Message Keys**: Unique key for each message
- **Chain Key Advancement**: Automatic key evolution
- **Root Key Rotation**: Periodic ephemeral key agreement

### Traffic Analysis Resistance (APT41 TTPs)
- **Uniform Message Sizes**: Padding to 1024 bytes
- **Decoy Messages**: Random fake traffic (10% probability)
- **Timing Obfuscation**: Randomized delays (100-300ms)
- **Constant-Rate Traffic**: Shaping to resist statistical analysis
- **Connection Fingerprinting**: Anti-fingerprinting headers

### Security Headers

- **CSP**: Content Security Policy with nonce-based script execution
- **HSTS**: Strict-Transport-Security with preload
- **COOP/COEP**: Cross-Origin-Opener-Policy and Embedder-Policy
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restrictive feature policy

### Privacy Compliance

- **U.S./Iowa Baseline**: Clear privacy notice with opt-out mechanisms
- **First-Party Analytics**: Prefer self-hosted, minimal tracking
- **Do-Not-Track**: Honor DNT and GPC signals
- **Regional Switches**: Feature flags for GDPR/CCPA compliance
- **Audit Logs**: Tamper-evident consent/opt-out tracking

### Client Vetting

All prospective clients undergo:
- Identity & beneficial ownership verification (KYC/KYB)
- Sanctions screening (OFAC SDN, UK, EU, BIS)
- Business legitimacy assessment
- End-use and intent analysis

**Threat Actor Protocol**: Anyone suspected of attempting to acquire technology for hostile nation-states will be treated as a threat actor and dealt with accordingly.

### Client-Side Security Monitoring
- **Screenshot Detection**: Alerts on capture attempts
- **Clipboard Monitoring**: Tracks sensitive data copying
- **Screen Recording Detection**: Identifies recording software
- **Security Events**: Real-time alerts to server and logs

---

## 🌍 Operational Posture

- **Independence**: Not subject to government secrecy obligations; operate under client confidentiality and applicable law
- **NATO Alignment**: Share values and operational philosophy with NATO member states
- **Global Business**: Open to lawful engagements globally (especially Russia,also China) subject to sanctions compliance etc
- **UK-Based**: Rapid deployment capability (24 hours to nearly anywhere)
- **IC Coordination**: Ongoing relationships with government and intelligence community partners

---

## 🚧 Development Roadmap

### ✅ Completed

**Next.js Platform:**
- [x] Core site structure (Home, About, Services, Methods, Contact, Programs)
- [x] Dual theme system (Special-Ops / Advisory)
- [x] Privacy & compliance pages
- [x] Live threat intelligence feed with narcotics tracking
- [x] Animated stats showcase
- [x] Client vetting procedures documentation
- [x] Security headers implementation
- [x] Programs page showcasing R&D initiatives

**ASP.NET Core Platform (NEW):**
- [x] Hybrid architecture implementation (Razor Pages + Blazor + MVC + SignalR + Minimal APIs)
- [x] F# cryptography modules (PostQuantum.fs, Steganography.fs, MessageEncryption.fs)
- [x] C# 12 records for all entities (immutability)
- [x] EF Core 8.0 with PostgreSQL integration
- [x] SignalR with MessagePack and Redis backplane
- [x] Custom middleware pipeline (SecurityHeaders, ThreatDetection, RateLimit, RequestLogging)
- [x] Retro 90s military/tactical theme with CRT effects
- [x] Public pages (Home, Programs, DirectEye, About, Error)
- [x] Docker infrastructure (PostgreSQL 16, Redis 7, pgAdmin, Redis Commander)
- [x] Setup automation (Bash and PowerShell scripts with ASCII art)
- [x] SEO optimization (meta tags, Open Graph, Twitter Cards, sitemap, robots.txt)
- [x] UX enhancements (loading screen, back-to-top, keyboard shortcuts)
- [x] DIRECTEYE restricted access page for government/contractors
- [x] FIDO2/WebAuthn authentication support
- [x] Background services (OSINT sync, dead drop monitoring)

**Client Portal - Security:**
- [x] Post-quantum cryptography upgraded to NIST Level 5 (ML-KEM-1024 + ML-DSA-87)
- [x] Multi-factor authentication (TOTP)
- [x] Hardware security key integration (YubiKey/WebAuthn/FIDO2)
- [x] Biometric authentication (Face ID, Touch ID, Windows Hello, fingerprint readers)
- [x] CAC/PIV smartcard support
- [x] Session management with NextAuth
- [x] WebAuthn database persistence (register, list, revoke authenticators)

**Client Portal - Features:**
- [x] Encrypted document vault with AES-256-GCM + PQC
- [x] Secure file sharing with time-limited links
- [x] Canary token system (honeypot documents)
- [x] Real-time WebSocket messaging
- [x] APT-level traffic obfuscation
- [x] Dead drop system (time/heartbeat/geographic triggers)
- [x] LSB steganography for file hiding
- [x] Searchable symmetric encryption (SSE)
- [x] Admin panel with full oversight
- [x] OSINT threat intelligence dashboard (18 feeds)

**Infrastructure:**
- [x] PostgreSQL database with Prisma ORM (22+ models)
- [x] Production WebSocket server
- [x] Redis pub/sub for multi-instance support
- [x] Database persistence for all features (messages, authenticators, OSINT)
- [x] Message history and offline support
- [x] Audit logging infrastructure
- [x] OSINT background sync service with database caching
- [x] Automatic feed updates with deduplication

### 🔄 In Progress

- [ ] Hardware Security Module (HSM) integration for cryptographic operations

### 📋 Planned

**Intelligence Gathering:**
- [ ] Real-time threat intel pipeline expansion (additional feeds)
- [ ] Automated intel sources:
  - PRC cyberwarfare operations tracking
  - International fentanyl/nitazenes seizures (DEA, FBI, Europol feeds)
  - NATO intelligence leaks monitoring
  - Critical infrastructure incidents
  - Enhanced darknet market monitoring (Tor, I2P)
- [ ] Cryptocurrency tracing integration
- [ ] Blockchain analytics for ransomware payments
- [ ] Machine learning for threat correlation

**Advanced Security:**
- [ ] End-to-end encrypted voice/video calls (WebRTC + PQC)
- [ ] Blockchain-based audit trail (immutable logs)
- [ ] Air-gapped key ceremony for master keys
- [ ] Zero-knowledge proof authentication

**Operations:**
- [ ] Incident response playbooks (automated)
- [ ] Threat hunting dashboard
- [ ] SIEM integration (Splunk, ELK)
- [ ] Export/import functionality for data portability
- [ ] Mobile apps (iOS/Android) with PQC
- [ ] API for threat intel feed (authenticated)
- [ ] Webhook notifications for security events

**Compliance & Reporting:**
- [ ] SOC 2 Type II compliance
- [ ] ISO 27001 certification tracking
- [ ] Automated compliance reporting
- [ ] Client-specific SLAs and metrics

---

## 🏃 Getting Started

### Prerequisites

**For Next.js Platform:**
- **Node.js** 18+ and npm
- **PostgreSQL** 15+ (for production)
- **Redis** 7+ (for WebSocket multi-instance)
- Git

**For ASP.NET Core Platform:**
- **.NET SDK** 8.0+
- **PostgreSQL** 15+
- **Redis** 7+
- **Docker** (optional, recommended)
- Git

---

### Next.js Platform Setup

#### Installation

```bash
# Clone repository
git clone https://github.com/SWORDIntel/SWORDINTELLIGENCE.git
cd SWORDINTELLIGENCE

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations (if PostgreSQL available)
npx prisma generate
npx prisma migrate dev

# Run development server (Next.js + WebSocket)
npm run dev:all

# Or run separately:
npm run dev        # Next.js only (port 3000)
npm run dev:ws     # WebSocket server only (port 8080)

# OSINT background sync
npm run osint:sync       # Continuous background sync
npm run osint:sync:once  # One-time sync
```

#### Build for Production

```bash
# Build Next.js app
npm run build

# Build WebSocket server
npm run build:ws

# Start production servers
npm run start:all

# Or run separately:
npm start          # Next.js (port 3000)
npm run start:ws   # WebSocket (port 8080)
```

#### Docker Deployment (Recommended for Production)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Services:
# - app: Next.js frontend (port 3000)
# - websocket: WebSocket server (port 8080)
# - db: PostgreSQL database (port 5432)
# - redis: Redis cache (port 6379)
```

#### Environment Variables

Required variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sword_intel

# Redis
REDIS_URL=redis://localhost:6379

# WebSocket
WS_PORT=8080
WS_HOST=0.0.0.0
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-secure-random-string-here

# WebAuthn / Hardware Authentication
WEBAUTHN_RP_NAME="SWORD Intelligence"
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000

# OSINT Feed API Keys (optional - 14 feeds work without keys)
OTX_API_KEY=your_alienvault_otx_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key

# Security
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years
SESSION_TIMEOUT_HOURS=24
```

See `docs/setup/SETUP_GUIDE.md` for detailed setup instructions.

---

### ASP.NET Core Platform Setup

#### Quick Start with Docker (Recommended)

The fastest way to get the ASP.NET Core platform running is with Docker Compose:

```bash
# Navigate to ASP.NET Core directory
cd src

# Run interactive setup script (Bash)
./setup.sh

# Or PowerShell on Windows
./setup.ps1

# Choose option:
# 1. Infrastructure Only (PostgreSQL + Redis)
# 2. Full Stack (Infrastructure + ASP.NET app)
# 3. With Admin Tools (+ pgAdmin + Redis Commander)
# 4. Everything (Full stack + Admin tools)
```

The setup script will:
- Display tactical ASCII art banner
- Prompt for deployment configuration
- Start Docker Compose with selected services
- Show connection URLs and credentials
- Provide next steps guidance

**Services Available:**
- **ASP.NET Web App**: http://localhost:5000
- **PostgreSQL**: localhost:5432 (swordintel/SwordIntel2024!SecurePass)
- **Redis**: localhost:6379
- **pgAdmin** (admin tools): http://localhost:5050
- **Redis Commander** (admin tools): http://localhost:8081

#### Manual Setup (Without Docker)

```bash
# Navigate to ASP.NET Core directory
cd src

# Restore NuGet packages
dotnet restore

# Update appsettings.json with your PostgreSQL and Redis connection strings
# Edit: src/SwordIntel.Web/appsettings.json

# Apply database migrations
cd SwordIntel.Web
dotnet ef database update
cd ..

# Run the application
dotnet run --project SwordIntel.Web/SwordIntel.Web.csproj

# App will be available at:
# - HTTP: http://localhost:5000
# - HTTPS: https://localhost:5001
```

#### Build for Production

```bash
cd src

# Build solution (all 4 projects)
dotnet build -c Release

# Publish web application
dotnet publish SwordIntel.Web/SwordIntel.Web.csproj -c Release -o ./publish

# Run published app
cd publish
dotnet SwordIntel.Web.dll
```

#### Docker Production Deployment

```bash
cd src

# Build Docker image
docker build -t swordintel-aspnet:latest .

# Run with Docker Compose (production profile)
docker-compose --profile full up -d

# Services will be available:
# - Web: http://localhost:5000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

#### Configuration (appsettings.json)

Key settings in `src/SwordIntel.Web/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=swordintel;Username=swordintel;Password=YOUR_PASSWORD",
    "Redis": "localhost:6379"
  },
  "Fido2": {
    "ServerDomain": "localhost",
    "ServerName": "SWORD Intelligence",
    "Origins": ["https://localhost:5001"]
  },
  "Jwt": {
    "Secret": "GENERATE_SECURE_KEY_HERE",
    "Issuer": "SwordIntelligence",
    "Audience": "SwordIntelClients",
    "ExpirationHours": 24
  }
}
```

#### Key Features by URL

**Public Pages (No Auth Required):**
- `/` - Home page with tactical theme
- `/programs` - KP14, Kyberlock, SwordComm, SPINDEX
- `/directeye` - Government/contractor platform (RESTRICTED)
- `/about` - Technology overview

**Portal (Auth Required):**
- `/portal` - Blazor Server dashboard
- `/portal/vault` - Encrypted document vault
- `/portal/messages` - Secure E2EE messaging
- `/portal/admin` - Admin panel (admin role required)

**API Endpoints:**
- `/api/auth` - Authentication (JWT, WebAuthn)
- `/api/messages` - Messaging API
- `/api/vault` - Document encryption API
- `/api/search` - Searchable encryption API

**SignalR Hubs:**
- `/hubs/messages` - Real-time chat
- `/hubs/presence` - Online/offline tracking
- `/hubs/notifications` - Alert broadcasts

---

## 📚 Documentation

**Start Here:**
- **[DOCUMENTATION.md](DOCUMENTATION.md)**: Complete documentation index and navigation guide
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)**: Project status and what's ready

**Setup & Deployment:**
- **[Setup Guide](docs/setup/SETUP_GUIDE.md)**: Complete installation guide (PostgreSQL, Redis, API keys, WebAuthn)
- **[API Key Troubleshooting](docs/setup/API_KEY_TROUBLESHOOTING.md)**: Fixing OTX and VirusTotal API keys
- **[Setup Status](docs/setup/SETUP_STATUS.md)**: Detailed setup status and next steps

**Technical Documentation:**
- **[Production Infrastructure](docs/technical/PRODUCTION_INFRASTRUCTURE.md)**: Database, WebSocket server, scaling, deployment
- **[Biometric Authentication](docs/technical/BIOMETRIC_AUTH.md)**: WebAuthn/FIDO2, YubiKey, CAC, HSM integration
- **[OSINT Feeds](docs/technical/OSINT_FEEDS.md)**: All 18 threat intelligence feeds
- **[Dead Drop System](docs/technical/DEAD_DROP_SYSTEM.md)**: Trigger system architecture
- **[Tradecraft](docs/technical/TRADECRAFT.md)**: APT-level messaging and traffic obfuscation
- **[WebSocket Implementation](docs/technical/WEBSOCKET_IMPLEMENTATION.md)**: Real-time messaging architecture

**Legal & Compliance:**
- **[Privacy Policy](docs/legal/PRIVACY_POLICY.md)**: Privacy notice and data protection
- **[Terms of Service](docs/legal/TERMS_OF_SERVICE.md)**: Website terms and conditions

**Code Documentation:**
- **[Searchable Encryption](lib/search/searchable-encryption.ts)**: SSE implementation details
- **[Steganography](lib/steganography/lsb-engine.ts)**: LSB encoding technical docs
- **[Post-Quantum Crypto](lib/crypto/pqc.ts)**: ML-KEM-1024 + ML-DSA-87 implementation

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run type checks
npx tsc --noEmit

# Lint code
npm run lint

# View database in Prisma Studio
npx prisma studio
```

---

## 📜 License

Proprietary - © 2024 SWORD Intelligence. All rights reserved.

---

## 🤝 Contact

- **Secure Intake**: [Contact Page](/contact)
- **PGP Email**: secure@sword-intel.example
- **Emergency Hotline**: +1 (XXX) XXX-XXXX (24/7)
- **Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md) - Complete documentation index

---

## ⚠️ Legal Disclaimer

SWORD Intelligence operates as an independent private intelligence firm. We are not affiliated with any government entity. All services comply with applicable UK and U.S. law. Engagements involving controlled technologies, strategic market access, or sensitive intelligence are conducted with rigorous client vetting and coordination with appropriate authorities.

**"dot air force" is a personal moniker and does not imply affiliation with the United States Air Force.**

---

## 🛡️ Code of Conduct

We maintain strict ethical standards:

- **Lawful Operations**: All methodologies comply with applicable laws
- **Client Confidentiality**: Need-to-know principles and encryption
- **No Sanctions Evasion**: Zero tolerance for proliferation or export control violations
- **Threat Actor Protocol**: Hostile nation-state actors attempting to misuse our services will be investigated and reported
- **Cooperation with Authorities**: Coordinate with law enforcement and IC partners through proper legal channels
- **Responsible Disclosure**: Security vulnerabilities reported through proper channels
- **Privacy First**: User data minimization and encryption by default

---

## 🏆 Technical Achievements

**Security Engineering:**
- Post-quantum cryptography (NIST FIPS 203/204 Level 5: ML-KEM-1024 + ML-DSA-87)
- Hardware security key integration (YubiKey, CAC/PIV, biometric authenticators)
- WebAuthn/FIDO2 with database persistence
- Double ratchet forward secrecy (Signal Protocol)
- APT-level traffic obfuscation (APT41 TTPs)
- Searchable symmetric encryption (privacy-preserving search)
- LSB steganography with authenticated encryption
- Multi-factor authentication with TOTP/WebAuthn/biometrics

**Infrastructure:**
- Production WebSocket server with Redis clustering
- PostgreSQL with Prisma ORM (22+ models)
- Multi-instance horizontal scaling
- Database persistence with offline support
- Comprehensive audit logging (40+ event types)
- OSINT background sync service with automatic deduplication

**Intelligence Operations:**
- 18 OSINT threat intelligence feeds (malware, phishing, C2, narcotics, darknet)
- Database-backed indicator caching for fast lookups
- Automated feed synchronization with configurable intervals
- Real-time threat feed (nation-states, narcotics, Web3)
- Dead drop system with complex triggers
- Canary token honeypots
- Geographic proximity triggers (Haversine)
- Heartbeat monitoring for dead man's switch

**Privacy & Compliance:**
- HMAC-encrypted search indexes
- Tamper-evident audit logs
- Client-side security monitoring
- Screenshot/clipboard detection
- End-to-end encrypted messaging
- Privacy policy and terms of service (GDPR/CCPA compliant)

---

*Last Updated: November 8, 2025*
*Version: 4.0 - Dual Platform (Next.js + ASP.NET Core) with Hybrid Architecture*

---

## 🎭 Esoteric Design Choices (ASP.NET Core Platform)

The ASP.NET Core implementation was designed to showcase advanced .NET capabilities and unconventional architectural patterns:

### Why Hybrid Architecture?
**Most applications choose ONE pattern. We chose ALL of them.**

- **Razor Pages**: Traditional server-rendered pages for SEO-critical public content
- **Blazor Server**: Interactive SPA-like experience without JavaScript fatigue
- **MVC Controllers**: RESTful APIs for programmatic access
- **SignalR**: Real-time bidirectional communication
- **Minimal APIs**: Lightweight microservice-style endpoints

**Rationale**: Demonstrates polyglot .NET expertise and allows choosing the best tool for each feature rather than forcing everything into one paradigm.

### Why F# for Cryptography?
**F# brings mathematical rigor to security-critical code.**

- **Pure Functions**: Cryptographic operations are deterministic and side-effect-free
- **Immutable Data**: Prevents accidental mutation of keys/ciphertexts
- **Type Safety**: Strong typing catches errors at compile-time
- **Railway-Oriented Programming**: Elegant error handling without exceptions
- **Pattern Matching**: Clear code for handling encryption/decryption cases

**Code Example** (`PostQuantum.fs`):
```fsharp
let encryptHybrid (recipientPublicKey: byte[]) (plaintext: byte[]) =
    let (ciphertext, sharedSecret) = encapsulate recipientPublicKey
    let encrypted = MessageEncryption.encrypt sharedSecret plaintext None
    (ciphertext, encrypted)
```

Compare to typical C# with try-catch, nullability checks, and mutable state. F# makes cryptographic bugs less likely.

### Why C# Records for All Entities?
**Immutability by default prevents entire classes of bugs.**

```csharp
public record User
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public byte[]? KyberPublicKey { get; init; }
}
```

- **Value Semantics**: Structural equality (two users with same data are equal)
- **Init-Only Properties**: Can't accidentally modify after creation
- **With-Expressions**: Create modified copies without mutation
- **Thread-Safe**: Immutable objects are inherently safe across threads

### Why Retro 90s Tactical Theme?
**Nostalgia meets modern design.**

The aesthetic choice reflects:
- **Historical Context**: 90s was the golden age of hacker culture and early cyber warfare
- **Tactical Authenticity**: Military/contractor aesthetic signals seriousness
- **Modern Polish**: CRT effects and scanlines are Web 3.0-ready (GPU-accelerated CSS)
- **Differentiation**: Stands out from generic SaaS dashboards

**Technical Implementation**:
- CSS-only CRT scanlines (no JavaScript)
- Radar sweep with conic gradients
- Tactical corner cuts via clip-path
- Orbitron (geometric military font) + Share Tech Mono (terminal font)

### Why Docker Compose with Multiple Profiles?
**Flexibility for different deployment scenarios.**

```yaml
services:
  postgres: { ... }
  redis: { ... }
  web:
    profiles: [full]  # Only starts with --profile full
  pgadmin:
    profiles: [admin-tools]
```

Developers can choose:
1. Infrastructure only (just DB + Redis for local dev)
2. Full stack (everything for integration testing)
3. Admin tools (debugging database/cache)
4. Everything (demo/showcase mode)

### Why Tactical ASCII Art in Setup Scripts?
**Because we can, and it's memorable.**

```bash
┌─────────────────────────────────────────────┐
│   ███████╗██╗    ██╗ ██████╗ ██████╗ ██████╗│
│   ███████║╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝│
└─────────────────────────────────────────────┘
```

First impressions matter. A well-designed CLI experience shows attention to detail.

### Philosophy
**"If it's worth doing, it's worth overdoing."**

The ASP.NET Core platform is intentionally over-engineered to demonstrate:
- Deep .NET ecosystem knowledge (C#, F#, EF Core, SignalR, Blazor)
- Security expertise (PQC, WebAuthn, E2EE)
- DevOps capabilities (Docker, multi-stage builds, health checks)
- UX design skills (retro aesthetic, smooth interactions)
- Documentation quality (this README, inline comments, XML docs)

It's a **technical portfolio piece** as much as a functional platform.

---
