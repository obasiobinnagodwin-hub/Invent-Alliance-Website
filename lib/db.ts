// PostgreSQL database connection utility
import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from './secure-logger';
import { FEATURE_DB_POOL_TUNING } from './feature-flags';
import { trackPerformanceMetric } from './monitoring';

// Database connection pool
let pool: Pool | null = null;

// Slow query threshold (1000ms)
const SLOW_QUERY_THRESHOLD_MS = 1000;

// Statement timeout (30 seconds) - applied when FEATURE_DB_POOL_TUNING is enabled
const STATEMENT_TIMEOUT_MS = 30000;

/**
 * Initialize database connection pool with optional tuning
 */
export function getPool(): Pool {
  if (!pool) {
    const useDatabase = process.env.USE_DATABASE === 'true';
    
    if (!useDatabase) {
      throw new Error('Database is not enabled. Set USE_DATABASE=true to enable.');
    }

    // Pool configuration - use tuned settings when feature is enabled
    const poolConfig: any = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'ial_analytics',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      connectionTimeoutMillis: 5000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

    // Apply pool tuning when feature is enabled
    if (FEATURE_DB_POOL_TUNING) {
      poolConfig.max = 10; // Reduced from 20 to 10
      poolConfig.idleTimeoutMillis = 20000; // 20 seconds
    } else {
      // Default/fallback configuration
      poolConfig.max = 20;
      poolConfig.idleTimeoutMillis = 30000;
    }

    pool = new Pool(poolConfig);

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err instanceof Error ? err : new Error(String(err)));
    });

    // Test connection on initialization
    pool.query('SELECT NOW()').catch((err) => {
      logger.error('Database connection test failed', err instanceof Error ? err : new Error(String(err)));
      logger.error('Please check your database configuration in .env.local');
    });
  }

  return pool;
}

/**
 * Execute a query with timeout wrapper (when FEATURE_DB_POOL_TUNING is enabled)
 * Uses PostgreSQL statement_timeout for server-side timeout
 */
async function executeWithTimeout<T extends Record<string, any> = any>(
  client: PoolClient,
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  if (!FEATURE_DB_POOL_TUNING) {
    // No timeout when feature is disabled
    return await client.query<T>(text, params);
  }

  // Set statement timeout on the connection (PostgreSQL accepts milliseconds as integer)
  // Note: This is set per-connection, so it persists for the connection lifetime
  // We set it each time to ensure it's active, but it's idempotent
  try {
    // PostgreSQL statement_timeout accepts milliseconds as integer
    await client.query(`SET statement_timeout = '${STATEMENT_TIMEOUT_MS}'`);
  } catch (err) {
    // If setting timeout fails, continue without it (fallback to manual timeout)
    // This can happen if the database doesn't support statement_timeout or user lacks permission
    // The client-side timeout will still catch runaway queries
  }

  // Execute query - PostgreSQL will enforce the timeout server-side
  // We also add a client-side timeout as a safety net
  return Promise.race([
    client.query<T>(text, params),
    new Promise<QueryResult<T>>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query timeout after ${STATEMENT_TIMEOUT_MS}ms`));
      }, STATEMENT_TIMEOUT_MS + 1000); // Add 1s buffer for network overhead
    }),
  ]);
}

/**
 * Log slow query (only when FEATURE_DB_POOL_TUNING is enabled)
 */
function logSlowQuery(text: string, duration: number, rowCount: number): void {
  if (!FEATURE_DB_POOL_TUNING) {
    return;
  }

  // Truncate SQL to first 120 characters (never log full SQL with params)
  const sqlPreview = text.length > 120 ? text.substring(0, 120) + '...' : text;
  
  // Use secure logger if available, otherwise console
  const logMessage = {
    message: 'Slow query detected',
    duration: `${duration}ms`,
    rowCount,
    sqlPreview,
  };

  if (logger && typeof logger.warn === 'function') {
    logger.warn('Slow database query', logMessage);
  } else {
    console.warn('[DB] Slow query:', logMessage);
  }
}

// Execute a query with automatic connection management
export async function query<T extends Record<string, any> = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const startTime = FEATURE_DB_POOL_TUNING ? Date.now() : Date.now();
  
  try {
    const client = await getPool().connect();
    try {
      const result = await executeWithTimeout<T>(client, text, params);
      const duration = Date.now() - startTime;
      
      // Track performance metric (duration and row count)
      trackPerformanceMetric('db_query', duration, 'ms', {
        rowCount: result.rowCount,
        sqlPreview: text.length > 120 ? text.substring(0, 120) + '...' : text,
      });
      
      // Log slow queries (existing behavior)
      if (FEATURE_DB_POOL_TUNING && duration > SLOW_QUERY_THRESHOLD_MS) {
        logSlowQuery(text, duration, result.rowCount ?? 0);
      }
      
      return result.rows as T[];
    } finally {
      client.release();
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    // Track failed query performance
    trackPerformanceMetric('db_query', duration, 'ms', {
      error: error instanceof Error ? error.message : String(error),
      success: false,
      sqlPreview: text.length > 120 ? text.substring(0, 120) + '...' : text,
    });
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        throw new Error(`Database connection failed: ${error.message}. Please check your database configuration in .env.local`);
      }
      if (error.message.includes('password authentication')) {
        throw new Error(`Database authentication failed. Please check DB_USER and DB_PASSWORD in .env.local`);
      }
      if (error.message.includes('does not exist')) {
        throw new Error(`Database "${process.env.DB_NAME || 'ial_analytics'}" does not exist. Please run the schema migration.`);
      }
      if (error.message.includes('timeout')) {
        throw new Error(`Query timeout: ${error.message}`);
      }
    }
    throw error;
  }
}

// Execute a query and return a single row
export async function queryOne<T extends Record<string, any> = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

// Execute a transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  
  // Set statement timeout for transaction if feature is enabled
  if (FEATURE_DB_POOL_TUNING) {
    try {
      await client.query(`SET statement_timeout = '${STATEMENT_TIMEOUT_MS}'`);
    } catch (err) {
      // Ignore errors setting timeout, continue with transaction
    }
  }
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Close the connection pool (useful for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    logger.error('Database connection test failed', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Get pool statistics (when FEATURE_DB_POOL_TUNING is enabled)
 */
export async function getPoolStats(): Promise<{
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  max: number;
  idleTimeoutMillis: number;
} | null> {
  if (!FEATURE_DB_POOL_TUNING || !pool) {
    return null;
  }

  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    max: pool.options.max || 0,
    idleTimeoutMillis: pool.options.idleTimeoutMillis || 0,
  };
}

