# Biometric & Hardware Authentication

## Overview

SWORD Intelligence supports multiple hardware and biometric authentication methods using FIDO2/WebAuthn standards:

- **YubiKey** (USB, NFC, Lightning)
- **CAC/PIV Cards** (Common Access Card / Personal Identity Verification)
- **Fingerprint Readers** (USB biometric scanners)
- **Platform Authenticators** (Touch ID, Face ID, Windows Hello)
- **Hardware Security Modules (HSM)** (YubiHSM, AWS CloudHSM, Azure Key Vault)

All methods provide phishing-resistant, passwordless authentication with public-key cryptography.

---

## Supported Authenticators

### 1. YubiKey

**Models Supported:**
- YubiKey 5 Series (5, 5C, 5 NFC, 5Ci, 5C NFC)
- YubiKey 5 FIPS
- YubiKey Bio (fingerprint)
- Security Key Series (FIDO2-only)

**Protocols:**
- FIDO2/WebAuthn
- U2F (legacy)
- OATH (TOTP/HOTP)
- PIV (smart card)
- OpenPGP

**Connection Types:**
- USB-A
- USB-C
- NFC (mobile)
- Lightning (iOS)

**Use Cases:**
- Passwordless login
- Second-factor authentication
- SSH keys
- Code signing
- Email encryption (PGP)

**AAGUIDs (for detection):**
```
f8a011f3-8c0a-4d15-8006-17111f9edc7d  // YubiKey 5 Series
2fc0579f-8113-47ea-b116-bb5a8db9202a  // YubiKey 5 NFC
6d44ba9b-f6ec-2e49-b930-0c8fe920cb73  // YubiKey 5Ci
ee882879-721c-4913-9775-3dfcce97072a  // YubiKey Bio
```

### 2. CAC/PIV Cards (Common Access Card)

**Supported Cards:**
- DoD CAC (U.S. Department of Defense)
- PIV cards (NIST SP 800-73)
- PIV-I (interoperable PIV)
- Federal PIV credentials

**Requirements:**
- Smart card reader (USB or built-in)
- PIV middleware/driver
- PIN code

**Certificates:**
- PIV Authentication (9A)
- Digital Signature (9C)
- Key Management (9D)
- Card Authentication (9E)

**Use Cases:**
- Federal/military authentication
- PKI-based login
- Email signing/encryption
- Document signing

**Certificate Validation:**
```
✓ Certificate chain to DoD Root CA
✓ Not revoked (CRL/OCSP check)
✓ Within validity period
✓ Purpose includes authentication
```

### 3. Fingerprint Readers

**Supported Devices:**
- FIDO2-certified USB fingerprint readers
- Kensington VeriMark
- Eikon fingerprint readers
- Generic FIDO2 biometric devices

**Technology:**
- Capacitive fingerprint sensor
- Match-on-device (biometric never leaves reader)
- FIDO2 protocol

**Security:**
- Biometric template stored in reader
- No fingerprint data sent to server
- Anti-spoofing detection

### 4. Platform Authenticators

**Supported Platforms:**

**macOS:**
- Touch ID (MacBook Pro, MacBook Air, iMac)
- Requires macOS 10.15+ (Catalina)

**iOS:**
- Face ID (iPhone X and later)
- Touch ID (iPhone 5s - 8, iPad)
- Requires iOS 14+

**Windows:**
- Windows Hello (fingerprint, face, PIN)
- Requires Windows 10 version 1903+

**Android:**
- Fingerprint sensors
- Face unlock
- Requires Android 9+

**Chrome OS:**
- Built-in fingerprint sensors
- PIN unlock

### 5. Hardware Security Modules (HSM)

**Supported HSMs:**

#### PKCS#11 Compatible:
- YubiHSM 2
- Thales Luna HSM
- nCipher nShield
- Utimaco SecurityServer

#### Cloud HSMs:
- AWS CloudHSM
- Azure Key Vault (HSM-backed)
- Google Cloud KMS
- IBM Cloud HSM

**Use Cases:**
- Master key storage
- Code signing
- Certificate authority
- Cryptographic operations at scale

**Key Operations:**
- Key generation (RSA, ECDSA, EdDSA, AES)
- Digital signatures
- Encryption/decryption
- Key derivation

---

## Implementation

### WebAuthn Registration

**Client-Side (Browser):**
```typescript
import { startRegistration } from '@simplewebauthn/browser';

// 1. Request registration options from server
const optionsResponse = await fetch('/api/auth/webauthn/register/options', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ authenticatorType: 'yubikey' })
});

const { options } = await optionsResponse.json();

// 2. Start WebAuthn ceremony (browser prompts for authenticator)
const attestationResponse = await startRegistration(options);

// 3. Verify with server
const verificationResponse = await fetch('/api/auth/webauthn/register/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    response: attestationResponse,
    authenticatorName: 'YubiKey 5 NFC'
  })
});

const { success, authenticator } = await verificationResponse.json();
```

**Server-Side (API):**
```typescript
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

// Generate options
const options = await generateRegistrationOptions({
  rpName: 'SWORD Intelligence',
  rpID: 'sword-intel.com',
  userID: userId,
  userName: userEmail,
  attestationType: 'direct', // Get authenticator details
  authenticatorSelection: {
    authenticatorAttachment: 'cross-platform', // External device
    residentKey: 'preferred',
    userVerification: 'preferred'
  }
});

// Verify response
const verification = await verifyRegistrationResponse({
  response: attestationResponse,
  expectedChallenge,
  expectedOrigin,
  expectedRPID
});

if (verification.verified) {
  // Store authenticator in database
  const { credentialID, credentialPublicKey, counter, aaguid } = verification.registrationInfo;
  await saveAuthenticator({ credentialID, credentialPublicKey, counter, aaguid });
}
```

### WebAuthn Authentication

**Client-Side:**
```typescript
import { startAuthentication } from '@simplewebauthn/browser';

// 1. Request authentication options
const optionsResponse = await fetch('/api/auth/webauthn/authenticate/options', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: userEmail })
});

const { options } = await optionsResponse.json();

// 2. Start authentication ceremony
const assertionResponse = await startAuthentication(options);

// 3. Verify with server
const verificationResponse = await fetch('/api/auth/webauthn/authenticate/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userEmail,
    response: assertionResponse
  })
});

const { success } = await verificationResponse.json();
if (success) {
  // User authenticated
}
```

### HSM Integration

**Initialize HSM:**
```typescript
import { getHSM, initializeHSM } from '@/lib/auth/hsm';

// Initialize on app startup
await initializeHSM();

const hsm = getHSM();

// Generate master key
const masterKey = await hsm.generateMasterKey();
console.log('Master key ID:', masterKey.id);
```

**Sign with HSM:**
```typescript
const hsm = getHSM();

const data = Buffer.from('Important document');
const signature = await hsm.sign(masterKeyId, data);

// Signature can be verified with public key
const verified = await hsm.verify(masterKeyId, data, signature);
```

**Encrypt with HSM:**
```typescript
const hsm = getHSM();

const plaintext = Buffer.from('Sensitive data');
const ciphertext = await hsm.encrypt(keyId, plaintext);

// Decrypt
const decrypted = await hsm.decrypt(keyId, ciphertext);
```

---

## Configuration

### Environment Variables

```env
# WebAuthn
WEBAUTHN_RP_NAME="SWORD Intelligence"
WEBAUTHN_RP_ID=sword-intel.com
WEBAUTHN_ORIGIN=https://sword-intel.com

# HSM Configuration
HSM_PROVIDER=yubihsm                        # yubihsm, pkcs11, aws-cloudhsm, azure-keyvault, gcp-kms, software
HSM_LIBRARY_PATH=/usr/lib/libykcs11.so     # For PKCS#11
HSM_SLOT_ID=0                               # For PKCS#11
HSM_PIN=123456                              # For PKCS#11

# AWS CloudHSM
HSM_REGION=us-east-1

# Azure Key Vault
HSM_VAULT_NAME=sword-intel-keyvault

# GCP KMS
HSM_PROJECT_ID=sword-intel-project
HSM_KEYRING_NAME=sword-intel-keyring
```

### CORS (for WebAuthn)

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/auth/webauthn/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://sword-intel.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

---

## Security Considerations

### Public Key Cryptography

All authenticators use public-key cryptography:
1. **Registration**: Authenticator generates key pair, sends public key to server
2. **Authentication**: Authenticator signs challenge with private key
3. **Verification**: Server verifies signature with stored public key

**Private keys never leave the authenticator.**

### Phishing Resistance

WebAuthn is resistant to phishing:
- Origin validation (domain must match RP ID)
- Challenge-response prevents replay attacks
- Hardware-backed credentials cannot be copied

### Attestation

Attestation proves authenticator authenticity:
- **Direct**: Full certificate chain from manufacturer
- **Indirect**: Anonymization service validates
- **None**: No attestation (privacy-preserving)

**SWORD Intel uses `direct` attestation to verify device type.**

### Counter Verification

Authenticators maintain signature counters:
- Increments on each use
- Server detects cloned authenticators if counter decreases
- Alerts on anomalous counter values

### User Verification

Three levels:
- **discouraged**: No user verification (touch only)
- **preferred**: Use if available (fingerprint, PIN)
- **required**: Must have user verification

**SWORD Intel uses `preferred` for flexibility.**

---

## Deployment

### Production Checklist

- [ ] **HTTPS required** (WebAuthn only works over HTTPS)
- [ ] **Proper RP ID** (must match domain)
- [ ] **Database storage** for authenticators (replace in-memory)
- [ ] **Backup authentication** (TOTP, recovery codes)
- [ ] **User management** (add/remove authenticators)
- [ ] **Audit logging** (track registrations/authentications)
- [ ] **HSM initialized** (if using hardware HSM)
- [ ] **Certificate validation** (for CAC/PIV)

### YubiKey Setup

1. **Purchase YubiKey** (5 Series recommended)
2. **Configure YubiKey Manager**:
   ```bash
   # Install YubiKey Manager
   brew install ykman  # macOS
   sudo apt-get install yubikey-manager  # Linux

   # Check YubiKey status
   ykman info

   # Enable FIDO2
   ykman fido access change-pin
   ```

3. **Register in SWORD Intel**:
   - Navigate to Portal → Settings → Hardware Authenticators
   - Click "Register YubiKey"
   - Follow browser prompts
   - Touch YubiKey when LED blinks

### CAC Card Setup

1. **Install Smart Card Middleware**:
   ```bash
   # macOS (built-in)
   # Windows: Download ActivClient or OpenSC
   # Linux:
   sudo apt-get install pcscd opensc
   ```

2. **Insert CAC Card** into reader

3. **Register in SWORD Intel**:
   - Navigate to Portal → Settings → Hardware Authenticators
   - Click "Register CAC/PIV Card"
   - Enter PIN when prompted
   - Select authentication certificate

### HSM Setup

#### YubiHSM 2:
```bash
# Install YubiHSM SDK
wget https://developers.yubico.com/YubiHSM2/Releases/yubihsm2-sdk-2024-03-linux-amd64.tar.gz
tar -xzf yubihsm2-sdk-2024-03-linux-amd64.tar.gz
sudo ./install.sh

# Start connector
yubihsm-connector -d

# Configure SWORD Intel
export HSM_PROVIDER=yubihsm
export HSM_LIBRARY_PATH=/usr/lib/libykcs11.so
export HSM_SLOT_ID=0
export HSM_PIN=0001password
```

#### AWS CloudHSM:
```bash
# Install CloudHSM client
wget https://s3.amazonaws.com/cloudhsmv2-software/CloudHsmClient/...
sudo ./install.sh

# Configure
export HSM_PROVIDER=aws-cloudhsm
export HSM_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

---

## Troubleshooting

### WebAuthn Not Working

**Issue**: "WebAuthn not supported"
**Solution**:
- Ensure HTTPS (or localhost for development)
- Update browser to latest version
- Check browser compatibility

**Issue**: "Registration failed"
**Solution**:
- Check RP ID matches domain
- Verify origin in options
- Check authenticator is FIDO2-certified

**Issue**: "Authentication failed"
**Solution**:
- Verify authenticator is registered
- Check credential ID matches
- Ensure counter hasn't decreased (cloned device)

### YubiKey Issues

**Issue**: LED doesn't blink
**Solution**:
- Try different USB port
- Update YubiKey firmware
- Check FIDO2 is enabled (`ykman fido info`)

**Issue**: "Touch timeout"
**Solution**:
- Touch within 30 seconds
- Touch the metal contact firmly

### CAC Card Issues

**Issue**: "Smart card not detected"
**Solution**:
- Install middleware (ActivClient, OpenSC)
- Check reader is connected
- Insert card fully

**Issue**: "Certificate validation failed"
**Solution**:
- Verify DoD root CA installed
- Check certificate not expired
- Ensure CRL/OCSP accessible

### HSM Issues

**Issue**: "Failed to initialize PKCS#11"
**Solution**:
- Check library path correct
- Verify slot ID
- Test with `pkcs11-tool`

**Issue**: "PIN incorrect"
**Solution**:
- Verify HSM_PIN environment variable
- Check PIN hasn't been locked (too many attempts)

---

## API Reference

### POST /api/auth/webauthn/register/options
Generate registration options for new authenticator.

**Request:**
```json
{
  "authenticatorType": "yubikey"
}
```

**Response:**
```json
{
  "success": true,
  "options": {
    "challenge": "...",
    "rp": { "name": "SWORD Intelligence", "id": "sword-intel.com" },
    "user": { "id": "...", "name": "user@example.com", "displayName": "User" },
    "pubKeyCredParams": [...],
    "authenticatorSelection": {...},
    "timeout": 60000
  }
}
```

### POST /api/auth/webauthn/register/verify
Verify and store new authenticator.

### POST /api/auth/webauthn/authenticate/options
Generate authentication options.

### POST /api/auth/webauthn/authenticate/verify
Verify authentication.

---

## Supported Browsers

| Browser | Version | Platform | Support |
|---------|---------|----------|---------|
| Chrome | 67+ | All | ✅ Full |
| Edge | 18+ | Windows | ✅ Full |
| Firefox | 60+ | All | ✅ Full |
| Safari | 13+ | macOS/iOS | ✅ Full |
| Opera | 54+ | All | ✅ Full |

---

## References

- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [FIDO Alliance](https://fidoalliance.org/)
- [YubiKey Documentation](https://docs.yubico.com/)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/) (Digital Identity Guidelines)
- [NIST SP 800-73](https://csrc.nist.gov/publications/detail/sp/800-73/4/final) (PIV Specification)

---

*Last Updated: November 6, 2024*
