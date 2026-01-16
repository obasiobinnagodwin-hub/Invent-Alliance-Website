/**
 * JWT Secret Configuration Module
 * 
 * Centralized JWT secret management with security enforcement:
 * - Production: Requires JWT_SECRET to be set (minimum 32 characters)
 *   Throws error on startup if missing or weak.
 * - Development: Allows fallback secret with warning (does not throw)
 * 
 * Security Requirements:
 * - Minimum length: 32 characters (256 bits of entropy)
 * - Must not be the default placeholder value
 * - Should be cryptographically random (use Node crypto module)
 * 
 * Usage:
 *   import { getJWTSecret } from '@/lib/jwt-config';
 *   const secret = getJWTSecret();
 * 
 * Generating a secure secret:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *   # Or for base64:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_PLACEHOLDER = 'your-secret-key-change-in-production';
const MIN_SECRET_LENGTH = 32;

/**
 * Development fallback secret (only used if JWT_SECRET is not set in development)
 * This is a weak secret and should never be used in production.
 */
const DEV_FALLBACK_SECRET = 'dev-fallback-secret-not-for-production-use';

/**
 * Get JWT Secret from environment variables
 * 
 * Validates and returns the JWT_SECRET with appropriate security checks:
 * - Production: Throws error if missing, weak, or placeholder
 * - Development: Returns fallback with warning if not set
 * 
 * @returns {string} JWT secret string
 * @throws {Error} In production if secret is missing, too short, or placeholder
 * 
 * @example
 * // Production - must be set
 * process.env.JWT_SECRET = 'your-64-character-hex-secret-from-crypto-randomBytes';
 * const secret = getJWTSecret(); // Returns the secret
 * 
 * // Development - can use fallback
 * // process.env.JWT_SECRET not set
 * const secret = getJWTSecret(); // Returns fallback, logs warning
 */
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;

  // Production: Fail fast if secret is missing
  if (isProduction) {
    if (!secret) {
      throw new Error(
        'CRITICAL: JWT_SECRET must be set in production environment variables. ' +
        'The application cannot start without a secure JWT secret.\n\n' +
        'To generate a secure secret, run:\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n\n' +
        'Then set it in your environment:\n' +
        '  export JWT_SECRET=<generated-secret>\n' +
        '  # Or in .env.local: JWT_SECRET=<generated-secret>'
      );
    }

    // Production: Reject placeholder value
    if (secret === DEFAULT_PLACEHOLDER) {
      throw new Error(
        'CRITICAL: JWT_SECRET cannot be the default placeholder value in production. ' +
        'This is a security risk.\n\n' +
        'To generate a secure secret, run:\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n\n' +
        'Then update your environment:\n' +
        '  export JWT_SECRET=<generated-secret>'
      );
    }

    // Production: Validate minimum length (32 characters = 256 bits)
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `CRITICAL: JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long in production. ` +
        `Current length: ${secret.length}.\n\n` +
        'To generate a secure secret, run:\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n\n' +
        'Then update your environment:\n' +
        '  export JWT_SECRET=<generated-secret>'
      );
    }

    // Production: All checks passed
    return secret;
  }

  // Development: Allow fallback with warning
  if (!secret || secret === DEFAULT_PLACEHOLDER) {
    console.warn(
      '⚠️  WARNING: JWT_SECRET is not set or using placeholder value in development mode.\n' +
      '   Using fallback secret (NOT SECURE FOR PRODUCTION).\n' +
      '   Set JWT_SECRET environment variable for secure development.\n\n' +
      '   To generate a secure secret, run:\n' +
      '     node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n'
    );
    return DEV_FALLBACK_SECRET;
  }

  // Development: Warn if secret is too short (but allow it)
  if (secret.length < MIN_SECRET_LENGTH) {
    console.warn(
      `⚠️  WARNING: JWT_SECRET is shorter than ${MIN_SECRET_LENGTH} characters (current: ${secret.length}).\n` +
      '   This is acceptable for development but will be rejected in production.\n' +
      '   Consider generating a stronger secret:\n' +
      '     node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n'
    );
  }

  // Development: Return the provided secret (even if weak)
  return secret;
}

/**
 * Validate JWT Secret (for use in validation scripts)
 * 
 * Checks if the current JWT_SECRET meets security requirements.
 * Does not throw errors - returns validation result instead.
 * 
 * @returns {Object} Validation result with isValid flag and messages
 */
export function validateJWTSecret(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const secret = process.env.JWT_SECRET;

  if (isProduction) {
    if (!secret) {
      errors.push('JWT_SECRET must be set in production');
    } else if (secret === DEFAULT_PLACEHOLDER) {
      errors.push('JWT_SECRET cannot be the default placeholder value in production');
    } else if (secret.length < MIN_SECRET_LENGTH) {
      errors.push(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long (current: ${secret.length})`);
    }
  } else {
    if (!secret || secret === DEFAULT_PLACEHOLDER) {
      warnings.push('JWT_SECRET is not set or using placeholder (using fallback in development)');
    } else if (secret.length < MIN_SECRET_LENGTH) {
      warnings.push(`JWT_SECRET is shorter than ${MIN_SECRET_LENGTH} characters (will be rejected in production)`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

