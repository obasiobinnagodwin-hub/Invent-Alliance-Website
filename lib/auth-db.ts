// Database-backed authentication system
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, queryOne, transaction } from './db';
import { getJWTSecret } from './jwt-config';
import { logger } from './secure-logger';
import { encryptPII, decryptPII } from './data-protection';
import { FEATURE_PII_EMAIL_ENCRYPTION } from './feature-flags';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const isProduction = process.env.NODE_ENV === 'production';

// Initialize JWT secret (will throw in production if not configured properly)
let JWT_SECRET: string;
try {
  JWT_SECRET = getJWTSecret();
} catch (error) {
  // In production, fail fast with clear error message
  if (isProduction) {
    logger.error('JWT configuration error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
  // In development, use fallback but log the error
  logger.error('Error loading JWT secret, using fallback', error instanceof Error ? error : new Error(String(error)));
  JWT_SECRET = 'dev-fallback-secret-not-for-production-use';
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  loginTime: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Database query result type that includes password_hash
interface UserWithPassword extends User {
  password_hash: string;
}

// Login function with database lookup
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // JWT_SECRET is already validated at module load time
    // Token signing/verifying behavior remains the same (backward compatible)

    // Find user in database
    let user: (UserWithPassword & { email_encrypted?: string }) | null;
    try {
      user = await queryOne<UserWithPassword & { email_encrypted?: string }>(
        'SELECT id, username, password_hash, email, email_encrypted, role, is_active FROM users WHERE username = $1',
        [username]
      );
    } catch (dbError: any) {
      logger.error('Database query error', dbError instanceof Error ? dbError : new Error(String(dbError)));
      // If database connection fails, provide helpful error
      if (dbError.message?.includes('connect') || dbError.code === 'ECONNREFUSED') {
        return { 
          success: false, 
          error: 'Database connection failed. Please check your database configuration or set USE_DATABASE=false to use in-memory authentication.' 
        };
      }
      throw dbError;
    }

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (!user.is_active) {
      return { success: false, error: 'Account is disabled' };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last login time
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Decrypt email if encrypted and feature is enabled
    let email = user.email;
    if (FEATURE_PII_EMAIL_ENCRYPTION && user.email_encrypted) {
      const decryptedEmail = decryptPII(user.email_encrypted);
      if (decryptedEmail) {
        email = decryptedEmail;
      }
      // Fallback to plaintext email if decryption fails (backward compatibility)
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: email,
        role: user.role,
        loginTime: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store session in database
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    return { success: true, token };
  } catch (error) {
    logger.error('Login function error', error instanceof Error ? error : new Error(String(error)), { username }); // Never log password
    return { success: false, error: 'Failed to process login request' };
  }
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verify token and check database session
export async function verifyTokenWithSession(token: string): Promise<AuthUser | null> {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Check if session exists and is valid
    const tokenHash = await bcrypt.hash(token, 10);
    const session = await queryOne<{ expires_at: Date }>(
      `SELECT expires_at FROM user_sessions 
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [decoded.id]
    );

    if (!session) {
      return null;
    }

    return decoded;
  } catch (error) {
    logger.error('Token verification error', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

// Logout - invalidate session
export async function logout(token: string): Promise<void> {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return;
    }

    // Delete all sessions for this user (or just the current one)
    await query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [decoded.id]
    );
  } catch (error) {
    logger.error('Logout error', error instanceof Error ? error : new Error(String(error)));
  }
}

// Create a new user (admin function)
export async function createUser(
  username: string,
  password: string,
  email?: string,
  role: string = 'viewer'
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // Encrypt email if feature is enabled
    let emailEncrypted: string | null = null;
    if (FEATURE_PII_EMAIL_ENCRYPTION && email) {
      try {
        emailEncrypted = encryptPII(email);
      } catch (error) {
        logger.error('Failed to encrypt email during user creation', error instanceof Error ? error : new Error(String(error)));
        // Continue with plaintext email if encryption fails (backward compatibility)
      }
    }

    // Insert user with both email and email_encrypted (for transition period)
    const result = await query<{ id: string }>(
      `INSERT INTO users (username, password_hash, email, email_encrypted, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [username, passwordHash, email || null, emailEncrypted, role]
    );

    if (result.length === 0) {
      return { success: false, error: 'Failed to create user' };
    }

    return { success: true, userId: result[0].id };
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Username already exists' };
    }
    logger.error('Create user error', error instanceof Error ? error : new Error(String(error)), { username }); // Never log password
    return { success: false, error: 'Failed to create user' };
  }
}

// Update user password
export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    return { success: true };
  } catch (error) {
    logger.error('Update password error', error instanceof Error ? error : new Error(String(error)), { userId }); // Never log password
    return { success: false, error: 'Failed to update password' };
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await query('DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP');
  } catch (error) {
    logger.error('Cleanup sessions error', error instanceof Error ? error : new Error(String(error)));
  }
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // Every hour
}

