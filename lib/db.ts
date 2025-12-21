// PostgreSQL database connection utility
import { Pool, PoolClient } from 'pg';

// Database connection pool
let pool: Pool | null = null;

// Initialize database connection pool
export function getPool(): Pool {
  if (!pool) {
    const useDatabase = process.env.USE_DATABASE === 'true';
    
    if (!useDatabase) {
      throw new Error('Database is not enabled. Set USE_DATABASE=true to enable.');
    }

    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'ial_analytics',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Increased timeout
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Test connection on initialization
    pool.query('SELECT NOW()').catch((err) => {
      console.error('Database connection test failed:', err.message);
      console.error('Please check your database configuration in .env.local');
    });
  }

  return pool;
}

// Execute a query with automatic connection management
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    const client = await getPool().connect();
    try {
      const result = await client.query(text, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  } catch (error) {
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
    }
    throw error;
  }
}

// Execute a query and return a single row
export async function queryOne<T = any>(
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
    console.error('Database connection test failed:', error);
    return false;
  }
}

