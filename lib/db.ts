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

    // Check for DATABASE_URL first (Railway, Heroku, etc. provide this)
    const databaseUrl = process.env.DATABASE_URL;
    
    let poolConfig: any;
    
    if (databaseUrl) {
      // Use DATABASE_URL connection string (Railway-compatible)
      // When using connectionString, pg library automatically parses SSL settings from the URL
      // Railway DATABASE_URL should already include SSL parameters
      // DO NOT set ssl separately when using connectionString - it causes conflicts
      try {
        // Validate URL format
        new URL(databaseUrl); // Just validate, don't modify
        
        poolConfig = {
          connectionString: databaseUrl,
          connectionTimeoutMillis: 10000, // Increased timeout for Railway
          // Note: Do NOT set ssl here - pg library parses it from connectionString
          // If Railway URL doesn't have SSL params, they should be added to DATABASE_URL itself
        };
      } catch (urlError) {
        // If DATABASE_URL is invalid, fall back to individual variables
        logger.error('Invalid DATABASE_URL format, falling back to individual variables', urlError instanceof Error ? urlError : new Error(String(urlError)));
        poolConfig = {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'ial_analytics',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          connectionTimeoutMillis: 10000, // Increased timeout
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        };
      }
    } else {
      // Use individual environment variables
      poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'ial_analytics',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        connectionTimeoutMillis: 10000, // Increased timeout for better reliability
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      };
    }

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

    // Handle pool errors with better diagnostics
    pool.on('error', (err) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      
      logger.error('Unexpected error on idle database client', err instanceof Error ? err : new Error(String(err)));
      
      // Log helpful diagnostics
      if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
        logger.error('Database connection refused. Check:');
        logger.error('  1. Database service is running in Railway');
        logger.error('  2. DATABASE_URL or DB_HOST/DB_PORT are correct');
        logger.error('  3. Network connectivity between services');
      } else if (errorMessage.includes('password') || errorMessage.includes('authentication')) {
        logger.error('Database authentication failed. Check:');
        logger.error('  1. DB_USER and DB_PASSWORD are correct');
        logger.error('  2. User has proper permissions');
      } else if (errorMessage.includes('timeout')) {
        logger.error('Database connection timeout. Check:');
        logger.error('  1. Database service is responsive');
        logger.error('  2. Network latency is acceptable');
        logger.error('  3. Connection pool is not exhausted');
      }
    });

    // Test connection on initialization (non-blocking, with better error handling)
    // Use setTimeout to avoid blocking initialization
    setTimeout(() => {
      pool.query('SELECT NOW()')
        .then(() => {
          if (logger && typeof logger.info === 'function') {
            logger.info('Database connection test successful');
          } else {
            console.log('[DB] Connection test successful');
          }
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          const errorName = err instanceof Error ? err.name : 'UnknownError';
          const isAggregateError = errorName === 'AggregateError';
          
          // Extract underlying error from AggregateError
          let underlyingError = errorMessage;
          if (isAggregateError && (err as any).errors && (err as any).errors.length > 0) {
            const firstError = (err as any).errors[0];
            underlyingError = firstError instanceof Error ? firstError.message : String(firstError);
          }
          
          if (logger && typeof logger.error === 'function') {
            logger.error('Database connection test failed', err instanceof Error ? err : new Error(String(err)));
          } else {
            console.error('[DB] Connection test failed:', errorMessage);
          }
          
          // Log diagnostic information
          const hasDatabaseUrl = !!process.env.DATABASE_URL;
          const hasIndividualVars = !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD);
          
          console.error('[DB] Configuration check:');
          console.error(`  - USE_DATABASE: ${process.env.USE_DATABASE}`);
          console.error(`  - DATABASE_URL: ${hasDatabaseUrl ? 'SET' : 'NOT SET'}`);
          console.error(`  - Individual vars: ${hasIndividualVars ? 'SET' : 'NOT SET'}`);
          
          if (hasDatabaseUrl) {
            const dbUrl = process.env.DATABASE_URL || '';
            // Log partial URL for debugging (hide password)
            const safeUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
            console.error(`  - DATABASE_URL preview: ${safeUrl.substring(0, 80)}...`);
          }
          
          // Provide specific guidance based on error type
          if (underlyingError.includes('connect') || underlyingError.includes('ECONNREFUSED') || isAggregateError) {
            console.error('[DB] Connection failed. Verify in Railway:');
            console.error('  1. USE_DATABASE=true is set in your Application Service Variables');
            console.error('  2. DATABASE_URL is copied from PostgreSQL service Variables');
            console.error('  3. Both services (app and database) are in the same Railway project');
            console.error('  4. Database service status is "Active"');
            if (!hasDatabaseUrl && !hasIndividualVars) {
              console.error('  5. ⚠️  No database configuration found! Set DATABASE_URL or individual DB_* variables.');
            }
          } else if (underlyingError.includes('password') || underlyingError.includes('authentication')) {
            console.error('[DB] Authentication failed. Verify DB_USER and DB_PASSWORD in Railway Variables.');
          } else if (underlyingError.includes('does not exist')) {
            console.error('[DB] Database does not exist. Check DB_NAME or run migrations.');
          } else if (underlyingError.includes('SSL') || underlyingError.includes('TLS')) {
            console.error('[DB] SSL connection failed. Railway PostgreSQL requires SSL.');
            console.error('  Try adding ?sslmode=require to DATABASE_URL or set DB_SSL=true');
          } else {
            console.error('[DB] Connection error:', underlyingError);
          }
        });
    }, 1000); // Delay to avoid blocking initialization
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
    
    // Handle AggregateError (multiple connection failures)
    if (error instanceof Error && error.name === 'AggregateError') {
      const aggregateError = error as any;
      const errors = aggregateError.errors || [];
      const firstError = errors[0] || error;
      const errorMessage = firstError instanceof Error ? firstError.message : String(firstError);
      
      logger.error('Database connection pool failed (AggregateError)', error);
      logger.error('Multiple connection attempts failed. Common causes:');
      logger.error('  1. DATABASE_URL is incorrect or missing');
      logger.error('  2. Database service is not running');
      logger.error('  3. SSL/TLS configuration issue');
      logger.error('  4. Network connectivity problem');
      logger.error('  5. Database credentials are incorrect');
      
      if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
        throw new Error(`Database connection failed: Cannot connect to database. Please check DATABASE_URL or DB_HOST/DB_PORT in Railway Variables. Error: ${errorMessage}`);
      }
      if (errorMessage.includes('password') || errorMessage.includes('authentication')) {
        throw new Error(`Database authentication failed: ${errorMessage}. Please check DB_USER and DB_PASSWORD in Railway Variables.`);
      }
      if (errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
        throw new Error(`Database SSL connection failed: ${errorMessage}. Railway PostgreSQL requires SSL. Ensure DATABASE_URL includes SSL parameters or set DB_SSL=true.`);
      }
      
      throw new Error(`Database connection pool error: ${errorMessage}. Please check your database configuration in Railway Variables.`);
    }
    
    // Provide helpful error messages for other errors
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        throw new Error(`Database connection failed: ${error.message}. Please check your database configuration in Railway Variables.`);
      }
      if (error.message.includes('password authentication')) {
        throw new Error(`Database authentication failed: ${error.message}. Please check DB_USER and DB_PASSWORD in Railway Variables.`);
      }
      if (error.message.includes('does not exist')) {
        throw new Error(`Database "${process.env.DB_NAME || 'ial_analytics'}" does not exist. Please run the schema migration.`);
      }
      if (error.message.includes('timeout')) {
        throw new Error(`Query timeout: ${error.message}`);
      }
      if (error.message.includes('SSL') || error.message.includes('TLS')) {
        throw new Error(`Database SSL connection failed: ${error.message}. Railway PostgreSQL requires SSL. Ensure DATABASE_URL includes SSL parameters or set DB_SSL=true.`);
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

