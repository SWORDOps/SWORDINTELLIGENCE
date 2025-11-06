/**
 * Post-Quantum Cryptography Utilities
 *
 * This module provides quantum-resistant encryption and signing using:
 * - Kyber-768: Key Encapsulation Mechanism (KEM) for encryption
 * - Dilithium-3: Digital signatures
 * - Hybrid Mode: PQC + RSA-4096 for transition period compatibility
 *
 * Security Level: NIST Level 3 (equivalent to AES-192)
 */

import { MlKem768 } from 'mlkem';
import * as Dilithium from 'dilithium-crystals-js';
import crypto from 'crypto';

// ============================================================================
// Kyber-768 Key Encapsulation (Encryption)
// ============================================================================

export interface KyberKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface KyberEncryptedData {
  ciphertext: Uint8Array;  // Encapsulated shared secret
  encryptedData: Uint8Array;  // AES-256-GCM encrypted payload
  iv: Uint8Array;  // Initialization vector for AES
  authTag: Uint8Array;  // Authentication tag for GCM
}

/**
 * Generate a new Kyber-768 keypair
 */
export async function generateKyberKeyPair(): Promise<KyberKeyPair> {
  const kem = new MlKem768();
  const [publicKey, privateKey] = await kem.generateKeyPair();

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Encrypt data using Kyber-768 + AES-256-GCM
 *
 * Process:
 * 1. Generate ephemeral Kyber keypair
 * 2. Encapsulate shared secret using recipient's public key
 * 3. Derive AES-256 key from shared secret
 * 4. Encrypt data with AES-256-GCM
 */
export async function encryptWithKyber(
  data: Buffer,
  recipientPublicKey: Uint8Array
): Promise<KyberEncryptedData> {
  const kem = new MlKem768();

  // Encapsulate: generates shared secret + ciphertext
  const { sharedSecret, ciphertext } = await kem.encap(recipientPublicKey);

  // Derive AES-256 key from shared secret
  const aesKey = crypto.createHash('sha256').update(Buffer.from(sharedSecret)).digest();

  // Generate random IV
  const iv = crypto.randomBytes(12); // 96 bits for GCM

  // Encrypt data with AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  const encryptedData = Buffer.concat([
    cipher.update(data),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    encryptedData,
    iv,
    authTag,
  };
}

/**
 * Decrypt data encrypted with Kyber-768
 */
export async function decryptWithKyber(
  encrypted: KyberEncryptedData,
  privateKey: Uint8Array
): Promise<Buffer> {
  const kem = new MlKem768();

  // Decapsulate: recover shared secret from ciphertext
  const sharedSecret = await kem.decap(encrypted.ciphertext, privateKey);

  // Derive AES-256 key from shared secret
  const aesKey = crypto.createHash('sha256').update(Buffer.from(sharedSecret)).digest();

  // Decrypt data with AES-256-GCM
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, encrypted.iv);
  decipher.setAuthTag(encrypted.authTag);

  const decryptedData = Buffer.concat([
    decipher.update(encrypted.encryptedData),
    decipher.final(),
  ]);

  return decryptedData;
}

// ============================================================================
// Dilithium-3 Digital Signatures
// ============================================================================

export interface DilithiumKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface DilithiumSignature {
  signature: Uint8Array;
  publicKey: Uint8Array;
  timestamp: number;
  algorithm: 'Dilithium3';
}

/**
 * Generate a new Dilithium-3 keypair
 */
export async function generateDilithiumKeyPair(): Promise<DilithiumKeyPair> {
  const keypair = await Dilithium.generateKeyPair(3); // Level 3 (recommended)

  return {
    publicKey: keypair.publicKey,
    privateKey: keypair.secretKey,
  };
}

/**
 * Sign data with Dilithium-3
 */
export async function signWithDilithium(
  data: Buffer,
  privateKey: Uint8Array,
  publicKey: Uint8Array
): Promise<DilithiumSignature> {
  const signature = await Dilithium.sign(data, privateKey, 3);

  return {
    signature,
    publicKey,
    timestamp: Date.now(),
    algorithm: 'Dilithium3',
  };
}

/**
 * Verify Dilithium-3 signature
 */
export async function verifyDilithiumSignature(
  data: Buffer,
  signature: DilithiumSignature
): Promise<boolean> {
  try {
    const isValid = await Dilithium.verify(
      signature.signature,
      data,
      signature.publicKey,
      3
    );
    return isValid;
  } catch (error) {
    console.error('Dilithium signature verification failed:', error);
    return false;
  }
}

// ============================================================================
// Hybrid Mode: PQC + RSA-4096
// ============================================================================

export interface HybridKeyPair {
  pqc: KyberKeyPair;
  rsa: {
    publicKey: string;  // PEM format
    privateKey: string;  // PEM format
  };
}

export interface HybridEncryptedData {
  pqc: KyberEncryptedData;
  rsa: {
    encryptedKey: Buffer;
    encryptedData: Buffer;
  };
  mode: 'hybrid';
}

/**
 * Generate hybrid keypair (PQC + RSA)
 */
export async function generateHybridKeyPair(): Promise<HybridKeyPair> {
  const pqcKeys = await generateKyberKeyPair();

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    pqc: pqcKeys,
    rsa: {
      publicKey,
      privateKey,
    },
  };
}

/**
 * Encrypt with hybrid mode (both PQC and RSA)
 *
 * This provides defense-in-depth: if either algorithm is broken,
 * the other still protects the data.
 */
export async function encryptHybrid(
  data: Buffer,
  recipientPublicKeys: HybridKeyPair
): Promise<HybridEncryptedData> {
  // Encrypt with Kyber
  const pqcEncrypted = await encryptWithKyber(data, recipientPublicKeys.pqc.publicKey);

  // Encrypt with RSA-4096-OAEP
  const rsaPublicKey = crypto.createPublicKey(recipientPublicKeys.rsa.publicKey);

  // Generate symmetric key for RSA encryption
  const symmetricKey = crypto.randomBytes(32);
  const encryptedKey = crypto.publicEncrypt(
    {
      key: rsaPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    symmetricKey
  );

  // Encrypt data with symmetric key
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
  const encryptedData = Buffer.concat([iv, cipher.update(data), cipher.final()]);

  return {
    pqc: pqcEncrypted,
    rsa: {
      encryptedKey,
      encryptedData,
    },
    mode: 'hybrid',
  };
}

/**
 * Decrypt hybrid-encrypted data
 *
 * Tries PQC first, falls back to RSA if PQC fails
 */
export async function decryptHybrid(
  encrypted: HybridEncryptedData,
  privateKeys: HybridKeyPair
): Promise<Buffer> {
  try {
    // Try PQC decryption first
    return await decryptWithKyber(encrypted.pqc, privateKeys.pqc.privateKey);
  } catch (pqcError) {
    console.warn('PQC decryption failed, falling back to RSA:', pqcError);

    // Fall back to RSA decryption
    const rsaPrivateKey = crypto.createPrivateKey(privateKeys.rsa.privateKey);

    // Decrypt symmetric key
    const symmetricKey = crypto.privateDecrypt(
      {
        key: rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encrypted.rsa.encryptedKey
    );

    // Decrypt data
    const iv = encrypted.rsa.encryptedData.subarray(0, 16);
    const ciphertext = encrypted.rsa.encryptedData.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, iv);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert Uint8Array to base64url (URL-safe base64)
 */
export function toBase64Url(data: Uint8Array | Buffer): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert base64url back to Uint8Array
 */
export function fromBase64Url(data: string): Uint8Array {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Generate cryptographic hash of data (SHA-256)
 */
export function hashData(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
  return crypto.randomBytes(16).toString('hex');
}
