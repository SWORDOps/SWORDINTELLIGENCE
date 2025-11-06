# SWORD Intelligence Platform - Setup Guide

This guide will help you set up the SWORD Intelligence platform with all its features enabled, including OSINT threat intelligence feeds and biometric authentication.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- (Optional) Hardware authenticators: YubiKey, CAC card reader, or fingerprint reader

## 1. Database Setup

### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql
```

### Create Database

```bash
# Create user and database
sudo -u postgres psql
CREATE USER sword_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE sword_intel OWNER sword_user;
GRANT ALL PRIVILEGES ON DATABASE sword_intel TO sword_user;
\q
```

### Configure Environment

Copy `.env.example` to `.env` and update database connection:

```env
DATABASE_URL="postgresql://sword_user:your_secure_password@localhost:5432/sword_intel"
```

### Run Migration

```bash
npm run db:migrate
```

This will create all tables including:
- User authentication tables
- WebAuthn authenticator storage
- OSINT feed cache tables
- Message encryption tables
- And more...

## 2. Redis Setup

### Install Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

### Configure Environment

```env
REDIS_URL="redis://localhost:6379"
```

## 3. OSINT Feed API Keys

The platform integrates 18 free OSINT threat intelligence feeds. Some require API keys (all free tier):

### Required API Keys (Free)

#### 1. AlienVault OTX (Recommended)
- **What**: 19M+ threat indicators from 100k+ contributors worldwide
- **Signup**: https://otx.alienvault.com/
- **Rate Limit**: 10,000 requests/hour
- **Steps**:
  1. Create free account
  2. Go to Settings → API Integration
  3. Copy your API key
  4. Add to `.env`:
     ```env
     OTX_API_KEY=your_otx_api_key_here
     ```

#### 2. VirusTotal (Recommended)
- **What**: 70+ antivirus engines for file/URL scanning
- **Signup**: https://www.virustotal.com/gui/join-us
- **Rate Limit**: 500 requests/day, 4 requests/minute (free tier)
- **Steps**:
  1. Create free account
  2. Go to your profile → API Key
  3. Copy your API key
  4. Add to `.env`:
     ```env
     VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
     ```

#### 3. TRM Labs Sanctions (Optional)
- **What**: Cryptocurrency sanctions and compliance data
- **Signup**: https://www.trmlabs.com/
- **Steps**:
  1. Request API access (may require business use case)
  2. Add to `.env`:
     ```env
     TRM_API_KEY=your_trm_api_key_here
     ```

#### 4. DarkSearch (Optional)
- **What**: Dark web monitoring
- **Signup**: https://darksearch.io/
- **Steps**:
  1. Contact for API access
  2. Add to `.env`:
     ```env
     DARKSEARCH_API_KEY=your_darksearch_api_key_here
     ```

### Feeds That Don't Require API Keys

These feeds work immediately without configuration:
- ✅ **Shodan InternetDB** - Free IP enrichment
- ✅ **URLhaus** - Malware distribution URLs
- ✅ **Feodo Tracker** - Botnet C2 servers
- ✅ **SSL Blacklist** - Malicious SSL certificates
- ✅ **PhishTank** - Phishing URLs
- ✅ **OpenPhish** - Phishing intelligence
- ✅ **FBI InfraGard** - Critical infrastructure threats
- ✅ **DigitalSide Threat-Intel** - Malware IOCs
- ✅ **Blocklist.de** - Attack IPs
- ✅ **Tor Exit Nodes** - Tor network endpoints
- ✅ **Cryptojacking IPs** - Mining malware
- ✅ **DEA Narcotics** - Drug trafficking intelligence
- ✅ **Ultrapotent Opioids** - Fentanyl seizures

## 4. WebAuthn Configuration

### For Development (localhost)

```env
WEBAUTHN_RP_NAME="SWORD Intelligence"
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
```

### For Production

```env
WEBAUTHN_RP_NAME="SWORD Intelligence"
WEBAUTHN_RP_ID=yourdomain.com  # Your actual domain
WEBAUTHN_ORIGIN=https://yourdomain.com
```

### Hardware Authenticator Support

The platform supports:

1. **YubiKey** (All models)
   - YubiKey 5 Series (USB-A, USB-C, NFC, Lightning)
   - YubiKey 5 Bio (with fingerprint)
   - No additional software needed

2. **CAC/PIV Cards**
   - Common Access Card (DoD)
   - PIV smart cards
   - Requires: Smart card reader + middleware
     - Windows: Built-in support
     - macOS: Install OpenSC: `brew install opensc`
     - Linux: Install pcscd: `sudo apt install pcscd`

3. **Platform Authenticators**
   - Touch ID (macOS, iOS)
   - Face ID (iOS, iPadOS)
   - Windows Hello (Windows 10+)
   - Built-in support, no configuration needed

4. **USB Fingerprint Readers**
   - FIDO2-compliant fingerprint readers
   - Most work out of the box on modern browsers

## 5. HSM Configuration (Optional - Advanced)

For enterprise deployments requiring Hardware Security Module:

### Software HSM (Development)
```env
HSM_PROVIDER=software
```

### YubiHSM 2
```env
HSM_PROVIDER=yubihsm
HSM_LIBRARY_PATH=/usr/lib/libykcs11.so
HSM_SLOT_ID=0
HSM_PIN=your_hsm_pin
```

### Cloud HSM
```env
# AWS CloudHSM
HSM_PROVIDER=aws-cloudhsm
AWS_REGION=us-east-1

# Azure Key Vault
HSM_PROVIDER=azure-keyvault
AZURE_VAULT_NAME=your-vault-name

# Google Cloud KMS
HSM_PROVIDER=gcp-kms
GCP_PROJECT_ID=your-project-id
```

## 6. Start the Platform

### Development Mode

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start WebSocket server
npm run dev:ws

# Terminal 3: Start OSINT sync worker
npm run osint:sync

# Or start all at once:
npm run dev:all && npm run osint:sync
```

### Production Mode

```bash
# Build
npm run build
npm run build:ws

# Start services
npm run start:all

# Start OSINT sync worker (in background)
npm run osint:sync &
```

## 7. Initial Setup

1. **Access the platform**: http://localhost:3000
2. **Create admin account**: Register first user (becomes superadmin)
3. **Configure OSINT feeds**:
   - Go to Admin Panel → OSINT Feeds
   - Trigger initial sync: "Sync All Feeds"
   - Wait 2-5 minutes for first sync to complete
4. **Register hardware authenticator**:
   - Go to Settings → Security
   - Click "Add Device"
   - Follow prompts to register YubiKey/CAC/biometric

## 8. Testing OSINT Feeds

### Manual Test
```bash
# Run one-time sync
npm run osint:sync:once
```

### Check Feed Status
```bash
# Query database
psql $DATABASE_URL -c "SELECT id, name, enabled, last_fetched_at, indicator_count FROM \"OSINTFeed\";"
```

### View Indicators
```bash
# Check indicator count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"OSINTIndicator\";"

# View by severity
psql $DATABASE_URL -c "SELECT severity, COUNT(*) FROM \"OSINTIndicator\" GROUP BY severity;"
```

## 9. Testing WebAuthn

### Browser Requirements
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

### Test Registration
1. Navigate to Settings → Security
2. Click "Add Device"
3. Enter device name
4. Click "Register Device"
5. Touch your YubiKey/CAC or use biometric when prompted

### Test Authentication
1. Log out
2. Enter email on login page
3. Click "Hardware Authenticator" button
4. Touch your device when prompted

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check if tables exist
psql $DATABASE_URL -c "\dt"
```

### OSINT Sync Not Working
```bash
# Check logs
npm run osint:sync:once

# Verify API keys
curl -H "X-OTX-API-KEY: $OTX_API_KEY" https://otx.alienvault.com/api/v1/user/me
```

### WebAuthn Not Working
- Ensure HTTPS (or localhost for dev)
- Check browser console for errors
- Verify `WEBAUTHN_RP_ID` matches domain
- For CAC: Ensure smart card middleware installed

### Redis Connection Issues
```bash
# Test Redis
redis-cli ping

# Check if Redis is running
sudo systemctl status redis
```

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use HTTPS with valid SSL certificate
- [ ] Set secure `WEBAUTHN_RP_ID` and `WEBAUTHN_ORIGIN`
- [ ] Configure firewall rules (PostgreSQL, Redis, WebSocket)
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Set up monitoring/alerting
- [ ] Review and configure HSM if required
- [ ] Test disaster recovery procedures
- [ ] Document compliance requirements
- [ ] Run security audit
- [ ] Configure rate limiting
- [ ] Set up WAF (Web Application Firewall)

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/SWORDINTELLIGENCE/issues
- Documentation: See `/docs` directory
- Security Issues: Report privately to security@yourdomain.com

## Next Steps

- Read [OSINT_FEEDS.md](./OSINT_FEEDS.md) for detailed feed documentation
- Read [BIOMETRIC_AUTH.md](./BIOMETRIC_AUTH.md) for authentication details
- Explore Admin Panel features
- Configure custom alerting rules
- Set up additional integrations
