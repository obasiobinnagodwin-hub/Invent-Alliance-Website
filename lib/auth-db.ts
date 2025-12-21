// Database-backed authentication system
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, queryOne, transaction } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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

// Login function with database lookup
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Validate JWT_SECRET is available
    if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
      console.error('JWT_SECRET is not properly configured');
      return { success: false, error: 'Authentication service configuration error' };
    }

    // Find user in database
    let user: User | null;
    try {
      user = await queryOne<User>(
        'SELECT id, username, password_hash, email, role, is_active FROM users WHERE username = $1',
        [username]
      );
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
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
    console.error('Login function error:', error);
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
    console.error('Token verification error:', error);
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
    console.error('Logout error:', error);
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

    const result = await query<{ id: string }>(
      `INSERT INTO users (username, password_hash, email, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [username, passwordHash, email || null, role]
    );

    if (result.length === 0) {
      return { success: false, error: 'Failed to create user' };
    }

    return { success: true, userId: result[0].id };
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Username already exists' };
    }
    console.error('Create user error:', error);
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
    console.error('Update password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await query('DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP');
  } catch (error) {
    console.error('Cleanup sessions error:', error);
  }
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // Every hour
}

