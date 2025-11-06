# SWORD Intelligence - Complete Documentation Index

This document provides a comprehensive guide to all documentation in this repository.

---

## 📚 Quick Start

**New to SWORD Intelligence?** Start here:

1. **[README.md](./README.md)** - Project overview, features, and tech stack
2. **[docs/setup/SETUP_GUIDE.md](./docs/setup/SETUP_GUIDE.md)** - Complete installation and deployment guide
3. **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** - Current project status and what's ready

---

## 📖 Documentation Structure

### Root Level

- **[README.md](./README.md)** - Main project documentation
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - This file (documentation index)
- **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** - Project completion status

### Setup & Deployment (`docs/setup/`)

- **[SETUP_GUIDE.md](./docs/setup/SETUP_GUIDE.md)** - Complete setup instructions (PostgreSQL, Redis, API keys)
- **[API_KEY_TROUBLESHOOTING.md](./docs/setup/API_KEY_TROUBLESHOOTING.md)** - Fixing OTX and VirusTotal API keys
- **[API_KEYS_STATUS.md](./docs/setup/API_KEYS_STATUS.md)** - Current API key configuration
- **[SETUP_STATUS.md](./docs/setup/SETUP_STATUS.md)** - Detailed setup status and next steps

### Technical Documentation (`docs/technical/`)

- **[BIOMETRIC_AUTH.md](./docs/technical/BIOMETRIC_AUTH.md)** - WebAuthn/FIDO2, YubiKey, CAC, HSM integration
- **[OSINT_FEEDS.md](./docs/technical/OSINT_FEEDS.md)** - All 18 OSINT threat intelligence feeds
- **[PRODUCTION_INFRASTRUCTURE.md](./docs/technical/PRODUCTION_INFRASTRUCTURE.md)** - WebSocket, Database, Redis architecture
- **[DEAD_DROP_SYSTEM.md](./docs/technical/DEAD_DROP_SYSTEM.md)** - Dead drop triggers and implementation
- **[TRADECRAFT.md](./docs/technical/TRADECRAFT.md)** - APT-level messaging and traffic obfuscation
- **[WEBSOCKET_IMPLEMENTATION.md](./docs/technical/WEBSOCKET_IMPLEMENTATION.md)** - Real-time messaging architecture

### Legal & Compliance (`docs/legal/`)

- **[PRIVACY_POLICY.md](./docs/legal/PRIVACY_POLICY.md)** - Privacy notice and data protection
- **[TERMS_OF_SERVICE.md](./docs/legal/TERMS_OF_SERVICE.md)** - Website terms and conditions

---

## 🚀 By Use Case

### I want to deploy the platform

1. [SETUP_GUIDE.md](./docs/setup/SETUP_GUIDE.md) - Start here
2. [SETUP_STATUS.md](./docs/setup/SETUP_STATUS.md) - Check what's done vs. what's left
3. [API_KEY_TROUBLESHOOTING.md](./docs/setup/API_KEY_TROUBLESHOOTING.md) - If API keys don't work

### I want to understand the security implementation

1. [README.md](./README.md#security) - Security overview
2. [BIOMETRIC_AUTH.md](./docs/technical/BIOMETRIC_AUTH.md) - Hardware authentication
3. [TRADECRAFT.md](./docs/technical/TRADECRAFT.md) - APT-level messaging techniques
4. `lib/crypto/pqc.ts` - Post-quantum cryptography (ML-KEM-1024 + ML-DSA-87)

### I want to integrate OSINT threat intelligence

1. [OSINT_FEEDS.md](./docs/technical/OSINT_FEEDS.md) - All 18 feeds documented
2. [API_KEY_TROUBLESHOOTING.md](./docs/setup/API_KEY_TROUBLESHOOTING.md) - Get API keys
3. `lib/intelligence/osint-feeds.ts` - Feed implementation
4. `lib/intelligence/osint-sync-service.ts` - Background sync service

### I want to understand the messaging system

1. [TRADECRAFT.md](./docs/technical/TRADECRAFT.md) - Traffic obfuscation techniques
2. [WEBSOCKET_IMPLEMENTATION.md](./docs/technical/WEBSOCKET_IMPLEMENTATION.md) - Real-time architecture
3. [DEAD_DROP_SYSTEM.md](./docs/technical/DEAD_DROP_SYSTEM.md) - Dead drop triggers
4. [PRODUCTION_INFRASTRUCTURE.md](./docs/technical/PRODUCTION_INFRASTRUCTURE.md) - Full stack

### I need legal/compliance information

1. [PRIVACY_POLICY.md](./docs/legal/PRIVACY_POLICY.md) - Privacy notice
2. [TERMS_OF_SERVICE.md](./docs/legal/TERMS_OF_SERVICE.md) - Website terms
3. `app/privacy/page.tsx` - Privacy page (web UI)
4. `app/terms/page.tsx` - Terms page (web UI)

---

## 🔐 Security Features Documented

| Feature | Documentation | Code |
|---------|---------------|------|
| **Post-Quantum Crypto** | README.md | `lib/crypto/pqc.ts` |
| **ML-KEM-1024** | README.md, Code comments | `lib/crypto/pqc.ts` |
| **ML-DSA-87** | README.md, Code comments | `lib/crypto/pqc.ts` |
| **WebAuthn/FIDO2** | BIOMETRIC_AUTH.md | `lib/auth/webauthn.ts` |
| **YubiKey Support** | BIOMETRIC_AUTH.md | `lib/auth/webauthn.ts` |
| **CAC/PIV Cards** | BIOMETRIC_AUTH.md | `lib/auth/webauthn.ts` |
| **HSM Integration** | BIOMETRIC_AUTH.md | `lib/auth/hsm.ts` |
| **Dead Drops** | DEAD_DROP_SYSTEM.md | `lib/dead-drop/` |
| **Steganography** | TRADECRAFT.md | `lib/steganography/` |
| **Searchable Encryption** | PRODUCTION_INFRASTRUCTURE.md | `lib/search/` |
| **Traffic Obfuscation** | TRADECRAFT.md | APT41 techniques in messaging |

---

## 📊 OSINT Features Documented

| Feed Category | Feeds | Documentation |
|---------------|-------|---------------|
| **Malware** | URLhaus, Feodo, SSL Blacklist, DigitalSide | OSINT_FEEDS.md |
| **Phishing** | PhishTank, OpenPhish | OSINT_FEEDS.md |
| **Threat Intel** | AlienVault OTX, VirusTotal | OSINT_FEEDS.md, API_KEY_TROUBLESHOOTING.md |
| **Infrastructure** | Shodan, FBI InfraGard, Blocklist.de, Tor | OSINT_FEEDS.md |
| **Narcotics** | DEA, Ultrapotent Opioids | OSINT_FEEDS.md |
| **Darknet** | TOR Markets | OSINT_FEEDS.md |
| **Cryptojacking** | Mining IPs | OSINT_FEEDS.md |

**Total:** 18 feeds integrated

---

## 🏗️ Architecture Documented

| Component | Documentation |
|-----------|---------------|
| **Database** | PRODUCTION_INFRASTRUCTURE.md, `prisma/schema.prisma` |
| **WebSocket** | WEBSOCKET_IMPLEMENTATION.md, `server/websocket.ts` |
| **Redis Pub/Sub** | PRODUCTION_INFRASTRUCTURE.md |
| **OSINT Sync** | OSINT_FEEDS.md, `lib/intelligence/osint-sync-service.ts` |
| **Background Workers** | SETUP_GUIDE.md, `scripts/osint-sync-worker.ts` |
| **Database Migration** | SETUP_GUIDE.md, `prisma/migrations/` |

---

## 📝 Code Documentation

### Key Files

| File | Purpose | Documentation |
|------|---------|---------------|
| `lib/crypto/pqc.ts` | Post-quantum cryptography | Inline comments, README.md |
| `lib/auth/webauthn.ts` | WebAuthn/FIDO2 | BIOMETRIC_AUTH.md, inline comments |
| `lib/auth/hsm.ts` | Hardware Security Modules | BIOMETRIC_AUTH.md |
| `lib/intelligence/osint-feeds.ts` | OSINT feed manager | OSINT_FEEDS.md |
| `lib/intelligence/osint-sync-service.ts` | Background sync | SETUP_GUIDE.md |
| `server/websocket.ts` | WebSocket server | WEBSOCKET_IMPLEMENTATION.md |
| `prisma/schema.prisma` | Database schema | PRODUCTION_INFRASTRUCTURE.md |

### Component Structure

```
app/                    # Next.js App Router
├── portal/            # Client portal (requires auth)
│   ├── admin/        # Admin panel
│   ├── messaging/    # Real-time messaging
│   ├── vault/        # Document vault
│   ├── osint/        # OSINT dashboard
│   └── settings/     # User settings + WebAuthn
├── privacy/          # Privacy policy page
└── terms/            # Terms of service page

lib/                   # Core business logic
├── crypto/           # Post-quantum cryptography
├── auth/             # Authentication (WebAuthn, HSM)
├── intelligence/     # OSINT feeds and sync
├── messaging/        # Encrypted messaging
├── dead-drop/        # Dead drop system
├── steganography/    # LSB steganography
└── search/           # Searchable encryption

server/               # Backend services
└── websocket.ts     # WebSocket server

scripts/              # Utility scripts
├── osint-sync-worker.ts  # OSINT background worker
└── apply-migration.sh    # Database migration helper
```

---

## 🔧 npm Scripts

All scripts documented in [SETUP_GUIDE.md](./docs/setup/SETUP_GUIDE.md)

```bash
# Development
npm run dev                # Next.js dev server
npm run dev:ws             # WebSocket dev server
npm run dev:all            # Both concurrently

# Production
npm run build              # Build Next.js
npm run build:ws           # Build WebSocket
npm run start              # Start Next.js
npm run start:ws           # Start WebSocket
npm run start:all          # Both concurrently

# OSINT
npm run osint:sync         # Continuous background sync
npm run osint:sync:once    # One-time sync

# Database
npm run db:migrate         # Apply migrations
```

---

## 📋 Roadmap

See [README.md](./README.md#development-roadmap) for:
- ✅ Completed features (extensive list)
- 🚧 In progress
- 📋 Planned features

---

## 🆘 Getting Help

### Common Issues

| Issue | Documentation |
|-------|---------------|
| API keys not working | [API_KEY_TROUBLESHOOTING.md](./docs/setup/API_KEY_TROUBLESHOOTING.md) |
| Database setup | [SETUP_GUIDE.md](./docs/setup/SETUP_GUIDE.md) |
| WebAuthn not working | [BIOMETRIC_AUTH.md](./docs/technical/BIOMETRIC_AUTH.md) |
| OSINT feeds not syncing | [OSINT_FEEDS.md](./docs/technical/OSINT_FEEDS.md) |
| WebSocket connection issues | [WEBSOCKET_IMPLEMENTATION.md](./docs/technical/WEBSOCKET_IMPLEMENTATION.md) |

### Support

- **Issues:** Check relevant documentation above
- **Security:** Review security documentation before reporting vulnerabilities
- **Legal:** See `docs/legal/` for policies

---

## 📅 Documentation Maintenance

**Last Updated:** November 6, 2025

### Documentation Standards

- **Format:** Markdown for all docs
- **Location:**
  - Technical: `docs/technical/`
  - Setup: `docs/setup/`
  - Legal: `docs/legal/`
  - Project-level: Root directory
- **Updates:** Documentation updated with code changes
- **Reviews:** Legal docs reviewed on policy changes

---

## ✅ Documentation Completeness

| Category | Status |
|----------|--------|
| **Setup Guides** | ✅ Complete |
| **Technical Docs** | ✅ Complete |
| **API Reference** | ✅ Inline code comments |
| **Legal Docs** | ✅ Complete |
| **Architecture** | ✅ Complete |
| **Security** | ✅ Complete |
| **Deployment** | ✅ Complete |

---

**All documentation is production-ready and maintained.**
