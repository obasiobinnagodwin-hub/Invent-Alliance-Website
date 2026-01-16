/**
 * Simple Authentication System (In-Memory Mode)
 * 
 * This module provides in-memory authentication when USE_DATABASE=false.
 * For production deployments, consider using a proper auth library (NextAuth.js, Auth0, etc.)
 * or enable database-backed authentication (USE_DATABASE=true).
 * 
 * Security Configuration:
 * - Production: ADMIN_USERNAME and ADMIN_PASSWORD MUST be set via environment variables.
 *   The application will fail to start if these are missing or if password is < 8 characters.
 * - Development: Falls back to defaults (admin/admin123) with a warning message.
 * 
 * Environment Variables:
 * - ADMIN_USERNAME: Admin username (required in production)
 * - ADMIN_PASSWORD: Admin password, minimum 8 characters (required in production)
 * - JWT_SECRET: Secret key for JWT token signing (required in production, minimum 32 characters)
 * 
 * Validation:
 * - The validate-env.js script (runs as prestart hook) validates these variables before startup.
 * - JWT_SECRET is validated via lib/jwt-config.ts (enforces minimum 32 characters in production).
 * - In production, missing or weak credentials/secrets will prevent application startup.
 */

import jwt from 'jsonwebtoken';
import { getJWTSecret } from './jwt-config';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const isProduction = process.env.NODE_ENV === 'production';

// Initialize JWT secret (will throw in production if not configured properly)
let JWT_SECRET: string;
try {
  JWT_SECRET = getJWTSecret();
} catch (error) {
  // In production, fail fast with clear error message
  if (isProduction) {
    console.error('❌ JWT configuration error:', error instanceof Error ? error.message : error);
    throw error;
  }
  // In development, use fallback but log the error
  console.error('⚠️  Error loading JWT secret, using fallback:', error);
  JWT_SECRET = 'dev-fallback-secret-not-for-production-use';
}

/**
 * Admin Credentials Configuration
 * 
 * Retrieves admin credentials from environment variables with appropriate fallbacks:
 * - Production: Requires ADMIN_USERNAME and ADMIN_PASSWORD to be set.
 *   Validates password length (minimum 8 characters) and throws error if invalid.
 * - Development: Falls back to defaults (admin/admin123) with a warning.
 * 
 * @returns {Object} Object containing username and password
 * @throws {Error} In production if credentials are missing or password is too short
 */
function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || (isProduction ? undefined : 'admin');
  const password = process.env.ADMIN_PASSWORD || (isProduction ? undefined : 'admin123');

  // Production: Fail fast if credentials are not set
  if (isProduction) {
    if (!username || !password) {
      throw new Error(
        'CRITICAL: ADMIN_USERNAME and ADMIN_PASSWORD must be set in production environment variables. ' +
        'The application cannot start without secure admin credentials.'
      );
    }

    // Production: Validate minimum password length (>= 8 characters)
    if (password.length < 8) {
      throw new Error(
        `CRITICAL: ADMIN_PASSWORD must be at least 8 characters long in production. ` +
        `Current length: ${password.length}. Please set a stronger password via ADMIN_PASSWORD environment variable.`
      );
    }
  } else {
    // Development: Warn if using defaults
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.warn(
        '⚠️  WARNING: Using default admin credentials (admin/admin123) in development mode. ' +
        'Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables for secure credentials. ' +
        'These defaults will NOT work in production.'
      );
    }
  }

  return { username: username!, password: password! };
}

// Initialize admin credentials (will throw in production if not configured)
let ADMIN_CREDENTIALS: { username: string; password: string };
try {
  ADMIN_CREDENTIALS = getAdminCredentials();
} catch (error) {
  // In production, fail fast with clear error message
  if (isProduction) {
    console.error('❌ Authentication configuration error:', error instanceof Error ? error.message : error);
    throw error;
  }
  // In development, use defaults but log the error
  console.error('⚠️  Error loading admin credentials, using defaults:', error);
  ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
}

export interface AuthUser {
  username: string;
  loginTime: number;
  role?: string; // Optional role for compatibility with database mode
}

/**
 * Login Function
 * 
 * Authenticates a user with username and password.
 * Compares credentials against ADMIN_CREDENTIALS (from environment variables or defaults).
 * 
 * Note: This function does not change the login route contract (/api/auth/login).
 * The API endpoint remains unchanged - only the credential validation logic is updated.
 * 
 * @param username - Username to authenticate
 * @param password - Password to authenticate
 * @returns Object with success status, optional JWT token, or error message
 */
export function login(username: string, password: string): { success: boolean; token?: string; error?: string } {
  try {
    // JWT_SECRET is already validated at module load time
    // Token signing/verifying behavior remains the same (backward compatible)
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign(
        { username, loginTime: Date.now() },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return { success: true, token };
    }
    
    return { success: false, error: 'Invalid username or password' };
  } catch (error) {
    console.error('Login function error:', error);
    return { success: false, error: 'Failed to process login request' };
  }
}

/**
 * Verify JWT Token
 * 
 * Validates and decodes a JWT token to extract user information.
 * 
 * @param token - JWT token to verify
 * @returns AuthUser object if token is valid, null otherwise
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

