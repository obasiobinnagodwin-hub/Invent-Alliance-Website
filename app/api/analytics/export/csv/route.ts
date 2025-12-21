import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyTokenWithSession } from '@/lib/auth-wrapper';
import {
  getPageViews,
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
  // Check authentication
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Seed data if empty (for development/testing) - only for in-memory mode
  // This ensures export routes have data to export
  if (process.env.USE_DATABASE !== 'true') {
    await seedAnalyticsData();
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overview';
  const startDate = searchParams.get('startDate') ? parseInt(searchParams.get('startDate')!) : undefined;
  const endDate = searchParams.get('endDate') ? parseInt(searchParams.get('endDate')!) : undefined;

  const filters = { startDate, endDate };

  try {
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

    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fullFilename}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating CSV' },
      { status: 500 }
    );
  }
}

