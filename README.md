# SWORD Intelligence

**Independent private intelligence firm specializing in Web3 and cyber threats.**

> Adversaries don't play fair. NOr do we,except the laws on our side

---

## 🎯 Mission

SWORD Intelligence helps funds, founders, enterprises, and government clients prevent loss, hunt threat actors, and respond to high-stakes incidents across Web3 and traditional cyber infrastructure.

### Core Focus Areas

- **Cyber Threat Intelligence**: APT tracking, nation-state operations, infrastructure analysis , focus on APT-41 in particular.
- **Counter-Narcotics Intelligence**: Fighting synthetic opioid supply chains (fentanyl, nitazenes)
- **Web3 & Crypto Crime**:asset tracking , ransomware negotiator , sanctioned red team ops
- **Executive Protection**: UHNWI and C-suite cyber security (OPSEC, identity fragmentation , cybersecurity)
- **Bespoke Services**: Variety of services on inquiry from logistics,laboratory design to private jet charter

---

## 🏗️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom theme system
- **Components**: shadcn/ui + custom components
- **Security**: CSP with nonce, HSTS, COOP/COEP, strict referrers
- **Privacy**: U.S./Iowa baseline with regional compliance switches

---

## 🚀 Features

### Public Site

- **Dual Theme System**: Special-Ops (dark) and Advisory (light) themes with instant switching
- **Service Pages**: Intelligence, Response, Resilience with detailed capability breakdowns
- **Live Threat Intel Feed**: Real-time (sanitized) threat data across multiple categories
- **Animated Stats**: Scroll-triggered counters showing operational track record
- **Methods & Compliance**: Transparent lawful methodologies and client vetting procedures
- **Secure Contact**: PGP-encrypted contact forms with progressive profiling

### Strategic Capabilities (Public)

- **Shenzhen Supply Chain Intelligence**: Full access to electronics manufacturing ecosystem(Special Inventory to NATO vetted contractors/groups)
- **Russian Technology Access**: Procurement and analysis capability for dual-use tech (lawful purposes, rigorous vetting)
- **Global Rapid Response**: UK-based with 24-hour deployment capability worldwide
- **Intelligence Community Coordination**: Relationships with government/IC partners (details classified)

### Client Portal (In Development)

- **Post-Quantum Encryption**: Dilithium signatures + Kyber key encapsulation
- **MFA Authentication**: TOTP, SMS, hardware keys (YubiKey/WebAuthn)
- **Encrypted Document Vault**: AES-256 + PQC hybrid encryption
- **Secure Messaging**: Signal Protocol integration
- **Intel Report Delivery**: ICD-203 compliant reports with digital signatures
- **Audit Logging**: Tamper-evident WORM-style logs

---

## 📂 Project Structure

```
├── app/                      # Next.js app directory
│   ├── about/               # Company information, capabilities
│   ├── contact/             # Secure intake forms
│   ├── insights/            # Blog / case studies
│   ├── intel-feed/          # Live threat intelligence dashboard
│   ├── methods/             # Compliance & methodologies
│   ├── portal/              # Secure client portal (auth-gated)
│   ├── privacy/             # Privacy notice
│   ├── services/            # Service detail pages
│   └── terms/               # Terms of service
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── hero.tsx            # Home page hero
│   ├── navigation.tsx      # Site navigation
│   ├── service-card.tsx    # Service feature cards
│   └── stats-showcase.tsx  # Animated metrics
├── lib/                     # Utilities and libraries
│   ├── auth/               # Authentication logic
│   ├── crypto/             # Post-quantum crypto
│   ├── audit/              # Audit logging
│   ├── theme-provider.tsx  # Theme management
│   └── utils.ts            # Utility functions
└── public/                  # Static assets
```

---

## 🔒 Security & Privacy

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

- [x] Core site structure (Home, About, Services, Methods, Contact)
- [x] Dual theme system (Special-Ops / Advisory)
- [x] Privacy & compliance pages
- [x] Live threat intelligence feed (prototype)
- [x] Animated stats showcase
- [x] Client vetting procedures documentation
- [x] Security headers implementation

### 🔄 In Progress

- [ ] Secure client portal with post-quantum encryption
- [ ] Authentication system (NextAuth + MFA)
- [ ] Encrypted document vault
- [ ] Audit logging infrastructure

### 📋 Planned

- [ ] Real-time threat intel pipeline (Skyvern-AI integration)
- [ ] Automated intel sources:
  - PRC cyberwarfare operations tracking
  - International fentanyl/nitazenes seizures
  - NATO intelligence leaks monitoring
  - Critical infrastructure incidents (e.g., Spanish power grid)
- [ ] Admin panel for content management
- [ ] API for threat intel feed (authenticated)
- [ ] Integration with Signal/Matrix for secure comms

---

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/SWORDIntel/SWORDINTELLIGENCE.git
cd SWORDINTELLIGENCE

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

**Note**: Production build requires proper Node environment. Current build has environment-specific issues with Next.js 15; recommend deploying to Vercel or downgrading to Next.js 14.x if needed.

---

## 📜 License

Proprietary - © 2024 SWORD Intelligence. All rights reserved.

---

## 🤝 Contact

- **Secure Intake**: [Contact Page](/contact)
- **PGP Email**: secure@sword-intel.example
- **Emergency Hotline**: +1 (XXX) XXX-XXXX (24/7)

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

---

*Last Updated: November 5, 2024*
