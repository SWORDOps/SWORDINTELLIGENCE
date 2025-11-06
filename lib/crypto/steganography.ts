import crypto from 'crypto';
import { PNG } from 'pngjs';

/**
 * Steganography Library
 *
 * Implements LSB (Least Significant Bit) steganography to hide encrypted data
 * inside PNG images. This provides plausible deniability and covert channels
 * for intelligence operations.
 *
 * Technique: Modifies the least significant bit of each RGB channel to encode
 * binary data. This creates imperceptible changes to the image while allowing
 * large payloads to be hidden.
 */

/**
 * Calculate maximum payload capacity for an image
 */
export function calculateCapacity(width: number, height: number): number {
  // Each pixel has 3 channels (RGB), we use 1 bit per channel
  // That's 3 bits per pixel
  const bitsPerPixel = 3;
  const totalPixels = width * height;
  const totalBits = totalPixels * bitsPerPixel;

  // Convert bits to bytes
  const totalBytes = Math.floor(totalBits / 8);

  // Reserve 32 bits (4 bytes) for payload length header
  return totalBytes - 4;
}

/**
 * Encode data into image using LSB steganography
 *
 * @param coverImage - PNG buffer of cover image
 * @param payload - Data to hide (will be encrypted first)
 * @param password - Password for encryption
 * @returns PNG buffer with hidden data
 */
export async function encodeData(
  coverImage: Buffer,
  payload: Buffer,
  password?: string
): Promise<Buffer> {
  // Parse PNG
  const png = PNG.sync.read(coverImage);

  // Check capacity
  const capacity = calculateCapacity(png.width, png.height);

  if (payload.length > capacity) {
    throw new Error(
      `Payload too large (${payload.length} bytes) for cover image (capacity: ${capacity} bytes)`
    );
  }

  // Encrypt payload if password provided
  let dataToEmbed = payload;
  let encrypted = false;

  if (password) {
    dataToEmbed = encryptPayload(payload, password);
    encrypted = true;
  }

  // Prepare data with header
  // Header format: [encrypted flag (1 byte)][payload length (4 bytes)][payload...]
  const header = Buffer.alloc(5);
  header.writeUInt8(encrypted ? 1 : 0, 0); // Encrypted flag
  header.writeUInt32BE(dataToEmbed.length, 1); // Payload length

  const fullPayload = Buffer.concat([header, dataToEmbed]);

  // Convert payload to bit array
  const bits: number[] = [];
  for (const byte of fullPayload) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Embed bits into image
  let bitIndex = 0;

  for (let i = 0; i < png.data.length && bitIndex < bits.length; i += 4) {
    // Process RGB channels (skip alpha channel at i+3)
    for (let channel = 0; channel < 3; channel++) {
      if (bitIndex >= bits.length) break;

      const pixelIndex = i + channel;

      // Clear LSB and set to our bit
      png.data[pixelIndex] = (png.data[pixelIndex] & 0xFE) | bits[bitIndex];
      bitIndex++;
    }
  }

  console.log(
    `✓ Embedded ${payload.length} bytes into ${png.width}x${png.height} image ` +
    `(${encrypted ? 'encrypted' : 'plaintext'}, capacity: ${capacity} bytes)`
  );

  // Encode back to PNG
  return PNG.sync.write(png);
}

/**
 * Decode data from image using LSB steganography
 *
 * @param stegoImage - PNG buffer containing hidden data
 * @param password - Password for decryption (if encrypted)
 * @returns Extracted payload
 */
export async function decodeData(
  stegoImage: Buffer,
  password?: string
): Promise<Buffer> {
  // Parse PNG
  const png = PNG.sync.read(stegoImage);

  // Extract bits from image
  const bits: number[] = [];

  for (let i = 0; i < png.data.length; i += 4) {
    // Process RGB channels (skip alpha)
    for (let channel = 0; channel < 3; channel++) {
      const pixelIndex = i + channel;

      // Extract LSB
      bits.push(png.data[pixelIndex] & 1);

      // Stop if we have enough bits for header (5 bytes = 40 bits)
      if (bits.length === 40) {
        break;
      }
    }

    if (bits.length >= 40) break;
  }

  // Read header
  const headerBytes = bitsToBytes(bits.slice(0, 40));
  const encrypted = headerBytes.readUInt8(0) === 1;
  const payloadLength = headerBytes.readUInt32BE(1);

  // Calculate total bits needed
  const totalBits = (5 + payloadLength) * 8; // Header + payload

  // Extract all bits
  bits.length = 0; // Clear
  let bitIndex = 0;

  for (let i = 0; i < png.data.length && bitIndex < totalBits; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      if (bitIndex >= totalBits) break;

      const pixelIndex = i + channel;
      bits.push(png.data[pixelIndex] & 1);
      bitIndex++;
    }
  }

  // Convert bits to bytes
  const fullPayload = bitsToBytes(bits);

  // Skip header (5 bytes)
  const payload = fullPayload.slice(5, 5 + payloadLength);

  console.log(
    `✓ Extracted ${payload.length} bytes from ${png.width}x${png.height} image ` +
    `(${encrypted ? 'encrypted' : 'plaintext'})`
  );

  // Decrypt if needed
  if (encrypted) {
    if (!password) {
      throw new Error('Password required to decrypt payload');
    }

    return decryptPayload(payload, password);
  }

  return payload;
}

/**
 * Encrypt payload with AES-256-GCM
 */
function encryptPayload(data: Buffer, password: string): Buffer {
  // Derive key from password using PBKDF2
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

  // Encrypt
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: [salt (16)][iv (12)][authTag (16)][encrypted data]
  return Buffer.concat([salt, iv, authTag, encrypted]);
}

/**
 * Decrypt payload with AES-256-GCM
 */
function decryptPayload(encryptedData: Buffer, password: string): Buffer {
  // Parse components
  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const authTag = encryptedData.slice(28, 44);
  const encrypted = encryptedData.slice(44);

  // Derive key from password
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

  // Decrypt
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted;
}

/**
 * Convert bit array to bytes
 */
function bitsToBytes(bits: number[]): Buffer {
  const bytes: number[] = [];

  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;

    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      byte = (byte << 1) | bits[i + j];
    }

    bytes.push(byte);
  }

  return Buffer.from(bytes);
}

/**
 * Generate a decoy cover image (solid color with noise)
 */
export function generateCoverImage(
  width: number = 800,
  height: number = 600,
  baseColor: { r: number; g: number; b: number } = { r: 128, g: 128, b: 128 }
): Buffer {
  const png = new PNG({ width, height });

  // Fill with base color + random noise
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Add random noise (-10 to +10)
      const noise = () => Math.floor(Math.random() * 21) - 10;

      png.data[idx] = Math.max(0, Math.min(255, baseColor.r + noise()));
      png.data[idx + 1] = Math.max(0, Math.min(255, baseColor.g + noise()));
      png.data[idx + 2] = Math.max(0, Math.min(255, baseColor.b + noise()));
      png.data[idx + 3] = 255; // Alpha
    }
  }

  return PNG.sync.write(png);
}

/**
 * Validate that image can hold payload
 */
export function validateCapacity(
  imageWidth: number,
  imageHeight: number,
  payloadSize: number
): { valid: boolean; capacity: number; required: number } {
  const capacity = calculateCapacity(imageWidth, imageHeight);

  return {
    valid: payloadSize <= capacity,
    capacity,
    required: payloadSize,
  };
}

/**
 * Get steganography statistics
 */
export function getStats(imageWidth: number, imageHeight: number, payloadSize: number) {
  const capacity = calculateCapacity(imageWidth, imageHeight);
  const utilization = (payloadSize / capacity) * 100;

  return {
    imageSize: `${imageWidth}x${imageHeight}`,
    totalPixels: imageWidth * imageHeight,
    capacity: `${capacity} bytes (${(capacity / 1024).toFixed(2)} KB)`,
    payloadSize: `${payloadSize} bytes (${(payloadSize / 1024).toFixed(2)} KB)`,
    utilization: `${utilization.toFixed(2)}%`,
    bitsPerPixel: 3,
    technique: 'LSB (Least Significant Bit)',
  };
}
