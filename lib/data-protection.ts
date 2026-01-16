/**
 * Data Protection Module
 * 
 * Provides GDPR-friendly data protection utilities:
 * - IP pseudonymization (masking/truncation)
 * - PII hashing for analytics (SHA-256 with salt)
 * - Email encryption at rest (AES-256-GCM)
 * 
 * All features are gated by feature flags to allow gradual rollout.
 */

import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// ============================================================================
// IP Pseudonymization (Prompt 2.1)
// ============================================================================

/**
 * Pseudonymize an IP address for GDPR compliance
 * 
 * - IPv4: Masks the last octet (e.g., 192.168.1.100 -> 192.168.1.0)
 * - IPv6: Truncates to first 64 bits (e.g., 2001:0db8::1 -> 2001:0db8::)
 * - Unknown/invalid: Returns 'unknown'
 * 
 * @param ip - IP address to pseudonymize
 * @returns Pseudonymized IP address
 */
export function pseudonymizeIP(ip: string): string {
  if (!ip || ip === 'unknown') {
    return 'unknown';
  }

  // IPv4: mask last octet
  const ipv4Regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/;
  const ipv4Match = ip.match(ipv4Regex);
  if (ipv4Match) {
    return `${ipv4Match[1]}.0`;
  }

  // IPv6: truncate to first 64 bits (first 4 groups)
  // Handle compressed IPv6 (::) and full format
  if (ip.includes(':')) {
    // Remove any IPv4-mapped suffix (::ffff:192.168.1.1)
    if (ip.includes('.')) {
      const lastColon = ip.lastIndexOf(':');
      const ipv4Part = ip.substring(lastColon + 1);
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipv4Part)) {
        // This is IPv4-mapped IPv6, pseudonymize the IPv4 part
        const ipv4Pseudonymized = pseudonymizeIP(ipv4Part);
        return ip.substring(0, lastColon + 1) + ipv4Pseudonymized;
      }
    }

    // Split IPv6 into groups
    const parts = ip.split(':');
    if (parts.length >= 4) {
      // Return first 4 groups (64 bits) + '::'
      return parts.slice(0, 4).join(':') + '::';
    }
    // If already compressed or malformed, return as-is but truncated
    return parts.slice(0, 4).join(':') + '::';
  }

  // Unknown format
  return 'unknown';
}

/**
 * Hash data for analytics using SHA-256 with salt
 * 
 * Uses a salt from environment variable ANALYTICS_HASH_SALT (or default).
 * Truncates to 64 characters (32 bytes hex) for storage efficiency.
 * 
 * @param data - Data to hash (typically IP address or other PII)
 * @returns Truncated SHA-256 hash (64 hex characters)
 */
export function hashForAnalytics(data: string): string {
  if (!data || data === 'unknown') {
    return '';
  }

  // Get salt from environment (default to a fixed salt for consistency)
  // In production, this should be set via environment variable
  const salt = process.env.ANALYTICS_HASH_SALT || 'default-analytics-salt-change-in-production';

  // Create SHA-256 hash with salt
  const hash = createHmac('sha256', salt)
    .update(data)
    .digest('hex');

  // Return full hash (64 hex characters = 32 bytes)
  return hash;
}

// ============================================================================
// Email Encryption (Prompt 2.2)
// ============================================================================

/**
 * Encryption key validation and retrieval
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.DATA_ENCRYPTION_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!keyHex) {
    if (isProduction) {
      throw new Error(
        'CRITICAL: DATA_ENCRYPTION_KEY must be set in production when email encryption is enabled. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    } else {
      // Development fallback (NOT SECURE)
      console.warn(
        '⚠️  WARNING: DATA_ENCRYPTION_KEY is not set in development. ' +
        'Using fallback key (NOT SECURE FOR PRODUCTION).'
      );
      // Use a fixed dev key (32 bytes = 64 hex chars)
      return Buffer.from('0'.repeat(64), 'hex');
    }
  }

  // Validate key length (64 hex chars = 32 bytes for AES-256)
  if (keyHex.length !== 64) {
    throw new Error(
      `DATA_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ` +
      `Current length: ${keyHex.length}. ` +
      `Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }

  // Validate hex format
  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error('DATA_ENCRYPTION_KEY must be a valid hex string (64 characters).');
  }

  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt PII data using AES-256-GCM
 * 
 * Uses authenticated encryption (GCM mode) for security.
 * Returns base64-encoded ciphertext with IV and auth tag.
 * 
 * @param plaintext - Plaintext data to encrypt
 * @returns Base64-encoded encrypted data (format: iv:tag:ciphertext)
 */
export function encryptPII(plaintext: string): string {
  if (!plaintext) {
    return '';
  }

  const key = getEncryptionKey();
  const iv = randomBytes(12); // 12 bytes IV for GCM (96 bits)

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt PII data using AES-256-GCM
 * 
 * @param encryptedData - Base64-encoded encrypted data (format: iv:tag:ciphertext)
 * @returns Decrypted plaintext data
 */
export function decryptPII(encryptedData: string): string {
  if (!encryptedData) {
    return '';
  }

  try {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format. Expected iv:tag:ciphertext');
    }

    const [ivBase64, authTagBase64, ciphertext] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // If decryption fails, return empty string (don't throw to avoid breaking existing flows)
    // Use console.error here to avoid circular dependency with secure-logger
    // (secure-logger may import data-protection for redaction)
    console.error('Decryption error:', error instanceof Error ? error.message : error);
    return '';
  }
}

