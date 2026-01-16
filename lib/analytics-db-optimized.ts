/**
 * Optimized Analytics Database Queries
 * 
 * Provides JOIN-optimized queries to avoid N+1 patterns.
 * Uses LEFT JOINs to fetch page views with session data in a single query.
 * 
 * This module is gated behind FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS.
 * When enabled, reduces database round trips significantly.
 */

import { query } from './db';
import { logger } from './secure-logger';
import { FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS, FEATURE_DB_POOL_TUNING, FEATURE_PII_HASHING } from './feature-flags';
import { pseudonymizeIP, hashForAnalytics } from './data-protection';
import type { PageView } from './analytics-db';

export interface PageViewWithSession extends PageView {
  sessionStartTime?: number;
  sessionLastActivity?: number;
  sessionPageViewsCount?: number;
  sessionIp?: string;
  sessionUserAgent?: string;
  sessionReferrer?: string;
}

/**
 * Get page views with session data using LEFT JOIN
 * This avoids N+1 queries by fetching all data in a single query.
 * 
 * @param filters - Filter options
 * @param limit - Maximum number of results (default: 1000)
 * @returns Array of page views with session data
 */
export async function getPageViewsWithSessionData(
  filters?: {
    startDate?: number;
    endDate?: number;
  },
  limit: number = 1000
): Promise<PageViewWithSession[]> {
  if (!FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS) {
    throw new Error('FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS must be enabled to use optimized queries');
  }

  const startTime = FEATURE_DB_POOL_TUNING ? Date.now() : 0;

  try {
    let sql = `
      SELECT 
        pv.id,
        pv.session_id,
        pv.path,
        EXTRACT(EPOCH FROM pv.timestamp) * 1000 as timestamp,
        pv.ip_address,
        pv.user_agent,
        pv.referrer,
        pv.time_on_page,
        EXTRACT(EPOCH FROM vs.start_time) * 1000 as session_start_time,
        EXTRACT(EPOCH FROM vs.last_activity) * 1000 as session_last_activity,
        vs.page_views_count as session_page_views_count,
        vs.ip_address as session_ip,
        vs.user_agent as session_user_agent,
        vs.referrer as session_referrer
      FROM page_views pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      sql += ` AND pv.timestamp >= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND pv.timestamp <= to_timestamp($${paramIndex} / 1000)`;
      params.push(filters.endDate);
      paramIndex++;
    }

    sql += ` ORDER BY pv.timestamp DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const rows = await query(sql, params);

    // Log query timing if DB tuning is enabled
    if (FEATURE_DB_POOL_TUNING && startTime > 0) {
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        const sqlPreview = sql.length > 120 ? sql.substring(0, 120) + '...' : sql;
        logger.warn('Slow optimized query detected', {
          duration: `${duration}ms`,
          rowCount: rows.length,
          sqlPreview,
        });
      }
    }

    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      path: row.path,
      timestamp: parseInt(row.timestamp),
      ip: row.ip_address,
      userAgent: row.user_agent,
      referrer: row.referrer || '',
      timeOnPage: row.time_on_page,
      sessionStartTime: row.session_start_time ? parseInt(row.session_start_time) : undefined,
      sessionLastActivity: row.session_last_activity ? parseInt(row.session_last_activity) : undefined,
      sessionPageViewsCount: row.session_page_views_count ? parseInt(row.session_page_views_count) : undefined,
      sessionIp: row.session_ip,
      sessionUserAgent: row.session_user_agent,
      sessionReferrer: row.session_referrer || undefined,
    }));
  } catch (error) {
    logger.error('Get page views with session data error', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Batch insert page views using bulk INSERT
 * More efficient than individual inserts for multiple page views.
 * 
 * @param pageViews - Array of page view data to insert
 * @returns Number of rows inserted
 */
export async function trackPageViewsBatch(
  pageViews: Array<Omit<PageView, 'id' | 'timestamp'>>
): Promise<number> {
  if (pageViews.length === 0) {
    return 0;
  }

  try {
    const { transaction } = await import('./db');
    
    return await transaction(async (client) => {
      // Build bulk INSERT query
      const values: any[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;

      for (const pv of pageViews) {
        const sessionId = (pv.sessionId || '').substring(0, 255);
        const path = (pv.path || '').substring(0, 500);
        const ip = (pv.ip || '').substring(0, 45);
        const userAgent = (pv.userAgent || '').substring(0, 500);
        const referrer = pv.referrer ? pv.referrer.substring(0, 500) : null;
        
        // Calculate IP hash if feature is enabled
        const ipHash = FEATURE_PII_HASHING && pv.ip 
          ? hashForAnalytics(pseudonymizeIP(pv.ip))
          : null;

        placeholders.push(
          `($${paramIndex}, $${paramIndex + 1}, CURRENT_TIMESTAMP, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
        );
        values.push(sessionId, path, ip, ipHash, userAgent, referrer, pv.timeOnPage || null);
        paramIndex += 7;
      }

      const sql = `
        INSERT INTO page_views 
        (session_id, path, timestamp, ip_address, ip_address_hash, user_agent, referrer, time_on_page)
        VALUES ${placeholders.join(', ')}
        RETURNING id
      `;

      const result = await client.query(sql, values);
      return result.rows.length;
    });
  } catch (error) {
    logger.error('Batch insert page views error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

