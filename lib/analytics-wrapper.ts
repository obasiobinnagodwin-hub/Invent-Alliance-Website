// Analytics wrapper - switches between in-memory and database based on environment
// Set USE_DATABASE=true to use database-backed analytics

import * as analyticsMemory from './analytics';
import * as analyticsDb from './analytics-db';

const USE_DATABASE = process.env.USE_DATABASE === 'true';

// Re-export interfaces (they should be compatible)
export type PageView = analyticsMemory.PageView;
export type Session = analyticsMemory.Session;
export type SystemMetric = analyticsMemory.SystemMetric;

// Wrapper functions that switch between implementations
export async function trackPageView(
  data: Omit<PageView, 'id' | 'timestamp'>
): Promise<PageView> {
  if (USE_DATABASE) {
    return await analyticsDb.trackPageView(data);
  } else {
    return Promise.resolve(analyticsMemory.trackPageView(data));
  }
}

export async function trackSystemMetric(
  data: Omit<SystemMetric, 'id' | 'timestamp'>
): Promise<SystemMetric> {
  if (USE_DATABASE) {
    return await analyticsDb.trackSystemMetric(data);
  } else {
    return Promise.resolve(analyticsMemory.trackSystemMetric(data));
  }
}

export async function getPageViews(filters?: {
  startDate?: number;
  endDate?: number;
  path?: string;
}): Promise<PageView[]> {
  if (USE_DATABASE) {
    return await analyticsDb.getPageViews(filters);
  } else {
    return Promise.resolve(analyticsMemory.getPageViews(filters));
  }
}

export async function getUniqueVisitors(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<number> {
  if (USE_DATABASE) {
    return await analyticsDb.getUniqueVisitors(filters);
  } else {
    return Promise.resolve(analyticsMemory.getUniqueVisitors(filters));
  }
}

export async function getPageViewsByPath(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<Array<{ path: string; count: number }>> {
  if (USE_DATABASE) {
    return await analyticsDb.getPageViewsByPath(filters);
  } else {
    return Promise.resolve(analyticsMemory.getPageViewsByPath(filters));
  }
}

export async function getTrafficSources(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<Array<{ source: string; count: number }>> {
  if (USE_DATABASE) {
    return await analyticsDb.getTrafficSources(filters);
  } else {
    return Promise.resolve(analyticsMemory.getTrafficSources(filters));
  }
}

export async function getSessions(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<Session[]> {
  if (USE_DATABASE) {
    return await analyticsDb.getSessions(filters);
  } else {
    return Promise.resolve(analyticsMemory.getSessions(filters));
  }
}

export async function getSystemMetrics(filters?: {
  startDate?: number;
  endDate?: number;
  path?: string;
}): Promise<SystemMetric[]> {
  if (USE_DATABASE) {
    return await analyticsDb.getSystemMetrics(filters);
  } else {
    return Promise.resolve(analyticsMemory.getSystemMetrics(filters));
  }
}

export async function getSystemStats(filters?: {
  startDate?: number;
  endDate?: number;
}): Promise<{
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  statusCodes: Record<number, number>;
}> {
  if (USE_DATABASE) {
    return await analyticsDb.getSystemStats(filters);
  } else {
    return Promise.resolve(analyticsMemory.getSystemStats(filters));
  }
}

export async function getTimeSeriesData(filters?: {
  startDate?: number;
  endDate?: number;
  interval?: 'hour' | 'day' | 'week';
}): Promise<Array<{ date: string; count: number }>> {
  if (USE_DATABASE) {
    return await analyticsDb.getTimeSeriesData(filters);
  } else {
    return Promise.resolve(analyticsMemory.getTimeSeriesData(filters));
  }
}

export async function seedAnalyticsData(): Promise<void> {
  if (USE_DATABASE) {
    return await analyticsDb.seedAnalyticsData();
  } else {
    return Promise.resolve(analyticsMemory.seedAnalyticsData());
  }
}
