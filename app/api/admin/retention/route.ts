import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_RETENTION_ENDPOINT } from '@/lib/feature-flags';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Verify admin authentication
 */
async function requireAdminAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return false;
  }

  // Dynamic imports to prevent build-time analysis issues
  const { verifyToken, verifyTokenWithSession } = await import('@/lib/auth-wrapper');
  
  const useDatabase = process.env.USE_DATABASE === 'true';
  const user = useDatabase 
    ? await verifyTokenWithSession(token)
    : verifyToken(token);

  // Check if user exists and has admin role
  return user !== null && (user.role === 'admin' || user.role === 'editor');
}

export async function POST(request: NextRequest) {
  // Check if feature is enabled
  if (!FEATURE_RETENTION_ENDPOINT) {
    return NextResponse.json(
      { error: 'Retention endpoint is not available' },
      { status: 404 }
    );
  }

  // Check authentication
  const isAuthenticated = await requireAdminAuth(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    // Dynamic imports to prevent build-time analysis issues
    const { logger } = await import('@/lib/secure-logger');
    const { enforceRetention, getRetentionPeriods } = await import('@/lib/data-retention');
    
    logger.info('Manual retention run triggered by admin');

    // Run retention policies
    const result = await enforceRetention();
    
    // Get current retention periods (may be 14 or 30 days based on feature flag)
    const retentionPeriods = getRetentionPeriods();

    return NextResponse.json({
      success: true,
      message: 'Retention policies executed successfully',
      result: {
        pageViewsDeleted: result.pageViewsDeleted,
        visitorSessionsDeleted: result.visitorSessionsDeleted,
        systemMetricsDeleted: result.systemMetricsDeleted,
        errors: result.errors,
        retentionPeriods: {
          pageViews: retentionPeriods.pageViews, // days (14 or 30 based on FEATURE_ANALYTICS_RETENTION_14D)
          visitorSessions: retentionPeriods.visitorSessions, // days (14 or 30 based on FEATURE_ANALYTICS_RETENTION_14D)
          systemMetrics: retentionPeriods.systemMetrics, // days (always 90)
        },
      },
    });
  } catch (error) {
    // Dynamic import for error logging
    try {
      const { logger } = await import('@/lib/secure-logger');
      logger.error('Retention endpoint error', error instanceof Error ? error : new Error(String(error)));
    } catch (logError) {
      // Fallback to console if logger import fails
      console.error('Retention endpoint error:', error);
    }
    return NextResponse.json(
      { error: 'An error occurred while running retention policies' },
      { status: 500 }
    );
  }
}

// Return 404 for other methods if feature is disabled
export async function GET() {
  if (!FEATURE_RETENTION_ENDPOINT) {
    return NextResponse.json(
      { error: 'Retention endpoint is not available' },
      { status: 404 }
    );
  }
  return NextResponse.json({ 
    message: 'Retention endpoint',
    method: 'POST',
    description: 'POST to this endpoint to manually trigger retention policies',
  });
}

