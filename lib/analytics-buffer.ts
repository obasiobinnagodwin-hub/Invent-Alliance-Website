/**
 * Analytics Event Buffer
 * 
 * Buffers analytics events (page views) in memory and flushes them in batches
 * to reduce database write amplification.
 * 
 * Features:
 * - In-memory queue with configurable size threshold
 * - Automatic flush on interval (5-10 seconds)
 * - Manual flush support
 * - Graceful shutdown flush on SIGTERM
 * 
 * This module is gated behind FEATURE_ANALYTICS_BATCH_WRITE.
 */

import { FEATURE_ANALYTICS_BATCH_WRITE } from './feature-flags';
import { logger } from './secure-logger';
import type { PageView } from './analytics-db';

interface BufferedPageView extends Omit<PageView, 'id' | 'timestamp'> {
  timestamp?: number; // Optional, will be set on flush
}

/**
 * Buffer configuration
 */
const BUFFER_CONFIG = {
  MAX_SIZE: 50, // Flush when queue reaches this size
  FLUSH_INTERVAL_MS: 8000, // Flush every 8 seconds
};

/**
 * In-memory event buffer
 */
const eventBuffer: BufferedPageView[] = [];

/**
 * Flush timer reference
 */
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Flush in progress flag (prevents concurrent flushes)
 */
let flushing = false;

/**
 * Initialize buffer flush timer
 */
function startFlushTimer(): void {
  if (flushTimer !== null || !FEATURE_ANALYTICS_BATCH_WRITE) {
    return;
  }

  flushTimer = setInterval(() => {
    flush().catch((error) => {
      logger.error('Automatic buffer flush error', error instanceof Error ? error : new Error(String(error)));
    });
  }, BUFFER_CONFIG.FLUSH_INTERVAL_MS);

  // Setup graceful shutdown
  if (typeof process !== 'undefined') {
    const shutdown = async () => {
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      // Best-effort flush on shutdown
      try {
        await flush();
        logger.info('Buffer flushed on shutdown');
      } catch (error) {
        logger.error('Shutdown flush error', error instanceof Error ? error : new Error(String(error)));
      }
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

/**
 * Add page view to buffer
 * 
 * @param pageView - Page view data to buffer
 */
export function bufferPageView(pageView: BufferedPageView): void {
  if (!FEATURE_ANALYTICS_BATCH_WRITE) {
    // If feature is disabled, don't buffer (should use immediate write)
    return;
  }

  // Start timer on first event
  if (eventBuffer.length === 0) {
    startFlushTimer();
  }

  eventBuffer.push(pageView);

  // Flush if buffer reaches max size
  if (eventBuffer.length >= BUFFER_CONFIG.MAX_SIZE) {
    flush().catch((error) => {
      logger.error('Size-triggered buffer flush error', error instanceof Error ? error : new Error(String(error)));
    });
  }
}

/**
 * Flush buffered events to database
 * 
 * @returns Number of events flushed
 */
export async function flush(): Promise<number> {
  if (!FEATURE_ANALYTICS_BATCH_WRITE || flushing || eventBuffer.length === 0) {
    return 0;
  }

  flushing = true;

  // Copy and clear buffer atomically (declare outside try for catch block access)
  const eventsToFlush = [...eventBuffer];
  eventBuffer.length = 0;

  try {

    if (eventsToFlush.length === 0) {
      flushing = false;
      return 0;
    }

    const useDatabase = process.env.USE_DATABASE === 'true';

    if (useDatabase) {
      // Use batch insert for database mode
      const { trackPageViewsBatch } = await import('./analytics-db-optimized');
      const inserted = await trackPageViewsBatch(eventsToFlush);
      
      logger.info(`Flushed ${inserted} page view(s) to database`, {
        batchSize: eventsToFlush.length,
        inserted,
      });

      flushing = false;
      return inserted;
    } else {
      // In-memory mode: add to in-memory store
      const { trackPageView } = await import('./analytics');
      
      for (const event of eventsToFlush) {
        try {
          trackPageView(event);
        } catch (error) {
          logger.error('In-memory track error', error instanceof Error ? error : new Error(String(error)));
        }
      }

      logger.info(`Flushed ${eventsToFlush.length} page view(s) to in-memory store`, {
        batchSize: eventsToFlush.length,
      });

      flushing = false;
      return eventsToFlush.length;
    }
  } catch (error) {
    // On error, put events back in buffer (best-effort recovery)
    eventBuffer.unshift(...eventsToFlush);
    logger.error('Buffer flush error', error instanceof Error ? error : new Error(String(error)));
    flushing = false;
    throw error;
  }
}

/**
 * Get current buffer size
 */
export function getBufferSize(): number {
  return eventBuffer.length;
}

/**
 * Clear buffer (for testing/cleanup)
 */
export function clearBuffer(): void {
  eventBuffer.length = 0;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

