import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_API_CACHE, FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS } from '@/lib/feature-flags';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function requireAuth(request: NextRequest): Promise<boolean> {
  // Dynamic imports to prevent build-time analysis issues
  const { verifyToken, verifyTokenWithSession } = await import('@/lib/auth-wrapper');
  
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  
  const useDatabase = process.env.USE_DATABASE === 'true';
  const user = useDatabase 
    ? await verifyTokenWithSession(token)
    : verifyToken(token);
  return user !== null;
}

export async function GET(request: NextRequest) {
  // Dynamic imports to prevent build-time analysis issues
  const {
    getPageViews,
    getUniqueVisitors,
    getPageViewsByPath,
    getTrafficSources,
    getSessions,
    getSystemMetrics,
    getSystemStats,
    getTimeSeriesData,
  } = await import('@/lib/analytics-wrapper');
  const { cachedQuery, generateCacheKey, shouldBypassCache, logCacheStats } = await import('@/lib/cache');
  const { getPageViewsWithSessionData } = await import('@/lib/analytics-db-optimized');
  const { trackPerformanceMetric } = await import('@/lib/monitoring');
  
  const startTime = Date.now();
  
  // Check authentication
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Seed data if empty (for development/testing) - only for in-memory mode
  // Use dynamic import to prevent build-time analysis
  if (process.env.USE_DATABASE !== 'true' && !process.env.NEXT_PHASE) {
    try {
      const { seedAnalyticsData } = await import('@/lib/analytics-wrapper');
      seedAnalyticsData();
    } catch (error) {
      // Silently fail if seeding causes issues (e.g., during build)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to seed analytics data:', error);
      }
    }
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overview';
  const startDate = searchParams.get('startDate') ? parseInt(searchParams.get('startDate')!) : undefined;
  const endDate = searchParams.get('endDate') ? parseInt(searchParams.get('endDate')!) : undefined;
  const interval = searchParams.get('interval') as 'hour' | 'day' | 'week' | undefined;

  const filters = {
    startDate,
    endDate,
  };

  // Check if cache should be bypassed
  const bypassCache = shouldBypassCache(request);
  let cacheStatus: 'HIT' | 'MISS' | 'BYPASS' = bypassCache ? 'BYPASS' : 'MISS';

  // Helper function to create response with cache header
  const createResponse = (data: any, status: number = 200) => {
    const headers: Record<string, string> = {};
    
    // Add X-Cache header when feature is enabled
    if (FEATURE_API_CACHE) {
      headers['X-Cache'] = cacheStatus;
    }

    return NextResponse.json(data, { status, headers });
  };

  try {
    switch (type) {
      case 'overview': {
        // Cache overview for 300 seconds (5 minutes)
        const cacheKey = generateCacheKey('analytics:overview', { type, startDate, endDate });
        
        if (!bypassCache && FEATURE_API_CACHE) {
          const { value, cacheStatus: status } = await cachedQuery(
            cacheKey,
            300, // 5 minutes
            async () => {
              const pageViews = await getPageViews(filters);
              const uniqueVisitors = await getUniqueVisitors(filters);
              const sessions = await getSessions(filters);
              const systemStats = await getSystemStats(filters);
              
              return {
                pageViews: pageViews.length,
                uniqueVisitors,
                sessions: sessions.length,
                averagePageViewsPerSession: sessions.length > 0 
                  ? Math.round((pageViews.length / sessions.length) * 100) / 100 
                  : 0,
                systemStats,
              };
            }
          );
          cacheStatus = status;
          return createResponse(value);
        } else {
          // Bypass cache - fetch fresh data
          const pageViews = await getPageViews(filters);
          const uniqueVisitors = await getUniqueVisitors(filters);
          const sessions = await getSessions(filters);
          const systemStats = await getSystemStats(filters);
          
          return createResponse({
            pageViews: pageViews.length,
            uniqueVisitors,
            sessions: sessions.length,
            averagePageViewsPerSession: sessions.length > 0 
              ? Math.round((pageViews.length / sessions.length) * 100) / 100 
              : 0,
            systemStats,
          });
        }
      }

      case 'pageviews': {
        // Use optimized joined query when feature is enabled, otherwise use standard query
        if (FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS) {
          const pageViewsWithSession = await getPageViewsWithSessionData(filters, 100);
          // Map to standard PageView format (drop session fields for compatibility)
          const pageViews = pageViewsWithSession.map(pv => ({
            id: pv.id,
            sessionId: pv.sessionId,
            path: pv.path,
            timestamp: pv.timestamp,
            ip: pv.ip,
            userAgent: pv.userAgent,
            referrer: pv.referrer,
            timeOnPage: pv.timeOnPage,
          }));
          return createResponse({
            data: pageViews,
          });
        } else {
          const pageViews = await getPageViews(filters);
          return createResponse({
            data: pageViews.slice(0, 100), // Limit to 100 most recent
          });
        }
      }

      case 'pages': {
        // Cache pages for 600 seconds (10 minutes)
        const cacheKey = generateCacheKey('analytics:pages', { type, startDate, endDate });
        
        if (!bypassCache && FEATURE_API_CACHE) {
          const { value, cacheStatus: status } = await cachedQuery(
            cacheKey,
            600, // 10 minutes
            async () => {
              const data = await getPageViewsByPath(filters);
              return { data };
            }
          );
          cacheStatus = status;
          return createResponse(value);
        } else {
          // Bypass cache - fetch fresh data
          const data = await getPageViewsByPath(filters);
          return createResponse({ data });
        }
      }

      case 'sources': {
        const data = await getTrafficSources(filters);
        return createResponse({ data });
      }

      case 'sessions': {
        const sessions = await getSessions(filters);
        return createResponse({
          data: sessions.slice(0, 100), // Limit to 100 most recent
        });
      }

      case 'system': {
        const metrics = await getSystemMetrics(filters);
        return createResponse({
          data: metrics.slice(0, 100), // Limit to 100 most recent
        });
      }

      case 'system-stats': {
        const data = await getSystemStats(filters);
        return createResponse({ data });
      }

      case 'timeseries': {
        // Cache timeseries for 600 seconds (10 minutes)
        const cacheKey = generateCacheKey('analytics:timeseries', { type, startDate, endDate, interval });
        
        if (!bypassCache && FEATURE_API_CACHE) {
          const { value, cacheStatus: status } = await cachedQuery(
            cacheKey,
            600, // 10 minutes
            async () => {
              const data = await getTimeSeriesData({ ...filters, interval });
              return { data };
            }
          );
          cacheStatus = status;
          return createResponse(value);
        } else {
          // Bypass cache - fetch fresh data
          const data = await getTimeSeriesData({ ...filters, interval });
          return createResponse({ data });
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    trackPerformanceMetric('api_analytics_response_time', duration, 'ms', {
      type,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    
    console.error('Analytics API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching analytics';
    
    // Log cache stats on error (dev-only)
    if (process.env.NODE_ENV === 'development' && FEATURE_API_CACHE) {
      logCacheStats();
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  } finally {
    // Track successful response time
    const duration = Date.now() - startTime;
    trackPerformanceMetric('api_analytics_response_time', duration, 'ms', {
      type,
      success: true,
      cacheStatus,
    });
  }
}

