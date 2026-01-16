/**
 * CSRF Protection Module
 * 
 * Implements CSRF (Cross-Site Request Forgery) protection using the double-submit cookie pattern.
 * 
 * How it works:
 * 1. Server sets a csrf-token cookie (HttpOnly, Secure, SameSite=Strict)
 * 2. Client reads the cookie value and sends it in X-CSRF-Token header
 * 3. Server validates that header token matches cookie token
 * 
 * Security:
 * - Cookie is HttpOnly=true (not accessible via JavaScript for security)
 * - Cookie is Secure in production (HTTPS only)
 * - Cookie is SameSite=Strict (prevents cross-site requests)
 * 
 * Note: Since the cookie is HttpOnly, clients must fetch the token via /api/csrf-token
 * endpoint and then send it in the X-CSRF-Token header.
 */

import { NextRequest } from 'next/server';

/**
 * Generate a random CSRF token
 * 
 * Uses Web Crypto API for Edge Runtime compatibility.
 * 
 * @returns Random token string (32 bytes hex = 64 characters)
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser/Edge Runtime
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js runtime fallback
    const nodeCrypto = require('crypto');
    return nodeCrypto.randomBytes(32).toString('hex');
  }
}

/**
 * Get CSRF token from request cookie
 * 
 * @param request - Next.js request object
 * @returns CSRF token from cookie or null if not present
 */
function getCSRFTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get('csrf-token')?.value || null;
}

/**
 * Get CSRF token from request header
 * 
 * @param request - Next.js request object
 * @returns CSRF token from header or null if not present
 */
function getCSRFTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get('x-csrf-token') || null;
}

/**
 * Validate CSRF token
 * 
 * Compares the token from X-CSRF-Token header with the token from csrf-token cookie.
 * Both must be present and match exactly.
 * 
 * @param request - Next.js request object
 * @returns true if token is valid, false otherwise
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = getCSRFTokenFromCookie(request);
  const headerToken = getCSRFTokenFromHeader(request);

  // Both must be present
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Must match exactly (constant-time comparison to prevent timing attacks)
  if (cookieToken.length !== headerToken.length) {
    return false;
  }
  
  // Constant-time comparison
  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Check if CSRF protection should be enforced
 * 
 * @returns true if FEATURE_CSRF flag is enabled
 */
export function isCSRFEnabled(): boolean {
  // Dynamic import to avoid circular dependencies
  try {
    const { FEATURE_CSRF } = require('./feature-flags');
    return FEATURE_CSRF === true;
  } catch {
    return false;
  }
}

