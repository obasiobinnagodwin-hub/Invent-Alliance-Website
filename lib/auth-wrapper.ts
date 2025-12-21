// Authentication wrapper - switches between in-memory and database based on environment
// Set USE_DATABASE=true to use database-backed authentication

import * as authMemory from './auth';
import * as authDb from './auth-db';

const USE_DATABASE = process.env.USE_DATABASE === 'true';

// Re-export interfaces
export type AuthUser = authMemory.AuthUser;

// Wrapper functions that switch between implementations
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (USE_DATABASE) {
    try {
      return await authDb.login(username, password);
    } catch (error: any) {
      console.error('Database login error:', error);
      // If database connection fails, provide helpful error message
      if (error?.message?.includes('connect') || error?.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'Database connection failed. Please check your database configuration or set USE_DATABASE=false in .env.local to use in-memory authentication.'
        };
      }
      throw error;
    }
  } else {
    return Promise.resolve(authMemory.login(username, password));
  }
}

export function verifyToken(token: string): AuthUser | null {
  if (USE_DATABASE) {
    return authDb.verifyToken(token);
  } else {
    return authMemory.verifyToken(token);
  }
}

// Database-specific function (only available when USE_DATABASE=true)
export async function verifyTokenWithSession(token: string): Promise<AuthUser | null> {
  if (USE_DATABASE) {
    return await authDb.verifyTokenWithSession(token);
  } else {
    // Fallback to regular verifyToken for in-memory mode
    return Promise.resolve(authMemory.verifyToken(token));
  }
}

export async function logout(token: string): Promise<void> {
  if (USE_DATABASE) {
    return await authDb.logout(token);
  } else {
    // In-memory mode doesn't need explicit logout
    return Promise.resolve();
  }
}

// Database-specific functions (only work when USE_DATABASE=true)
export async function createUser(
  username: string,
  password: string,
  email?: string,
  role: string = 'viewer'
): Promise<{ success: boolean; userId?: string; error?: string }> {
  if (USE_DATABASE) {
    return await authDb.createUser(username, password, email, role);
  } else {
    return Promise.resolve({ success: false, error: 'User creation only available in database mode' });
  }
}

export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (USE_DATABASE) {
    return await authDb.updatePassword(userId, oldPassword, newPassword);
  } else {
    return Promise.resolve({ success: false, error: 'Password update only available in database mode' });
  }
}
