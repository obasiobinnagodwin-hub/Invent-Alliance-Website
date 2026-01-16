import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Database Diagnostic Endpoint
 * 
 * Provides detailed database configuration diagnostics without exposing sensitive data.
 * Useful for troubleshooting connection issues in Railway.
 * 
 * GET /api/health/db-diagnostic
 */
export async function GET() {
  const useDatabase = process.env.USE_DATABASE === 'true';
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasIndividualVars = !!(
    process.env.DB_HOST && 
    process.env.DB_USER && 
    process.env.DB_PASSWORD
  );

  // Create safe preview of DATABASE_URL (hide password)
  let databaseUrlPreview = 'NOT SET';
  if (hasDatabaseUrl && process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    // Replace password with ****
    databaseUrlPreview = url.replace(/:[^:@]+@/, ':****@');
    // Truncate if too long
    if (databaseUrlPreview.length > 100) {
      databaseUrlPreview = databaseUrlPreview.substring(0, 100) + '...';
    }
  }

  const diagnostic = {
    timestamp: new Date().toISOString(),
    configuration: {
      useDatabase,
      hasDatabaseUrl,
      hasIndividualVars,
      databaseUrlPreview,
      dbHost: process.env.DB_HOST ? 'SET' : 'NOT SET',
      dbPort: process.env.DB_PORT || 'NOT SET',
      dbName: process.env.DB_NAME || 'NOT SET',
      dbUser: process.env.DB_USER ? 'SET' : 'NOT SET',
      dbPassword: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
      dbSsl: process.env.DB_SSL || 'NOT SET',
    },
    recommendations: [] as string[],
  };

  // Generate recommendations
  if (!useDatabase) {
    diagnostic.recommendations.push('Set USE_DATABASE=true in Railway Variables to enable database');
  } else {
    if (!hasDatabaseUrl && !hasIndividualVars) {
      diagnostic.recommendations.push('⚠️ No database configuration found!');
      diagnostic.recommendations.push('  Option 1: Set DATABASE_URL (recommended for Railway)');
      diagnostic.recommendations.push('  Option 2: Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    } else if (hasDatabaseUrl) {
      // Check if URL looks valid
      try {
        const url = new URL(process.env.DATABASE_URL || '');
        const isRailway = url.hostname.includes('railway') || 
                         url.hostname.includes('up.railway.app') || 
                         url.hostname.includes('proxy.rlwy.net');
        
        if (isRailway) {
          diagnostic.recommendations.push('✓ Railway DATABASE_URL detected');
          if (!process.env.DATABASE_URL?.includes('sslmode') && !process.env.DATABASE_URL?.includes('ssl=')) {
            diagnostic.recommendations.push('⚠️ Consider adding ?sslmode=require to DATABASE_URL if SSL errors occur');
          }
        }
      } catch {
        diagnostic.recommendations.push('⚠️ DATABASE_URL format may be invalid');
      }
    } else if (hasIndividualVars) {
      diagnostic.recommendations.push('✓ Individual database variables detected');
      if (process.env.DB_SSL !== 'true') {
        diagnostic.recommendations.push('⚠️ Set DB_SSL=true for Railway PostgreSQL');
      }
    }
  }

  // Test connection if configured
  if (useDatabase && (hasDatabaseUrl || hasIndividualVars)) {
    try {
      const { testConnection } = await import('@/lib/db');
      const connected = await testConnection();
      diagnostic.configuration = {
        ...diagnostic.configuration,
        connectionTest: connected ? 'SUCCESS' : 'FAILED',
      };
      
      if (!connected) {
        diagnostic.recommendations.push('❌ Database connection test failed');
        diagnostic.recommendations.push('  Check Railway logs for detailed error messages');
        diagnostic.recommendations.push('  Verify database service is running and active');
        diagnostic.recommendations.push('  Ensure both services are in the same Railway project');
      } else {
        diagnostic.recommendations.push('✓ Database connection test successful');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      diagnostic.configuration = {
        ...diagnostic.configuration,
        connectionTest: `ERROR: ${errorMessage.substring(0, 100)}`,
      };
      diagnostic.recommendations.push(`❌ Connection test error: ${errorMessage.substring(0, 100)}`);
    }
  } else {
    diagnostic.configuration = {
      ...diagnostic.configuration,
      connectionTest: 'SKIPPED (database not configured)',
    };
  }

  return NextResponse.json(diagnostic, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

