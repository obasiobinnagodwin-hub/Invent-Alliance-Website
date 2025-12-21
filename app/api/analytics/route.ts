import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyTokenWithSession } from '@/lib/auth-wrapper';
import {
  getPageViews,
  getUniqueVisitors,
  getPageViewsByPath,
  getTrafficSources,
  getSessions,
  getSystemMetrics,
  getSystemStats,
  getTimeSeriesData,
  seedAnalyticsData,
} from '@/lib/analytics-wrapper';

async function requireAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  
  const useDatabase = process.env.USE_DATABASE === 'true';
  const user = useDatabase 
    ? await verifyTokenWithSession(token)
    : verifyToken(token);
  return user !== null;
}

export async function GET(request: NextRequest) {
  // Check authentication
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Seed data if empty (for development/testing) - only for in-memory mode
  if (process.env.USE_DATABASE !== 'true') {
    seedAnalyticsData();
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

  try {
    switch (type) {
      case 'overview': {
        const pageViews = await getPageViews(filters);
        const uniqueVisitors = await getUniqueVisitors(filters);
        const sessions = await getSessions(filters);
        const systemStats = await getSystemStats(filters);
        
        return NextResponse.json({
          pageViews: pageViews.length,
          uniqueVisitors,
          sessions: sessions.length,
          averagePageViewsPerSession: sessions.length > 0 
            ? Math.round((pageViews.length / sessions.length) * 100) / 100 
            : 0,
          systemStats,
        });
      }

      case 'pageviews': {
        const pageViews = await getPageViews(filters);
        return NextResponse.json({
          data: pageViews.slice(0, 100), // Limit to 100 most recent
        });
      }

      case 'pages': {
        const data = await getPageViewsByPath(filters);
        return NextResponse.json({ data });
      }

      case 'sources': {
        const data = await getTrafficSources(filters);
        return NextResponse.json({ data });
      }

      case 'sessions': {
        const sessions = await getSessions(filters);
        return NextResponse.json({
          data: sessions.slice(0, 100), // Limit to 100 most recent
        });
      }

      case 'system': {
        const metrics = await getSystemMetrics(filters);
        return NextResponse.json({
          data: metrics.slice(0, 100), // Limit to 100 most recent
        });
      }

      case 'system-stats': {
        const data = await getSystemStats(filters);
        return NextResponse.json({ data });
      }

      case 'timeseries': {
        const data = await getTimeSeriesData({ ...filters, interval });
        return NextResponse.json({ data });
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching analytics';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

