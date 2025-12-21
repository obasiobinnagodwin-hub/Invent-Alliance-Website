// Simple authentication system
// In production, use a proper auth library (NextAuth.js, Auth0, etc.)

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Default admin credentials (change in production!)
// In production, store hashed passwords in database
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123', // Change this!
};

export interface AuthUser {
  username: string;
  loginTime: number;
}

export function login(username: string, password: string): { success: boolean; token?: string; error?: string } {
  try {
    // Validate JWT_SECRET is available
    if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
      console.error('JWT_SECRET is not properly configured');
      return { success: false, error: 'Authentication service configuration error' };
    }

    // In production, verify against database with bcrypt
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

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

