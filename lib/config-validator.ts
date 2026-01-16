/**
 * Configuration Validator Module
 * 
 * Centralized environment variable validation for production startup.
 * Ensures critical configuration is present and valid before serving traffic.
 * 
 * This module should be called at server startup, not in Edge Runtime.
 */

import { FEATURE_PII_EMAIL_ENCRYPTION } from './feature-flags';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all configuration
 * 
 * @param isProduction - Whether running in production mode
 * @returns Validation result with errors and warnings
 */
export function validateConfig(isProduction: boolean = process.env.NODE_ENV === 'production'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate JWT_SECRET (always required)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
    if (isProduction) {
      errors.push('JWT_SECRET must be set to a secure random value (min 32 characters)');
    } else {
      warnings.push('JWT_SECRET is using default value (not secure for production)');
    }
  } else if (jwtSecret.length < 32) {
    if (isProduction) {
      errors.push(`JWT_SECRET must be at least 32 characters long (current: ${jwtSecret.length})`);
    } else {
      warnings.push(`JWT_SECRET is shorter than 32 characters (recommended minimum)`);
    }
  }

  // Validate ADMIN_USERNAME (required in production)
  const adminUsername = process.env.ADMIN_USERNAME;
  if (!adminUsername) {
    if (isProduction) {
      errors.push('ADMIN_USERNAME must be set in production environment');
    } else {
      warnings.push('ADMIN_USERNAME not set, using default "admin" (not secure for production)');
    }
  } else if (adminUsername === 'admin' && isProduction) {
    warnings.push('ADMIN_USERNAME is set to default "admin" (consider using a different username)');
  }

  // Validate ADMIN_PASSWORD (required in production, min 12 chars)
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    if (isProduction) {
      errors.push('ADMIN_PASSWORD must be set in production environment');
    } else {
      warnings.push('ADMIN_PASSWORD not set, using default (not secure for production)');
    }
  } else {
    if (isProduction) {
      if (adminPassword.length < 12) {
        errors.push(`ADMIN_PASSWORD must be at least 12 characters long (current: ${adminPassword.length})`);
      }
      if (adminPassword === 'admin123') {
        errors.push('ADMIN_PASSWORD cannot be the default "admin123" in production');
      }
    } else {
      if (adminPassword.length < 8) {
        warnings.push('ADMIN_PASSWORD is shorter than 8 characters (minimum recommended)');
      }
      if (adminPassword === 'admin123') {
        warnings.push('ADMIN_PASSWORD is set to default "admin123" (not secure for production)');
      }
    }
  }

  // Validate DATA_ENCRYPTION_KEY (only if email encryption feature is enabled)
  if (FEATURE_PII_EMAIL_ENCRYPTION) {
    const encryptionKey = process.env.DATA_ENCRYPTION_KEY;
    if (!encryptionKey) {
      if (isProduction) {
        errors.push('DATA_ENCRYPTION_KEY must be set when FEATURE_PII_EMAIL_ENCRYPTION is enabled');
      } else {
        warnings.push('DATA_ENCRYPTION_KEY not set (email encryption feature enabled but key missing)');
      }
    } else {
      if (encryptionKey.length !== 64) {
        if (isProduction) {
          errors.push(`DATA_ENCRYPTION_KEY must be exactly 64 hex characters (current: ${encryptionKey.length})`);
        } else {
          warnings.push(`DATA_ENCRYPTION_KEY is not 64 hex characters (current: ${encryptionKey.length})`);
        }
      }
      if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
        if (isProduction) {
          errors.push('DATA_ENCRYPTION_KEY must be a valid hex string (64 characters)');
        } else {
          warnings.push('DATA_ENCRYPTION_KEY format may be invalid (should be 64 hex characters)');
        }
      }
    }
  }

  // Validate database configuration (only if USE_DATABASE=true)
  const useDatabase = process.env.USE_DATABASE === 'true';
  if (useDatabase) {
    const dbHost = process.env.DB_HOST;
    const dbName = process.env.DB_NAME;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;

    if (!dbHost || !dbName || !dbUser || !dbPassword) {
      if (isProduction) {
        errors.push('Database configuration incomplete: DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD must be set when USE_DATABASE=true');
      } else {
        warnings.push('Database configuration incomplete (some variables missing)');
      }
    }
  }

  // Surface warnings for SMTP config (don't crash unless feature strictly needs it)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    warnings.push('SMTP configuration incomplete (SMTP_HOST, SMTP_USER, SMTP_PASS). Contact forms and academy registration emails will not be sent.');
  } else {
    // Validate SMTP port if provided
    const smtpPort = process.env.SMTP_PORT;
    if (smtpPort && (isNaN(parseInt(smtpPort)) || parseInt(smtpPort) < 1 || parseInt(smtpPort) > 65535)) {
      warnings.push(`SMTP_PORT is invalid (must be 1-65535, current: ${smtpPort})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and log results
 * 
 * @param isProduction - Whether running in production mode
 * @throws Error in production if validation fails
 */
export function validateAndLog(isProduction: boolean = process.env.NODE_ENV === 'production'): void {
  const result = validateConfig(isProduction);

  // Log warnings (non-blocking)
  if (result.warnings.length > 0) {
    console.warn('⚠️  Configuration Warnings:');
    result.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Log errors and throw in production
  if (result.errors.length > 0) {
    console.error('❌ Configuration Errors:');
    result.errors.forEach(error => console.error(`   - ${error}`));
    
    if (isProduction) {
      console.error('\n🚫 Production startup blocked due to configuration errors.');
      console.error('   Please fix the configuration errors before starting the application.\n');
      throw new Error('Configuration validation failed. See errors above.');
    } else {
      console.error('\n⚠️  These errors will block startup in production mode.');
      console.error('   Fix these issues before deploying to production.\n');
    }
  }

  // Success message
  if (result.isValid) {
    if (isProduction) {
      console.log('✅ Configuration validation passed (production mode).\n');
    } else if (result.warnings.length === 0) {
      console.log('✅ Configuration validation passed (development mode).\n');
    }
  }
}

