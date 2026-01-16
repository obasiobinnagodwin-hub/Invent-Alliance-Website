/**
 * In-Memory API Cache Module
 * 
 * Provides simple, production-safe in-memory caching for API responses.
 * Includes automatic cleanup of expired entries and cache bypass support.
 * 
 * Usage:
 *   import { cachedQuery } from '@/lib/cache';
 *   
 *   const result = await cachedQuery('my-key', 300, async () => {
 *     // Expensive operation
 *     return await fetchData();
 *   });
 */

import { FEATURE_API_CACHE } from './feature-flags';

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * Cache statistics for monitoring
 */
interface CacheStats {
  hits: number;
  misses: number;
  bypasses: number;
  entries: number;
  totalRequests: number;
  hitRate?: number;
}

/**
 * In-memory cache store
 * Key: string, Value: CacheEntry<T>
 */
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Cache statistics
 */
const cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  bypasses: 0,
  entries: 0,
  totalRequests: 0,
};

/**
 * Cleanup interval (5 minutes)
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Cleanup timer reference
 */
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Clean up expired cache entries
 */
function cleanupExpiredEntries(): void {
  if (!FEATURE_API_CACHE) {
    return;
  }

  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of cacheStore.entries()) {
    if (entry.expiresAt < now) {
      cacheStore.delete(key);
      cleaned++;
    }
  }

  cacheStats.entries = cacheStore.size;

  // Dev-only logging
  if (process.env.NODE_ENV === 'development' && cleaned > 0) {
    console.log(`[Cache] Cleaned ${cleaned} expired entries. Remaining: ${cacheStore.size}`);
  }
}

/**
 * Start cleanup timer if not already running
 */
function startCleanupTimer(): void {
  if (cleanupTimer !== null || !FEATURE_API_CACHE) {
    return;
  }

  cleanupTimer = setInterval(() => {
    cleanupExpiredEntries();
  }, CLEANUP_INTERVAL_MS);

  // Start cache stats logging in dev mode
  if (process.env.NODE_ENV === 'development') {
    startCacheStatsLogging();
  }

  // Cleanup on process exit
  if (typeof process !== 'undefined') {
    process.on('SIGTERM', () => {
      if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
      if (statsLogTimer) {
        clearInterval(statsLogTimer);
        statsLogTimer = null;
      }
    });
  }
}

/**
 * Check if cache should be bypassed based on request
 * 
 * @param request - NextRequest object
 * @returns true if cache should be bypassed
 */
export function shouldBypassCache(request: Request): boolean {
  if (!FEATURE_API_CACHE) {
    return true; // Bypass if feature is disabled
  }

  // Check Cache-Control header
  const cacheControl = request.headers.get('cache-control');
  if (cacheControl && cacheControl.toLowerCase().includes('no-cache')) {
    return true;
  }

  // Check noCache query parameter
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('noCache') === '1') {
      return true;
    }
  } catch {
    // Invalid URL, don't bypass (will fail elsewhere anyway)
  }

  return false;
}

/**
 * Generate cache key from query parameters
 * 
 * @param prefix - Key prefix (e.g., 'analytics')
 * @param params - Object with query parameters
 * @returns Cache key string
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  // Sort keys for consistent key generation
  const sortedKeys = Object.keys(params).sort();
  const keyParts = sortedKeys.map(key => {
    const value = params[key];
    return `${key}:${value === undefined || value === null ? 'null' : String(value)}`;
  });
  
  return `${prefix}:${keyParts.join('|')}`;
}

/**
 * Execute a query with caching
 * 
 * @param key - Cache key
 * @param ttlSeconds - Time to live in seconds
 * @param fn - Function to execute if cache miss
 * @returns Cached or fresh result
 */
export async function cachedQuery<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<{ value: T; cacheStatus: 'HIT' | 'MISS' }> {
  // If caching is disabled, always execute function
  if (!FEATURE_API_CACHE) {
    cacheStats.bypasses++;
    cacheStats.totalRequests++;
    const value = await fn();
    return { value, cacheStatus: 'MISS' };
  }

  // Start cleanup timer on first use
  startCleanupTimer();

  cacheStats.totalRequests++;

  // Check cache
  const entry = cacheStore.get(key);
  const now = Date.now();

  if (entry && entry.expiresAt >= now) {
    // Cache hit
    cacheStats.hits++;
    
    if (process.env.NODE_ENV === 'development') {
      const age = Math.round((now - entry.createdAt) / 1000);
      console.log(`[Cache] HIT: ${key} (age: ${age}s)`);
    }

    return { value: entry.value, cacheStatus: 'HIT' };
  }

  // Cache miss - execute function
  cacheStats.misses++;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cache] MISS: ${key}`);
  }

  const value = await fn();
  const expiresAt = now + (ttlSeconds * 1000);

  // Store in cache
  cacheStore.set(key, {
    value,
    expiresAt,
    createdAt: now,
  });

  cacheStats.entries = cacheStore.size;

  return { value, cacheStatus: 'MISS' };
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  cacheStore.clear();
  cacheStats.entries = 0;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Cache] Cache cleared');
  }
}

/**
 * Get cache statistics
 * 
 * @returns Cache statistics object
 */
export function getCacheStats(): CacheStats {
  const hitRate = cacheStats.totalRequests > 0
    ? (cacheStats.hits / cacheStats.totalRequests) * 100
    : 0;

  return {
    ...cacheStats,
    hitRate: Math.round(hitRate * 100) / 100,
  };
}

/**
 * Log cache statistics (dev-only)
 */
export function logCacheStats(): void {
  if (process.env.NODE_ENV !== 'development' || !FEATURE_API_CACHE) {
    return;
  }

  const stats = getCacheStats();
  console.log('[Cache Stats]', {
    hits: stats.hits,
    misses: stats.misses,
    bypasses: stats.bypasses,
    entries: stats.entries,
    totalRequests: stats.totalRequests,
    hitRate: `${stats.hitRate}%`,
  });
}

/**
 * Start periodic cache stats logging (dev-only)
 * Logs stats every 5 minutes when feature is enabled
 */
let statsLogTimer: NodeJS.Timeout | null = null;

export function startCacheStatsLogging(): void {
  if (process.env.NODE_ENV !== 'development' || !FEATURE_API_CACHE || statsLogTimer !== null) {
    return;
  }

  // Log stats every 5 minutes
  statsLogTimer = setInterval(() => {
    logCacheStats();
  }, CLEANUP_INTERVAL_MS);

  // Log initial stats
  logCacheStats();
}

// Export cache store size for monitoring (read-only)
export function getCacheSize(): number {
  return cacheStore.size;
}

