import { NextResponse } from 'next/server';
import { FEATURE_DB_POOL_TUNING } from '@/lib/feature-flags';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Health Check Endpoint
 * 
 * Returns health status and database connectivity information.
 * No authentication required, but no sensitive environment variables are exposed.
 * 
 * GET /api/health
 */
export async function GET() {
  // Dynamic imports to prevent build-time analysis issues
  const { getPoolStats, testConnection } = await import('@/lib/db');
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    database?: {
      connected: boolean;
      pool?: {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
        max: number;
        idleTimeoutMillis: number;
      } | null;
    };
    features?: {
      dbPoolTuning: boolean;
    };
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      dbPoolTuning: FEATURE_DB_POOL_TUNING,
    },
  };

  // Check database connectivity (only if USE_DATABASE=true)
  const useDatabase = process.env.USE_DATABASE === 'true';
  
  if (useDatabase) {
    try {
      const connected = await testConnection();
      health.database = {
        connected,
      };

      // Get pool stats if feature is enabled
      if (FEATURE_DB_POOL_TUNING) {
        const poolStats = await getPoolStats();
        if (poolStats) {
          health.database.pool = poolStats;
        }
      }

      // Update status based on database connectivity
      if (!connected) {
        health.status = 'unhealthy';
      } else if (health.database.pool && health.database.pool.waitingCount > 5) {
        // Degraded if many queries are waiting
        health.status = 'degraded';
      }
    } catch (error) {
      health.database = {
        connected: false,
      };
      health.status = 'unhealthy';
    }
  }

  // Return appropriate HTTP status code
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

