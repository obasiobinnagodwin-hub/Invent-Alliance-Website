/**
 * Performance Monitoring Module
 * 
 * Provides lightweight performance metrics tracking without external dependencies.
 * Logs performance metrics and optional cost estimates for operations.
 * 
 * Features:
 * - Track performance metrics (duration, row count, etc.)
 * - Track cost estimates (optional)
 * - Use secure logger if available; fallback to console
 * - Optional external endpoint POST (only when MONITORING_ENDPOINT env is set)
 * - Feature flag gating (FEATURE_MONITORING_METRICS)
 * 
 * Usage:
 *   import { trackPerformanceMetric, trackCostMetric } from '@/lib/monitoring';
 *   trackPerformanceMetric('db_query', 150, 'ms');
 *   trackCostMetric('database', 'query', 0.001);
 */

/**
 * Check if monitoring feature is enabled
 */
function isMonitoringEnabled(): boolean {
  try {
    // Dynamic import to avoid circular dependencies
    const { FEATURE_MONITORING_METRICS } = require('./feature-flags');
    return FEATURE_MONITORING_METRICS === true;
  } catch {
    return false;
  }
}

/**
 * Get logger instance (secure logger if available, otherwise console)
 */
function getLogger() {
  try {
    const { logger } = require('./secure-logger');
    return logger;
  } catch {
    // Fallback to console if secure logger is not available
    return {
      info: (message: string, data?: any) => {
        if (data) {
          console.log(`[MONITORING] ${message}`, data);
        } else {
          console.log(`[MONITORING] ${message}`);
        }
      },
    };
  }
}

/**
 * Send metrics to external endpoint if configured
 */
async function sendToEndpoint(metric: any): Promise<void> {
  const endpoint = process.env.MONITORING_ENDPOINT;
  if (!endpoint) {
    return; // No endpoint configured, skip external sending
  }

  try {
    // Use fetch with keepalive for non-blocking requests
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
      keepalive: true, // Non-blocking, survives page unload
    });
  } catch (error) {
    // Silently fail - don't break application if monitoring endpoint is down
    // Log locally but don't throw
    const logger = getLogger();
    logger.info('Failed to send metric to external endpoint', {
      error: error instanceof Error ? error.message : String(error),
      endpoint,
    });
  }
}

/**
 * Track a performance metric
 * 
 * @param name - Metric name (e.g., 'db_query', 'api_response_time')
 * @param value - Metric value (e.g., duration in ms, row count)
 * @param unit - Unit of measurement (e.g., 'ms', 'bytes', 'count')
 * @param metadata - Optional additional metadata
 */
export function trackPerformanceMetric(
  name: string,
  value: number,
  unit: string,
  metadata?: Record<string, any>
): void {
  if (!isMonitoringEnabled()) {
    return; // Feature disabled, skip tracking
  }

  const timestamp = Date.now();
  const metric = {
    type: 'performance_metric',
    name,
    value,
    unit,
    timestamp,
    metadata: metadata || {},
  };

  // Log locally
  const logger = getLogger();
  logger.info('performance_metric', metric);

  // Send to external endpoint if configured (non-blocking)
  sendToEndpoint(metric).catch(() => {
    // Silently handle errors - monitoring should never break the app
  });
}

/**
 * Track a cost metric (optional)
 * 
 * @param service - Service name (e.g., 'database', 'storage', 'api')
 * @param operation - Operation name (e.g., 'query', 'write', 'read')
 * @param estimatedCost - Estimated cost in currency units (e.g., 0.001 for $0.001)
 * @param currency - Currency code (default: 'USD')
 * @param metadata - Optional additional metadata
 */
export function trackCostMetric(
  service: string,
  operation: string,
  estimatedCost: number,
  currency: string = 'USD',
  metadata?: Record<string, any>
): void {
  if (!isMonitoringEnabled()) {
    return; // Feature disabled, skip tracking
  }

  const timestamp = Date.now();
  const metric = {
    type: 'cost_metric',
    service,
    operation,
    estimatedCost,
    currency,
    timestamp,
    metadata: metadata || {},
  };

  // Log locally
  const logger = getLogger();
  logger.info('cost_metric', metric);

  // Send to external endpoint if configured (non-blocking)
  sendToEndpoint(metric).catch(() => {
    // Silently handle errors - monitoring should never break the app
  });
}

/**
 * Helper to measure async function execution time
 * 
 * @param name - Metric name
 * @param fn - Async function to measure
 * @param unit - Unit of measurement (default: 'ms')
 * @returns Result of the function
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  unit: string = 'ms',
  metadata?: Record<string, any>
): Promise<T> {
  if (!isMonitoringEnabled()) {
    return await fn(); // Feature disabled, just execute without measuring
  }

  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    trackPerformanceMetric(name, duration, unit, metadata);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackPerformanceMetric(name, duration, unit, {
      ...metadata,
      error: error instanceof Error ? error.message : String(error),
      success: false,
    });
    throw error;
  }
}

/**
 * Helper to measure sync function execution time
 * 
 * @param name - Metric name
 * @param fn - Sync function to measure
 * @param unit - Unit of measurement (default: 'ms')
 * @returns Result of the function
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  unit: string = 'ms',
  metadata?: Record<string, any>
): T {
  if (!isMonitoringEnabled()) {
    return fn(); // Feature disabled, just execute without measuring
  }

  const startTime = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - startTime;
    trackPerformanceMetric(name, duration, unit, metadata);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackPerformanceMetric(name, duration, unit, {
      ...metadata,
      error: error instanceof Error ? error.message : String(error),
      success: false,
    });
    throw error;
  }
}

