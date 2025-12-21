// Database-backed analytics system
import { query, queryOne, transaction } from './db';

export interface PageView {
  id: string;
  sessionId: string;
  path: string;
  timestamp: number;
  ip: string;
  userAgent: string;
  referrer: string;
  timeOnPage?: number;
}

export interface Session {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  ip: string;
  userAgent: string;
  referrer: string;
}

export interface SystemMetric {
  id?: string;
  timestamp: number;
  responseTime: number;
  statusCode: number;
  path: string;
  method: string;
  error?: string;
}

// Configuration
const METRIC_RETENTION_DAYS = 30; // Keep metrics for 30 days

// Track a page view
export async function trackPageView(
  data: Omit<PageView, 'id' | 'timestamp'>
): Promise<PageView> {
  try {
    return await transaction(async (client) => {
      // Ensure session exists
      const session = await client.query(
        `SELECT id FROM visitor_sessions WHERE id = $1`,
        [data.sessionId]
      );

      if (session.rows.length === 0) {
        // Create session if it doesn't exist
        await client.query(
          `INSERT INTO visitor_sessions 
           (id, start_time, last_activity, page_views_count, ip_address, user_agent, referrer)
           VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, $2, $3, $4)
           ON CONFLICT (id) DO NOTHING`,
          [data.sessionId, data.ip, data.userAgent, data.referrer || null]
        );
      }

      // Insert page view
      const result = await client.query(
        `INSERT INTO page_views 
         (session_id, path, timestamp, ip_address, user_agent, referrer, time_on_page)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6)
         RETURNING id, session_id, path, EXTRACT(EPOCH FROM timestamp) * 1000 as timestamp, 
                   ip_address, user_agent, referrer, time_on_page`,
        [
          data.sessionId,
          data.path,
          data.ip,
          data.userAgent,
          data.referrer || null,
          data.timeOnPage || null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        sessionId: row.session_id,
        path: row.path,
        timestamp: parseInt(row.timestamp),
        ip: row.ip_address,
        userAgent: row.user_agent,
        referrer: row.referrer || '',
        timeOnPage: row.time_on_page,
      };
    });
  } catch (error) {
    console.error('Track page view error:', error);
    // Return a minimal page view object to prevent crashes
    return {
      id: `error-${Date.now()}`,
      sessionId: data.sessionId,
      path: data.path,
      timestamp: Date.now(),
      ip: data.ip,
      userAgent: data.userAgent,
      referrer: data.referrer,
      timeOnPage: data.timeOnPage,
    };
  }
}

// Track a system metric
export async function trackSystemMetric(
  data: Omit<SystemMetric, 'id' | 'timestamp'>
): Promise<SystemMetric> {
  try {
    const result = await query<{
      id: string;
      timestamp: string;
      response_time: number;
      status_code: number;
      path: string;
      method: string;
      error_message: string | null;
    }>(
      `INSERT INTO system_metrics 
       (timestamp, response_time, status_code, path, method, error_message)
       VALUES (CURRENT_TIMESTAMP, $1, $2, $3, $4, $5)
       RETURNING id, EXTRACT(EPOCH FROM timestamp) * 1000 as timestamp, 
                 response_time, status_code, path, method, error_message`,
      [
        data.responseTime,
        data.statusCode,
        data.path,
        data.method,
        data.error || null,
      ]
    );

    const row = result[0];
    return {
      id: row.id,
      timestamp: parseInt(row.timestamp),
      responseTime: row.response_time,
      statusCode: row.status_code,
      path: row.path,
      method: row.method,
      error: row.error_message || undefined,
    };
  } catch (error) {
    console.error('Track system metric error:', error);
    throw error;
  }
}

// Get page views with filters
export async function getPageViews(filters?: {
  startDate?: number;
  endDate?: number;
  path?: string;
}): Promise<PageView[]> {
  try {
    let sql = `SELECT id, session_id, path, 
                      EXTRACT(EPOCH FROM timestamp) * 1000 as timestamp,
                      ip_address, user_agent, referrer, time_on_page
               FROM page_views WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.path) {
      sql += ` AND path = $${paramIndex}`;
      params.push(filters.path);
      paramIndex++;
    }

    sql += ` ORDER BY timestamp DESC LIMIT 10000`;

    const rows = await query(sql, params);
    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      path: row.path,
      timestamp: parseInt(row.timestamp),
      ip: row.ip_address,
      userAgent: row.user_agent,
      referrer: row.referrer || '',
      timeOnPage: row.time_on_page,
    }));
  } catch (error) {
    console.error('Get page views error:', error);
    // If it's a connection error, provide helpful message
    if (error instanceof Error && error.message.includes('connect')) {
      console.error('Database connection failed. Please check your database configuration.');
    }
    return [];
  }
}

// Get unique visitors count
export async function getUniqueVisitors(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<number> {
  try {
    let sql = `SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    const result = await queryOne<{ count: string }>(sql, params);
    return result ? parseInt(result.count) : 0;
  } catch (error) {
    console.error('Get unique visitors error:', error);
    return 0;
  }
}

// Get page views grouped by path
export async function getPageViewsByPath(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<Array<{ path: string; count: number }>> {
  try {
    let sql = `SELECT path, COUNT(*) as count 
               FROM page_views WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    sql += ` GROUP BY path ORDER BY count DESC`;

    const rows = await query<{ path: string; count: string }>(sql, params);
    return rows.map((row) => ({
      path: row.path,
      count: parseInt(row.count),
    }));
  } catch (error) {
    console.error('Get page views by path error:', error);
    return [];
  }
}

// Get traffic sources
export async function getTrafficSources(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<Array<{ source: string; count: number }>> {
  try {
    let sql = `SELECT COALESCE(referrer, 'Direct') as source, COUNT(*) as count 
               FROM page_views WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    sql += ` GROUP BY COALESCE(referrer, 'Direct') ORDER BY count DESC`;

    const rows = await query<{ source: string; count: string }>(sql, params);
    return rows.map((row) => ({
      source: row.source,
      count: parseInt(row.count),
    }));
  } catch (error) {
    console.error('Get traffic sources error:', error);
    return [];
  }
}

// Get sessions
export async function getSessions(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<Session[]> {
  try {
    let sql = `SELECT id, 
                      EXTRACT(EPOCH FROM start_time) * 1000 as start_time,
                      EXTRACT(EPOCH FROM last_activity) * 1000 as last_activity,
                      page_views_count, ip_address, user_agent, referrer
               FROM visitor_sessions WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND start_time >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND start_time <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    sql += ` ORDER BY start_time DESC LIMIT 10000`;

    const rows = await query(sql, params);
    return rows.map((row) => ({
      id: row.id,
      startTime: parseInt(row.start_time),
      lastActivity: parseInt(row.last_activity),
      pageViews: row.page_views_count,
      ip: row.ip_address,
      userAgent: row.user_agent,
      referrer: row.referrer || '',
    }));
  } catch (error) {
    console.error('Get sessions error:', error);
    return [];
  }
}

// Get system metrics
export async function getSystemMetrics(filters?: {
  startDate?: number;
  endDate?: number;
  path?: string;
}): Promise<SystemMetric[]> {
  try {
    let sql = `SELECT id, 
                      EXTRACT(EPOCH FROM timestamp) * 1000 as timestamp,
                      response_time, status_code, path, method, error_message
               FROM system_metrics WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.path) {
      sql += ` AND path = $${paramIndex}`;
      params.push(filters.path);
      paramIndex++;
    }

    sql += ` ORDER BY timestamp DESC LIMIT 10000`;

    const rows = await query(sql, params);
    return rows.map((row) => ({
      id: row.id,
      timestamp: parseInt(row.timestamp),
      responseTime: row.response_time,
      statusCode: row.status_code,
      path: row.path,
      method: row.method,
      error: row.error_message || undefined,
    }));
  } catch (error) {
    console.error('Get system metrics error:', error);
    return [];
  }
}

// Get system stats (aggregated)
export async function getSystemStats(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<{
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  statusCodes: Record<number, number>;
}> {
  try {
    let sql = `SELECT 
                 COUNT(*) as total_requests,
                 AVG(response_time) as avg_response_time,
                 COUNT(*) FILTER (WHERE status_code >= 400) as error_count
               FROM system_metrics WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    const stats = await queryOne<{
      total_requests: string;
      avg_response_time: string;
      error_count: string;
    }>(sql, params);

    if (!stats || parseInt(stats.total_requests) === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        statusCodes: {},
      };
    }

    // Get status code distribution
    let statusSql = `SELECT status_code, COUNT(*) as count 
                     FROM system_metrics WHERE 1=1`;
    const statusParams: any[] = [];
    let statusParamIndex = 1;

    if (filters?.startDate) {
      statusSql += ` AND timestamp >= to_timestamp($${statusParamIndex} / 1000)`;
      statusParams.push(filters.startDate);
      statusParamIndex++;
    }

    if (filters?.endDate) {
      statusSql += ` AND timestamp <= to_timestamp($${statusParamIndex} / 1000)`;
      statusParams.push(filters.endDate);
      statusParamIndex++;
    }

    statusSql += ` GROUP BY status_code`;

    const statusRows = await query<{ status_code: number; count: string }>(
      statusSql,
      statusParams
    );

    const statusCodes: Record<number, number> = {};
    statusRows.forEach((row) => {
      statusCodes[row.status_code] = parseInt(row.count);
    });

    const totalRequests = parseInt(stats.total_requests);
    const errorCount = parseInt(stats.error_count);
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    return {
      totalRequests,
      averageResponseTime: Math.round(parseFloat(stats.avg_response_time) * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      statusCodes,
    };
  } catch (error) {
    console.error('Get system stats error:', error);
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      statusCodes: {},
    };
  }
}

// Get time series data
export async function getTimeSeriesData(filters?: {
  startDate?: number;
  endDate?: number;
  interval?: 'hour' | 'day' | 'week';
}): Promise<Array<{ date: string; count: number }>> {
  try {
    const interval = filters?.interval || 'day';
    let dateFormat: string;

    switch (interval) {
      case 'hour':
        dateFormat = "to_char(timestamp, 'YYYY-MM-DD HH24:00')";
        break;
      case 'week':
        dateFormat = "to_char(date_trunc('week', timestamp), 'YYYY-MM-DD')";
        break;
      case 'day':
      default:
        dateFormat = "to_char(timestamp, 'YYYY-MM-DD')";
        break;
    }

    let sql = `SELECT ${dateFormat} as date, COUNT(*) as count 
               FROM page_views WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    sql += ` GROUP BY ${dateFormat} ORDER BY date ASC`;

    const rows = await query<{ date: string; count: string }>(sql, params);
    return rows.map((row) => ({
      date: row.date,
      count: parseInt(row.count),
    }));
  } catch (error) {
    console.error('Get time series data error:', error);
    return [];
  }
}

// Cleanup old data
export async function cleanupOldData(): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - METRIC_RETENTION_DAYS);

    await query(
      `DELETE FROM page_views WHERE timestamp < $1`,
      [cutoffDate]
    );

    await query(
      `DELETE FROM system_metrics WHERE timestamp < $1`,
      [cutoffDate]
    );

    await query(
      `DELETE FROM visitor_sessions WHERE last_activity < $1`,
      [cutoffDate]
    );
  } catch (error) {
    console.error('Cleanup old data error:', error);
  }
}

// Seed analytics data (for development/testing)
export async function seedAnalyticsData(): Promise<void> {
  try {
    // Check if data already exists
    const existingData = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM page_views'
    );

    if (existingData && parseInt(existingData.count) > 0) {
      return; // Data already exists
    }

    // This would be called from the seed script, not here
    // But we can provide a helper function
    console.log('Use database/seed.sql to seed test data');
  } catch (error) {
    console.error('Seed analytics data error:', error);
  }
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldData, 60 * 60 * 1000); // Every hour
}

