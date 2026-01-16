#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 * 
 * Validates critical environment variables before application startup.
 * This script runs as a prestart hook to ensure production deployments
 * fail fast if required secrets are missing.
 * 
 * Usage: node scripts/validate-env.js
 * 
 * Exit codes:
 * - 0: All validations passed
 * - 1: Validation failed (prevents startup)
 */

const isProduction = process.env.NODE_ENV === 'production';
const errors = [];
const warnings = [];

console.log('🔍 Validating environment variables...\n');

// Validate JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
  if (isProduction) {
    errors.push('JWT_SECRET must be set to a secure random value in production');
  } else {
    warnings.push('JWT_SECRET is using default value (not secure for production)');
  }
} else if (process.env.JWT_SECRET.length < 32) {
  if (isProduction) {
    errors.push('JWT_SECRET must be at least 32 characters long in production');
  } else {
    warnings.push('JWT_SECRET is shorter than 32 characters (recommended minimum)');
  }
}

// Validate ADMIN_USERNAME (required in production)
if (!process.env.ADMIN_USERNAME) {
  if (isProduction) {
    errors.push('ADMIN_USERNAME must be set in production environment');
  } else {
    warnings.push('ADMIN_USERNAME not set, using default "admin" (not secure for production)');
  }
} else if (process.env.ADMIN_USERNAME === 'admin' && isProduction) {
  warnings.push('ADMIN_USERNAME is set to default "admin" (consider using a different username)');
}

// Validate ADMIN_PASSWORD (required in production)
if (!process.env.ADMIN_PASSWORD) {
  if (isProduction) {
    errors.push('ADMIN_PASSWORD must be set in production environment');
  } else {
    warnings.push('ADMIN_PASSWORD not set, using default "admin123" (not secure for production)');
  }
} else {
  // Validate password strength in production
  const password = process.env.ADMIN_PASSWORD;
  if (isProduction) {
    if (password.length < 8) {
      errors.push(`ADMIN_PASSWORD must be at least 8 characters long (current: ${password.length})`);
    }
    if (password === 'admin123') {
      errors.push('ADMIN_PASSWORD cannot be the default "admin123" in production');
    }
    if (password.length < 12) {
      warnings.push('ADMIN_PASSWORD is shorter than 12 characters (recommended minimum for production)');
    }
  } else {
    if (password === 'admin123') {
      warnings.push('ADMIN_PASSWORD is set to default "admin123" (not secure for production)');
    }
    if (password.length < 8) {
      warnings.push('ADMIN_PASSWORD is shorter than 8 characters (minimum recommended)');
    }
  }
}

// Display warnings (non-blocking)
if (warnings.length > 0) {
  console.warn('⚠️  Warnings:');
  warnings.forEach(warning => console.warn(`   - ${warning}`));
  console.log('');
}

// Display errors (blocking in production)
if (errors.length > 0) {
  console.error('❌ Validation Errors:');
  errors.forEach(error => console.error(`   - ${error}`));
  console.error('');
  
  if (isProduction) {
    console.error('🚫 Production startup blocked due to missing or invalid environment variables.');
    console.error('   Please set the required environment variables before starting the application.');
    console.error('   See .env.example or documentation for required variables.\n');
    process.exit(1);
  } else {
    console.error('⚠️  These errors will block startup in production mode.');
    console.error('   Fix these issues before deploying to production.\n');
  }
}

// Success message
if (errors.length === 0) {
  if (isProduction) {
    console.log('✅ All required environment variables are properly configured for production.\n');
  } else {
    console.log('✅ Environment validation passed (development mode).\n');
    if (warnings.length > 0) {
      console.log('💡 Note: Some warnings were issued. Review them before deploying to production.\n');
    }
  }
  process.exit(0);
} else {
  // In development, allow startup but warn
  if (!isProduction) {
    console.log('⚠️  Starting in development mode despite validation errors.');
    console.log('   These errors MUST be fixed before deploying to production.\n');
    process.exit(0);
  }
  // Production already exited with code 1 above
}

