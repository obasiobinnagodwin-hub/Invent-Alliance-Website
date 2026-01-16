/**
 * Centralized Rate Limiting Module
 * 
 * Provides in-memory rate limiting for API endpoints.
 * Mirrors the existing approach used in contact and academy registration routes.
 * 
 * Features:
 * - In-memory storage (Map-based)
 * - Automatic cleanup of expired entries
 * - Support for different rate limit configurations per endpoint
 * - IP-based rate limiting with proper header detection
 * 
 * Note: For production at scale, consider using Redis for distributed rate limiting.
 */

import { NextRequest } from 'next/server';

/**
 * Rate limit record stored in memory
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // Seconds until retry is allowed
}

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

/**
 * Get client IP address from request headers
 * 
 * Checks multiple headers in order of preference:
 * 1. x-forwarded-for (first IP in comma-separated list)
 * 2. x-real-ip
 * 3. cf-connecting-ip (Cloudflare)
 * 4. Falls back to 'unknown' if none found
 * 
 * @param request - Next.js request object
 * @returns Client IP address string
 */
export function getClientIP(request: NextRequest): string {
  // Check x-forwarded-for (most common proxy header)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take first IP if comma-separated (proxies chain)
    return forwarded.split(',')[0].trim();
  }

  // Check x-real-ip (nginx, some proxies)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Check cf-connecting-ip (Cloudflare)
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP.trim();
  }

  // Fallback (shouldn't happen in production behind proxy)
  return 'unknown';
}

/**
 * Rate Limiter Class
 * 
 * Manages rate limiting for a specific endpoint with its own store.
 */
class RateLimiter {
  private store: Map<string, RateLimitRecord>;
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.store = new Map();
    this.config = config;
    
    // Start cleanup timer (runs every 5 minutes)
    this.startCleanup();
  }

  /**
   * Check if request is allowed based on rate limit (without incrementing)
   * Used for checking before processing - doesn't count the attempt yet
   * 
   * @param ip - Client IP address
   * @returns RateLimitResult with allowed status and metadata
   */
  check(ip: string): RateLimitResult {
    const now = Date.now();
    const record = this.store.get(ip);

    // No record or expired window - allow (don't create record yet)
    if (!record || now > record.resetTime) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    // Check if limit exceeded
    if (record.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter,
      };
    }

    // Not exceeded - allow (but don't increment yet)
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Record a failed attempt (increment count without checking)
   * Used for login attempts - only failed attempts count toward limit
   * 
   * @param ip - Client IP address
   */
  recordFailure(ip: string): void {
    const now = Date.now();
    const record = this.store.get(ip);

    if (!record || now > record.resetTime) {
      // Create new record
      const resetTime = now + this.config.windowMs;
      this.store.set(ip, { count: 1, resetTime });
    } else {
      // Increment existing record
      record.count++;
    }
  }

  /**
   * Reset rate limit for an IP (useful for testing or manual intervention)
   * 
   * @param ip - Client IP address
   */
  reset(ip: string): void {
    this.store.delete(ip);
  }

  /**
   * Cleanup expired entries from store
   * Prevents unbounded memory growth
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [ip, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(ip);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Start automatic cleanup timer
   * Runs cleanup every 5 minutes
   */
  private startCleanup(): void {
    // Only run cleanup in Node.js environment (not in edge runtime)
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000); // Every 5 minutes
    }
  }

  /**
   * Stop cleanup timer (useful for testing)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get current store size (useful for monitoring)
   */
  getStoreSize(): number {
    return this.store.size;
  }
}

/**
 * Login rate limiter configuration
 * 5 attempts per 15 minutes per IP
 */
const LOGIN_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Login rate limiter instance
 * Only created when feature flag is enabled
 */
let loginRateLimiter: RateLimiter | null = null;

/**
 * Get or create login rate limiter instance
 * 
 * @returns RateLimiter instance or null if feature is disabled
 */
export function getLoginRateLimiter(): RateLimiter | null {
  // Lazy initialization - check feature flag
  if (loginRateLimiter === null) {
    // Import feature flag dynamically to avoid circular dependencies
    const { FEATURE_RATE_LIMIT_LOGIN } = require('./feature-flags');
    if (FEATURE_RATE_LIMIT_LOGIN) {
      loginRateLimiter = new RateLimiter(LOGIN_RATE_LIMIT_CONFIG);
    }
  }
  return loginRateLimiter;
}

/**
 * Check login rate limit
 * 
 * Convenience function that handles feature flag check and IP extraction
 * 
 * @param request - Next.js request object
 * @returns RateLimitResult or null if feature is disabled
 */
export function checkLoginRateLimit(request: NextRequest): RateLimitResult | null {
  const limiter = getLoginRateLimiter();
  if (!limiter) {
    return null; // Feature disabled - no rate limiting
  }

  const ip = getClientIP(request);
  return limiter.check(ip);
}

/**
 * Record failed login attempt
 * 
 * Only increments counter for failed attempts (not successful logins)
 * 
 * @param request - Next.js request object
 */
export function recordFailedLogin(request: NextRequest): void {
  const limiter = getLoginRateLimiter();
  if (!limiter) {
    return; // Feature disabled - no tracking
  }

  const ip = getClientIP(request);
  limiter.recordFailure(ip);
}

