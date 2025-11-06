# OSINT Threat Intelligence Feeds

## Overview

SWORD Intelligence integrates 18 free and open-source threat intelligence feeds to provide real-time threat data across:
- Malware & botnets (7 feeds)
- Phishing campaigns (2 feeds)
- APT & nation-state operations (2 feeds)
- Cryptocurrency crime (2 feeds)
- Dark web monitoring (2 feeds)
- Narcotics trafficking (1 feed)
- Vulnerabilities (2 feeds)
- Threat intelligence platforms (3 feeds - AlienVault OTX, VirusTotal, Shodan)

## Integrated Feeds

### 🦠 Malware & Botnet Feeds

#### Abuse.ch URLhaus
- **URL**: https://urlhaus-api.abuse.ch/
- **Data**: Malware distribution URLs, C2 infrastructure
- **Format**: JSON API
- **Update**: Every 60 minutes
- **Free**: Yes
- **Coverage**: 100,000+ malicious URLs

#### Abuse.ch MalwareBazaar
- **URL**: https://mb-api.abuse.ch/
- **Data**: Malware samples and hashes (MD5, SHA256)
- **Format**: JSON API
- **Update**: Every 120 minutes
- **Free**: Yes
- **Coverage**: 1M+ malware samples

#### Abuse.ch ThreatFox
- **URL**: https://threatfox-api.abuse.ch/
- **Data**: IOCs from ThreatFox community
- **Format**: JSON API
- **Update**: Every 60 minutes
- **Free**: Yes
- **Coverage**: Real-time threat indicators

#### Abuse.ch SSL Blacklist
- **URL**: https://sslbl.abuse.ch/
- **Data**: Malicious SSL certificates, JA3 fingerprints
- **Format**: CSV
- **Update**: Every 180 minutes
- **Free**: Yes
- **Coverage**: Botnet C2 certificates

### 🎣 Phishing Feeds

#### OpenPhish
- **URL**: https://openphish.com/feed.txt
- **Data**: Active phishing URLs
- **Format**: Text (line-delimited)
- **Update**: Every 120 minutes
- **Free**: Yes (50 URLs in free tier)
- **Premium**: API available with higher limits

#### PhishTank
- **URL**: https://data.phishtank.com/
- **Data**: Community-verified phishing sites
- **Format**: JSON
- **Update**: Every 180 minutes
- **Free**: Yes
- **Rate Limit**: 10 req/hour (free)

### 🎯 APT & Nation-State Tracking

#### MITRE ATT&CK
- **URL**: https://github.com/mitre/cti
- **Data**: APT tactics, techniques, procedures (TTPs)
- **Format**: STIX 2.0 JSON
- **Update**: Daily
- **Free**: Yes
- **Coverage**: 130+ threat groups, 600+ techniques

#### CIRCL OSINT Feed
- **URL**: https://www.circl.lu/doc/misp/feed-osint/
- **Data**: OSINT threat intelligence from CIRCL Luxembourg
- **Format**: JSON (MISP format)
- **Update**: Every 240 minutes
- **Free**: Yes
- **Coverage**: Malware, APT, phishing

### 💰 Cryptocurrency & Web3

#### TRM Labs Sanctions Screening
- **URL**: https://api.trmlabs.com/public/v1/
- **Data**: Sanctioned crypto addresses
- **Format**: JSON API
- **Update**: Every 360 minutes
- **Free**: Yes (API key required)
- **Coverage**: 25 blockchains

#### Ransomwhere Tracker
- **URL**: https://ransomwhe.re/api/
- **Data**: Ransomware Bitcoin addresses and payments
- **Format**: JSON API
- **Update**: Every 360 minutes
- **Free**: Yes
- **Coverage**: 150+ ransomware families

### 🕵️ Dark Web Monitoring

#### DarkSearch API
- **URL**: https://darksearch.io/api/
- **Data**: Tor-indexed dark web search
- **Format**: JSON API
- **Update**: Every 360 minutes
- **Free**: Limited (API key required for full access)
- **Coverage**: Onion sites, marketplaces, forums

#### Tor Exit Node List
- **URL**: https://check.torproject.org/torbulkexitlist
- **Data**: Current Tor exit node IP addresses
- **Format**: Text (line-delimited)
- **Update**: Every 180 minutes
- **Free**: Yes
- **Coverage**: ~1,000 active exit nodes

### 🛡️ Vulnerability Databases

#### NVD CVE Feed
- **URL**: https://services.nvd.nist.gov/rest/json/cves/2.0
- **Data**: National Vulnerability Database
- **Format**: JSON API
- **Update**: Every 360 minutes
- **Free**: Yes
- **Rate Limit**: 50 req/hour (without API key)

#### CISA Known Exploited Vulnerabilities
- **URL**: https://www.cisa.gov/known-exploited-vulnerabilities
- **Data**: Actively exploited vulnerabilities catalog
- **Format**: JSON
- **Update**: Every 360 minutes
- **Free**: Yes
- **Coverage**: 1,000+ exploited CVEs

### 💊 Narcotics & Law Enforcement

#### DEA NFLIS Data
- **URL**: https://www.nflis.deadiversion.usdoj.gov/
- **Data**: National Forensic Laboratory Information System
- **Format**: Reports (no API)
- **Update**: Quarterly
- **Free**: Yes
- **Note**: Requires manual data extraction

### 🔍 Threat Intelligence Platforms

#### AlienVault OTX (Open Threat Exchange)
- **URL**: https://otx.alienvault.com/api/
- **Data**: Comprehensive threat intelligence (19M+ indicators)
- **Format**: JSON API
- **Update**: Every 120 minutes
- **Free**: Yes (API key required)
- **Rate Limit**: 10,000 requests/hour (with API key)
- **Coverage**: 100,000+ contributors from 140 countries
- **Features**:
  - Threat pulses with contextual IOCs
  - TLP (Traffic Light Protocol) markings
  - Multiple indicator types (IP, domain, URL, hash, email)
  - Community-driven threat intelligence
  - Integration with MISP, Maltego, Splunk

#### VirusTotal
- **URL**: https://www.virustotal.com/api/v3/
- **Data**: File/URL malware scanning, threat intelligence
- **Format**: JSON API
- **Update**: Every 360 minutes (6 hours, due to rate limits)
- **Free**: Yes (API key required)
- **Rate Limit**: 500 requests/day, 4 requests/minute
- **Coverage**: 70+ antivirus engines
- **Features**:
  - Multi-engine malware detection
  - URL/domain/IP reputation
  - File hash lookups
  - Community submissions
  - Historical analysis data
- **Note**: Non-commercial use only for free tier

#### Shodan InternetDB
- **URL**: https://internetdb.shodan.io/
- **Data**: IP enrichment (ports, vulnerabilities, tags)
- **Format**: JSON API
- **Update**: Every 240 minutes (4 hours)
- **Free**: Yes (no API key required)
- **Rate Limit**: None for InternetDB
- **Coverage**: Internet-wide IP scanning
- **Features**:
  - Open ports detection
  - Known vulnerabilities (CVEs)
  - Service identification
  - Hostname resolution
  - No authentication required
- **Note**: Free tier provides basic IP enrichment only. Full Shodan API requires paid subscription.

## API Usage

### Fetch All Feeds

```bash
GET /api/osint/feeds
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "feeds": [
    {
      "id": "abuse-urlhaus",
      "name": "Abuse.ch URLhaus",
      "category": "malware",
      "enabled": true,
      "updateInterval": 60,
      "description": "Malware distribution URLs, C2 infrastructure"
    }
  ],
  "total": 15,
  "enabled": 12
}
```

### Fetch Indicators

```bash
GET /api/osint/indicators?feedId=abuse-urlhaus
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "feedId": "abuse-urlhaus",
  "indicators": [
    {
      "id": "abuse-urlhaus-12345",
      "source": "Abuse.ch URLhaus",
      "type": "url",
      "value": "http://malicious-site.example/payload.exe",
      "confidence": 85,
      "severity": "high",
      "tags": ["malware_download", "emotet"],
      "firstSeen": "2024-11-06T10:30:00Z",
      "lastSeen": "2024-11-06T10:30:00Z",
      "description": "URLhaus: malware_download",
      "metadata": {
        "urlStatus": "online",
        "reporter": "analyst123"
      }
    }
  ],
  "total": 1234
}
```

### Search Indicators

```bash
GET /api/osint/indicators?search=emotet
Authorization: Bearer <token>
```

### Filter by Category

```bash
GET /api/osint/indicators?category=malware&severity=critical
Authorization: Bearer <token>
```

## Feed Categories

| Category | Description | Feed Count |
|----------|-------------|------------|
| `malware` | Malware, trojans, RATs | 4 |
| `phishing` | Phishing sites, credential theft | 2 |
| `apt` | APT groups, nation-state TTPs | 2 |
| `crypto` | Crypto crime, ransomware wallets | 2 |
| `darkweb` | Tor, onion sites, markets | 2 |
| `infrastructure` | Vulnerable systems, SSL certs | 2 |
| `narcotics` | Drug trafficking, darknet markets | 1 |

## Indicator Types

| Type | Description | Example |
|------|-------------|---------|
| `ip` | IP address | `192.0.2.1` |
| `domain` | Domain name | `malicious.example` |
| `url` | Full URL | `http://evil.example/payload` |
| `hash` | File hash | `abc123...` (MD5/SHA256) |
| `email` | Email address | `phish@example.com` |
| `wallet` | Crypto wallet | `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` |
| `onion` | Tor onion address | `example.onion` |
| `cve` | CVE identifier | `CVE-2024-12345` |

## Severity Levels

- **critical**: Immediate threat, active exploitation
- **high**: Significant threat, known malicious
- **medium**: Suspicious activity, potential threat
- **low**: Low-risk indicator
- **info**: Informational, context only

## Configuration

### Environment Variables

```env
# AlienVault OTX (threat intelligence platform)
# Sign up at https://otx.alienvault.com/ to get free API key
OTX_API_KEY=your_otx_api_key_here

# VirusTotal (malware scanning)
# Sign up at https://www.virustotal.com/ for free API key
# Free tier: 500 req/day, 4 req/min
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# TRM Labs (crypto sanctions)
# Sign up at https://www.trmlabs.com/ for free API key
TRM_API_KEY=your_trm_api_key_here

# DarkSearch (dark web monitoring)
# Sign up at https://darksearch.io/ for API access
DARKSEARCH_API_KEY=your_darksearch_api_key_here

# Shodan InternetDB - No API key needed for free tier

# HSM for signing threat data
HSM_PROVIDER=software
```

### Enable/Disable Feeds

Edit `lib/intelligence/osint-feeds.ts`:

```typescript
{
  id: 'abuse-urlhaus',
  name: 'Abuse.ch URLhaus',
  category: 'malware',
  enabled: true, // Set to false to disable
  // ...
}
```

## Integration Examples

### TypeScript/Node.js

```typescript
import { osintFeedManager } from '@/lib/intelligence/osint-feeds';

// Fetch specific feed
const indicators = await osintFeedManager.fetchFeed('abuse-urlhaus');

// Search for indicator
const results = await osintFeedManager.searchIndicator('malicious-domain.com');

// Get all indicators
const all = await osintFeedManager.getAllIndicators();

// Get statistics
const stats = osintFeedManager.getStatistics();
```

### Python

```python
import requests

# Fetch indicators
response = requests.get(
    'https://your-domain.com/api/osint/indicators',
    headers={'Authorization': 'Bearer YOUR_TOKEN'},
    params={'feedId': 'abuse-urlhaus'}
)

indicators = response.json()['indicators']

for indicator in indicators:
    print(f"{indicator['type']}: {indicator['value']} ({indicator['severity']})")
```

### Threat Intel Platform (MISP)

```python
from pymisp import ExpandedPyMISP

misp = ExpandedPyMISP('https://misp.example', 'API_KEY')

# Import SWORD Intel OSINT indicators
indicators = get_sword_intel_indicators()

event = misp.new_event(
    distribution=0,
    threat_level_id=2,
    analysis=1,
    info='SWORD Intel OSINT Feed'
)

for indicator in indicators:
    misp.add_attribute(
        event,
        type=indicator['type'],
        value=indicator['value'],
        comment=indicator['description']
    )
```

## Rate Limiting

| Feed | Free Tier Limit | Premium |
|------|-----------------|---------|
| Abuse.ch | Unlimited | N/A |
| OpenPhish | 50 URLs | API with key |
| PhishTank | 10 req/hour | Registration |
| TRM Labs | 100 req/hour | Enterprise |
| NVD | 50 req/hour | 50,000/hour with key |

## Caching

All feeds are cached in-memory based on `updateInterval`:
- URLhaus: 60 minutes
- MalwareBazaar: 120 minutes
- Phishing feeds: 120-180 minutes
- CVE feeds: 360 minutes (6 hours)

Cache is automatically refreshed on next request after interval expires.

## Performance

- **In-memory caching**: Sub-millisecond lookups
- **Concurrent fetching**: All feeds fetched in parallel
- **Automatic retry**: Failed fetches use cached data
- **Rate limit handling**: Respects per-feed limits

## Future Enhancements

Planned integrations:
- [ ] AlienVault OTX (Open Threat Exchange)
- [ ] VirusTotal API (limited free tier)
- [ ] Shodan (Internet device search)
- [ ] GreyNoise (Internet scanner classification)
- [ ] IPVoid (IP reputation)
- [ ] URLScan.io (URL analysis)
- [ ] Hybrid Analysis (malware sandbox)

## Support

For issues or feed suggestions:
- GitHub: https://github.com/SWORDIntel/SWORDINTELLIGENCE/issues
- Email: threat-intel@sword-intel.example

---

*Last Updated: November 6, 2024*
