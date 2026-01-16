import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_MONITORING_METRICS } from '@/lib/feature-flags';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0; // Disable caching/revalidation
export const fetchCache = 'force-no-store'; // Disable fetch caching

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

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(rows: any[][], headers: string[]): string {
  const csvRows = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ];
  return csvRows.join('\n');
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Check authentication
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Note: Export routes should export existing data, not seed new data
  // Seeding should be done via /api/analytics/seed or the main analytics route
  // Removing seeding from export routes to prevent build-time analysis issues

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overview';
  const startDate = searchParams.get('startDate') ? parseInt(searchParams.get('startDate')!) : undefined;
  const endDate = searchParams.get('endDate') ? parseInt(searchParams.get('endDate')!) : undefined;

  const filters = { startDate, endDate };

  try {
    // Dynamic imports to prevent build-time analysis issues
    const {
      getPageViews,
      getPageViewsByPath,
      getTrafficSources,
      getSessions,
      getSystemMetrics,
      getSystemStats,
      getTimeSeriesData,
    } = await import('@/lib/analytics-wrapper');
    
    console.log('CSV Export - Type:', type, 'Filters:', filters);
    
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'overview': {
        const pageViews = await getPageViews(filters);
        const uniqueVisitors = new Set(pageViews.map(pv => pv.sessionId)).size;
        const sessions = await getSessions(filters);
        const systemStats = await getSystemStats(filters);
        
        console.log('CSV Export - Overview data:', {
          pageViewsCount: pageViews.length,
          uniqueVisitors,
          sessionsCount: sessions.length,
          systemStats,
        });
        
        csvContent = generateCSV(
          [
            ['Total Page Views', pageViews.length],
            ['Unique Visitors', uniqueVisitors],
            ['Total Sessions', sessions.length],
            ['Avg Page Views per Session', sessions.length > 0 ? (pageViews.length / sessions.length).toFixed(2) : 0],
            ['Total API Requests', systemStats.totalRequests],
            ['Average Response Time (ms)', systemStats.averageResponseTime],
            ['Error Rate (%)', systemStats.errorRate],
          ],
          ['Metric', 'Value']
        );
        filename = 'analytics-overview';
        break;
      }

      case 'pages': {
        const pages = await getPageViewsByPath(filters);
        csvContent = generateCSV(
          pages.map(p => [p.path, p.count]),
          ['Path', 'Page Views']
        );
        filename = 'analytics-pages';
        break;
      }

      case 'sources': {
        const sources = await getTrafficSources(filters);
        csvContent = generateCSV(
          sources.map(s => [s.source, s.count]),
          ['Traffic Source', 'Visits']
        );
        filename = 'analytics-sources';
        break;
      }

      case 'pageviews': {
        const pageViews = await getPageViews(filters);
        csvContent = generateCSV(
          pageViews.map(pv => [
            new Date(pv.timestamp).toISOString(),
            pv.path,
            pv.sessionId,
            pv.ip,
            pv.referrer || 'Direct',
            pv.userAgent,
          ]),
          ['Timestamp', 'Path', 'Session ID', 'IP Address', 'Referrer', 'User Agent']
        );
        filename = 'analytics-pageviews';
        break;
      }

      case 'sessions': {
        const sessions = await getSessions(filters);
        csvContent = generateCSV(
          sessions.map(s => [
            new Date(s.startTime).toISOString(),
            new Date(s.lastActivity).toISOString(),
            s.pageViews,
            s.ip,
            s.referrer || 'Direct',
            s.userAgent,
          ]),
          ['Start Time', 'Last Activity', 'Page Views', 'IP Address', 'Referrer', 'User Agent']
        );
        filename = 'analytics-sessions';
        break;
      }

      case 'system': {
        const metrics = await getSystemMetrics(filters);
        csvContent = generateCSV(
          metrics.map(m => [
            new Date(m.timestamp).toISOString(),
            m.path,
            m.method,
            m.statusCode,
            m.responseTime,
            m.error || '',
          ]),
          ['Timestamp', 'Path', 'Method', 'Status Code', 'Response Time (ms)', 'Error']
        );
        filename = 'analytics-system';
        break;
      }

      case 'timeseries': {
        const interval = searchParams.get('interval') as 'hour' | 'day' | 'week' | undefined;
        const timeseries = await getTimeSeriesData({ ...filters, interval: interval || 'day' });
        csvContent = generateCSV(
          timeseries.map(t => [t.date, t.count]),
          ['Date', 'Page Views']
        );
        filename = 'analytics-timeseries';
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    const duration = Date.now() - startTime;
    // Performance tracking (optional, non-blocking)
    if (FEATURE_MONITORING_METRICS) {
      try {
        const { trackPerformanceMetric } = await import('@/lib/monitoring');
        trackPerformanceMetric('export_csv_duration', duration, 'ms', {
          type,
          success: true,
          contentLength: csvContent.length,
        });
      } catch (error) {
        // Silently fail - monitoring should not break exports
        console.warn('Failed to track performance metric:', error);
      }
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fullFilename}"`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    // Performance tracking (optional, non-blocking)
    if (FEATURE_MONITORING_METRICS) {
      try {
        const { trackPerformanceMetric } = await import('@/lib/monitoring');
        trackPerformanceMetric('export_csv_duration', duration, 'ms', {
          type,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      } catch (trackError) {
        // Silently fail - monitoring should not break error handling
        console.warn('Failed to track performance metric:', trackError);
      }
    }
    
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating CSV' },
      { status: 500 }
    );
  }
}

