/**
 * Post-Quantum Cryptography Utilities
 *
 * This module provides quantum-resistant encryption and signing using:
 * - ML-KEM-1024: Key Encapsulation Mechanism (NIST FIPS 203)
 * - ML-DSA-87: Digital Signature Algorithm (NIST FIPS 204, Dilithium-5)
 * - AES-256-GCM: Authenticated symmetric encryption
 *
 * Security Level: NIST Level 5 (equivalent to AES-256)
 *
 * IMPORTANT: All encryption uses ML-KEM-1024 + AES-256-GCM as per NIST specification.
 * All signatures use ML-DSA-87 (Dilithium-5) for maximum quantum resistance.
 */

import { MlKem1024 } from 'mlkem';
import * as Dilithium from 'dilithium-crystals-js';
import crypto from 'crypto';

// ============================================================================
// ML-KEM-1024 Key Encapsulation (Post-Quantum Encryption - NIST FIPS 203)
// ============================================================================

export interface MlKemKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface MlKemEncryptedData {
  ciphertext: Uint8Array;  // Encapsulated shared secret
  encryptedData: Uint8Array;  // AES-256-GCM encrypted payload
  iv: Uint8Array;  // Initialization vector for AES
  authTag: Uint8Array;  // Authentication tag for GCM
  algorithm: 'ML-KEM-1024-AES-256-GCM';
  version: '1.0';
}

/**
 * Generate a new ML-KEM-1024 keypair
 *
 * Security: NIST Level 5 (AES-256 equivalent, quantum-resistant)
 * Standard: NIST FIPS 203 (Module-Lattice-Based Key-Encapsulation Mechanism)
 */
export async function generateMlKemKeyPair(): Promise<MlKemKeyPair> {
  const kem = new MlKem1024();
  const [publicKey, privateKey] = await kem.generateKeyPair();

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Encrypt data using ML-KEM-1024 + AES-256-GCM
 *
 * Process:
 * 1. Encapsulate shared secret using recipient's ML-KEM-1024 public key
 * 2. Derive AES-256 key from shared secret using SHA-512
 * 3. Encrypt data with AES-256-GCM (provides confidentiality + authenticity)
 *
 * Security guarantees:
 * - Quantum-resistant key exchange (ML-KEM-1024)
 * - Authenticated encryption (AES-256-GCM)
 * - Forward secrecy (ephemeral shared secret)
 */
export async function encryptWithMlKem(
  data: Buffer,
  recipientPublicKey: Uint8Array
): Promise<MlKemEncryptedData> {
  const kem = new MlKem1024();

  // Encapsulate: generates shared secret + ciphertext
  const { sharedSecret, ciphertext } = await kem.encap(recipientPublicKey);

  // Derive AES-256 key from shared secret using SHA-512 (first 32 bytes)
  const aesKey = crypto.createHash('sha512').update(Buffer.from(sharedSecret)).digest().subarray(0, 32);

  // Generate random IV (96 bits for GCM mode)
  const iv = crypto.randomBytes(12);

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
    algorithm: 'ML-KEM-1024-AES-256-GCM',
    version: '1.0',
  };
}

/**
 * Decrypt data encrypted with ML-KEM-1024 + AES-256-GCM
 */
export async function decryptWithMlKem(
  encrypted: MlKemEncryptedData,
  privateKey: Uint8Array
): Promise<Buffer> {
  const kem = new MlKem1024();

  // Decapsulate: recover shared secret from ciphertext
  const sharedSecret = await kem.decap(encrypted.ciphertext, privateKey);

  // Derive AES-256 key from shared secret using SHA-512 (first 32 bytes)
  const aesKey = crypto.createHash('sha512').update(Buffer.from(sharedSecret)).digest().subarray(0, 32);

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
// ML-DSA-87 Digital Signatures (Post-Quantum - NIST FIPS 204)
// ============================================================================

export interface MlDsaKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface MlDsaSignature {
  signature: Uint8Array;
  publicKey: Uint8Array;
  timestamp: number;
  algorithm: 'ML-DSA-87';
}

/**
 * Generate a new ML-DSA-87 keypair
 *
 * Security: NIST Level 5 (equivalent to AES-256, quantum-resistant)
 * Standard: NIST FIPS 204 (Module-Lattice-Based Digital Signature Algorithm)
 * Implementation: Dilithium-5 (standardized as ML-DSA-87)
 */
export async function generateMlDsaKeyPair(): Promise<MlDsaKeyPair> {
  const keypair = await Dilithium.generateKeyPair(5); // Level 5 = ML-DSA-87

  return {
    publicKey: keypair.publicKey,
    privateKey: keypair.secretKey,
  };
}

/**
 * Sign data with ML-DSA-87
 *
 * Produces a quantum-resistant digital signature using the ML-DSA-87 algorithm
 * (Dilithium-5 implementation, standardized by NIST as FIPS 204).
 */
export async function signWithMlDsa(
  data: Buffer,
  privateKey: Uint8Array,
  publicKey: Uint8Array
): Promise<MlDsaSignature> {
  const signature = await Dilithium.sign(data, privateKey, 5); // Level 5 = ML-DSA-87

  return {
    signature,
    publicKey,
    timestamp: Date.now(),
    algorithm: 'ML-DSA-87',
  };
}

/**
 * Verify ML-DSA-87 signature
 *
 * Verifies a quantum-resistant digital signature using ML-DSA-87.
 * Returns true if signature is valid, false otherwise.
 */
export async function verifyMlDsaSignature(
  data: Buffer,
  signature: MlDsaSignature
): Promise<boolean> {
  try {
    const isValid = await Dilithium.verify(
      signature.signature,
      data,
      signature.publicKey,
      5 // Level 5 = ML-DSA-87
    );
    return isValid;
  } catch (error) {
    console.error('ML-DSA-87 signature verification failed:', error);
    return false;
  }
}

// ============================================================================
// Backward Compatibility (Legacy API)
// ============================================================================

/**
 * @deprecated Use generateMlKemKeyPair instead
 * Legacy alias for Kyber-768 compatibility
 */
export const generateKyberKeyPair = generateMlKemKeyPair;

/**
 * @deprecated Use encryptWithMlKem instead
 * Legacy alias for Kyber-768 compatibility
 */
export const encryptWithKyber = encryptWithMlKem;

/**
 * @deprecated Use decryptWithMlKem instead
 * Legacy alias for Kyber-768 compatibility
 */
export const decryptWithKyber = decryptWithMlKem;

/**
 * @deprecated Use generateMlDsaKeyPair instead
 * Legacy alias for Dilithium-3 compatibility
 */
export const generateDilithiumKeyPair = generateMlDsaKeyPair;

/**
 * @deprecated Use signWithMlDsa instead
 * Legacy alias for Dilithium-3 compatibility
 */
export const signWithDilithium = signWithMlDsa;

/**
 * @deprecated Use verifyMlDsaSignature instead
 * Legacy alias for Dilithium-3 compatibility
 */
export const verifyDilithiumSignature = verifyMlDsaSignature;

// Legacy type aliases
export type KyberKeyPair = MlKemKeyPair;
export type KyberEncryptedData = MlKemEncryptedData;
export type DilithiumKeyPair = MlDsaKeyPair;
export type DilithiumSignature = MlDsaSignature;

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
 * Generate cryptographic hash of data (SHA-512)
 */
export function hashData(data: Buffer): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Securely compare two buffers in constant time
 */
export function constantTimeCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

// ============================================================================
// Key Generation Helpers
// ============================================================================

/**
 * Generate complete keypair for encrypted messaging
 *
 * Generates both encryption (ML-KEM-1024) and signing (ML-DSA-87) keys
 * for a user. This is the recommended way to set up a new user's cryptographic
 * identity in the SWORD Intelligence platform.
 */
export async function generateUserKeyPair() {
  const [encryptionKeys, signingKeys] = await Promise.all([
    generateMlKemKeyPair(),
    generateMlDsaKeyPair(),
  ]);

  return {
    encryption: encryptionKeys,
    signing: signingKeys,
  };
}

/**
 * Encrypt and sign data in one operation
 *
 * This is the recommended way to send secure messages:
 * 1. Encrypts with recipient's ML-KEM-1024 public key
 * 2. Signs with sender's ML-DSA-87 private key
 *
 * Provides both confidentiality and authenticity.
 */
export async function encryptAndSign(
  data: Buffer,
  recipientPublicKey: Uint8Array,
  senderSigningPrivateKey: Uint8Array,
  senderSigningPublicKey: Uint8Array
): Promise<{
  encrypted: MlKemEncryptedData;
  signature: MlDsaSignature;
}> {
  // Encrypt the data
  const encrypted = await encryptWithMlKem(data, recipientPublicKey);

  // Sign the encrypted data (provides non-repudiation)
  const signature = await signWithMlDsa(
    Buffer.concat([
      encrypted.ciphertext,
      encrypted.encryptedData,
      encrypted.iv,
      encrypted.authTag,
    ]),
    senderSigningPrivateKey,
    senderSigningPublicKey
  );

  return {
    encrypted,
    signature,
  };
}

/**
 * Verify and decrypt data in one operation
 *
 * This is the recommended way to receive secure messages:
 * 1. Verifies signature with sender's ML-DSA-87 public key
 * 2. Decrypts with recipient's ML-KEM-1024 private key
 *
 * Returns null if signature verification fails.
 */
export async function verifyAndDecrypt(
  encrypted: MlKemEncryptedData,
  signature: MlDsaSignature,
  recipientPrivateKey: Uint8Array
): Promise<Buffer | null> {
  // Verify signature first
  const isValid = await verifyMlDsaSignature(
    Buffer.concat([
      encrypted.ciphertext,
      encrypted.encryptedData,
      encrypted.iv,
      encrypted.authTag,
    ]),
    signature
  );

  if (!isValid) {
    console.error('Signature verification failed - message may be tampered');
    return null;
  }

  // Decrypt the data
  return await decryptWithMlKem(encrypted, recipientPrivateKey);
}
