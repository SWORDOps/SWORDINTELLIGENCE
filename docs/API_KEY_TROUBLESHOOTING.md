# API Key Troubleshooting Guide

## Current Status

### ✅ Configured API Keys
- **OTX API Key**: `147b1c8f...` (verified by user, but still getting 403)
- **VirusTotal API Key**: `70732def...` (needs verification)

### Test Results
```bash
# OTX Test (403 Forbidden)
curl -H "X-OTX-API-KEY: YOUR_KEY" \
  "https://otx.alienvault.com/api/v1/pulses/subscribed?limit=5"
# Response: Access denied

# Diagnosis: API key is valid format but account may need additional setup
```

## AlienVault OTX - Additional Steps

Even though you verified your account, you may need to:

### 1. Complete Email Verification
- Check for email from `noreply@alienvault.com`
- Click the verification link
- Log in to confirm account is active

### 2. Check Account Status
- Visit: https://otx.alienvault.com/api
- Look for API key section
- Verify status shows "Active" or "Verified"

### 3. Wait for Activation (Sometimes Required)
- New accounts may take 15-30 minutes to activate
- API access enabled after email verification processes

### 4. Try Regenerating the Key
If still not working after verification:
1. Log in to https://otx.alienvault.com/
2. Go to Settings → API Integration
3. Click "Regenerate API Key"
4. Copy the NEW key to `.env` file
5. Test again

### 5. Check Rate Limits
- Free tier: 10,000 requests/hour
- If you hit limits, wait 1 hour and try again

## VirusTotal - Verification Steps

### 1. Email Verification (Required)
- Check email from `noreply@virustotal.com`
- Click verification link
- This is REQUIRED before API access works

### 2. Get Your API Key
- Visit: https://www.virustotal.com/gui/user/YOUR_USERNAME/apikey
- Copy the API key shown
- Replace in `.env` if different from current

### 3. Understand Free Tier Limits
- 500 requests/day
- 4 requests/minute
- Non-commercial use only

## Testing Your Keys

### OTX Test Command
```bash
# Test user info endpoint
curl -H "X-OTX-API-KEY: YOUR_KEY" \
  "https://otx.alienvault.com/api/v1/user/me"

# Should return:
# {"username": "...", "member_since": "...", ...}
```

### VirusTotal Test Command
```bash
# Test with simple domain lookup
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/domains/google.com"

# Should return JSON with domain analysis
```

## What Works WITHOUT API Keys

You have **14 feeds** that work immediately with NO API keys required:

| Feed | Category | Works Now |
|------|----------|-----------|
| URLhaus | Malware URLs | ✅ Yes |
| PhishTank | Phishing | ✅ Yes |
| OpenPhish | Phishing | ✅ Yes |
| SSL Blacklist | Malware | ✅ Yes |
| Feodo Tracker | Botnets | ✅ Yes |
| FBI InfraGard | Critical Infrastructure | ✅ Yes |
| DigitalSide | Malware IOCs | ✅ Yes |
| Blocklist.de | Attack IPs | ✅ Yes |
| Tor Exit Nodes | Infrastructure | ✅ Yes |
| Cryptojacking IPs | Malware | ✅ Yes |
| **DEA Narcotics** | **Narcotics Trafficking** | ✅ Yes |
| **Ultrapotent Opioids** | **Fentanyl Seizures** | ✅ Yes |
| TOR Darknet Markets | Darknet | ✅ Yes |
| Shodan InternetDB | IP Enrichment | ✅ Yes |

**You can start syncing and using threat intelligence RIGHT NOW** even if the API keys aren't working yet!

## Quick Start (No API Keys Needed)

```bash
# Run one-time sync (works with 14 feeds immediately)
npm run osint:sync:once

# Expected output:
# [OSINT Sync] Fetching URLhaus...
# [OSINT Sync] URLhaus: ✓ 1847 new, 0 updated (3.2s)
# [OSINT Sync] Fetching PhishTank...
# [OSINT Sync] PhishTank: ✓ 892 new, 0 updated (2.1s)
# [OSINT Sync] Fetching DEA Narcotics...
# ... continues for all 14 feeds

# Total indicators: 10,000+ immediately!
```

## Final Troubleshooting Steps

### If OTX Still Doesn't Work:
1. Wait 30 minutes after email verification
2. Try from different IP address (VPN)
3. Contact OTX support: https://otx.alienvault.com/contact
4. Use the 14 other feeds in the meantime

### If VirusTotal Doesn't Work:
1. Make absolutely sure email is verified
2. Check spam folder for verification email
3. Try resetting password (sometimes triggers verification)
4. Contact VT support: https://support.virustotal.com/

### Database Setup (Required Next)

Even with API key issues, you should set up the database now:

```bash
# 1. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 2. Create database
sudo -u postgres psql
CREATE USER sword_user WITH PASSWORD 'your_password';
CREATE DATABASE sword_intel OWNER sword_user;
GRANT ALL PRIVILEGES ON DATABASE sword_intel TO sword_user;
\q

# 3. Update .env
DATABASE_URL="postgresql://sword_user:your_password@localhost:5432/sword_intel"

# 4. Run migration
npm run db:migrate

# 5. Test sync (14 feeds work immediately)
npm run osint:sync:once
```

## Summary

- **OTX**: Verified but may need 30min activation time
- **VirusTotal**: Need to verify email first
- **14 other feeds**: Work RIGHT NOW, no keys needed
- **DEA Narcotics & Fentanyl feeds**: Ready to use immediately
- **Next step**: Set up database and run initial sync

You don't need to wait for API keys to start using the platform! 🚀
