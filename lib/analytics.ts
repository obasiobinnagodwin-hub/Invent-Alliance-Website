// Analytics data storage (in-memory)
// In production, replace with database (PostgreSQL, MongoDB, etc.)

export interface PageView {
  id: string;
  path: string;
  timestamp: number;
  ip: string;
  userAgent: string;
  referrer: string;
  sessionId: string;
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
  timestamp: number;
  responseTime: number;
  statusCode: number;
  path: string;
  method: string;
  error?: string;
}

// In-memory stores
const pageViews: PageView[] = [];
const sessions: Map<string, Session> = new Map();
const systemMetrics: SystemMetric[] = [];

// Configuration
const MAX_STORAGE_SIZE = 10000; // Maximum number of records to keep
const METRIC_RETENTION_DAYS = 30; // Keep metrics for 30 days

// Helper functions
function cleanupOldData() {
  const cutoffTime = Date.now() - METRIC_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  
  // Remove old page views
  const filteredViews = pageViews.filter(pv => pv.timestamp > cutoffTime);
  pageViews.length = 0;
  pageViews.push(...filteredViews);
  
  // Remove old system metrics
  const filteredMetrics = systemMetrics.filter(m => m.timestamp > cutoffTime);
  systemMetrics.length = 0;
  systemMetrics.push(...filteredMetrics);
  
  // Remove old sessions
  for (const [sessionId, session] of sessions.entries()) {
    if (session.lastActivity < cutoffTime) {
      sessions.delete(sessionId);
    }
  }
}

// Analytics functions
export function trackPageView(data: Omit<PageView, 'id' | 'timestamp'>) {
  cleanupOldData();
  
  if (pageViews.length >= MAX_STORAGE_SIZE) {
    pageViews.shift(); // Remove oldest
  }
  
  const pageView: PageView = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    ...data,
  };
  
  pageViews.push(pageView);
  
  // Update session
  let session = sessions.get(data.sessionId);
  if (!session) {
    session = {
      id: data.sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      ip: data.ip,
      userAgent: data.userAgent,
      referrer: data.referrer,
    };
    sessions.set(data.sessionId, session);
  }
  
  session.pageViews++;
  session.lastActivity = Date.now();
  
  return pageView;
}

export function trackSystemMetric(data: Omit<SystemMetric, 'timestamp'>) {
  cleanupOldData();
  
  if (systemMetrics.length >= MAX_STORAGE_SIZE) {
    systemMetrics.shift(); // Remove oldest
  }
  
  const metric: SystemMetric = {
    timestamp: Date.now(),
    ...data,
  };
  
  systemMetrics.push(metric);
  return metric;
}

// Analytics queries
export function getPageViews(filters?: {
  startDate?: number;
  endDate?: number;
  path?: string;
}) {
  let filtered = [...pageViews];
  
  if (filters?.startDate) {
    filtered = filtered.filter(pv => pv.timestamp >= filters.startDate!);
  }
  
  if (filters?.endDate) {
    filtered = filtered.filter(pv => pv.timestamp <= filters.endDate!);
  }
  
  if (filters?.path) {
    filtered = filtered.filter(pv => pv.path === filters.path);
  }
  
  return filtered.sort((a, b) => b.timestamp - a.timestamp);
}

export function getUniqueVisitors(filters?: {
  startDate?: number;
  endDate?: number;
}) {
  const views = getPageViews(filters);
  const uniqueSessions = new Set(views.map(pv => pv.sessionId));
  return uniqueSessions.size;
}

export function getPageViewsByPath(filters?: {
  startDate?: number;
  endDate?: number;
}) {
  const views = getPageViews(filters);
  const pathCounts: Record<string, number> = {};
  
  views.forEach(pv => {
    pathCounts[pv.path] = (pathCounts[pv.path] || 0) + 1;
  });
  
  return Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTrafficSources(filters?: {
  startDate?: number;
  endDate?: number;
}) {
  const views = getPageViews(filters);
  const sources: Record<string, number> = {};
  
  views.forEach(pv => {
    const source = pv.referrer || 'Direct';
    sources[source] = (sources[source] || 0) + 1;
  });
  
  return Object.entries(sources)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export function getSessions(filters?: {
  startDate?: number;
  endDate?: number;
}) {
  let filtered = Array.from(sessions.values());
  
  if (filters?.startDate) {
    filtered = filtered.filter(s => s.startTime >= filters.startDate!);
  }
  
  if (filters?.endDate) {
    filtered = filtered.filter(s => s.startTime <= filters.endDate!);
  }
  
  return filtered.sort((a, b) => b.startTime - a.startTime);
}

export function getSystemMetrics(filters?: {
  startDate?: number;
  endDate?: number;
  path?: string;
}) {
  let filtered = [...systemMetrics];
  
  if (filters?.startDate) {
    filtered = filtered.filter(m => m.timestamp >= filters.startDate!);
  }
  
  if (filters?.endDate) {
    filtered = filtered.filter(m => m.timestamp <= filters.endDate!);
  }
  
  if (filters?.path) {
    filtered = filtered.filter(m => m.path === filters.path);
  }
  
  return filtered.sort((a, b) => b.timestamp - a.timestamp);
}

export function getSystemStats(filters?: {
  startDate?: number;
  endDate?: number;
}) {
  const metrics = getSystemMetrics(filters);
  
  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      statusCodes: {},
    };
  }
  
  const totalRequests = metrics.length;
  const totalResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0);
  const averageResponseTime = totalResponseTime / totalRequests;
  const errors = metrics.filter(m => m.statusCode >= 400).length;
  const errorRate = (errors / totalRequests) * 100;
  
  const statusCodes: Record<number, number> = {};
  metrics.forEach(m => {
    statusCodes[m.statusCode] = (statusCodes[m.statusCode] || 0) + 1;
  });
  
  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    errorRate: Math.round(errorRate * 100) / 100,
    statusCodes,
  };
}

export function getTimeSeriesData(filters?: {
  startDate?: number;
  endDate?: number;
  interval?: 'hour' | 'day' | 'week';
}) {
  const interval = filters?.interval || 'day';
  const views = getPageViews(filters);
  
  const intervals: Record<string, number> = {};
  
  views.forEach(pv => {
    const date = new Date(pv.timestamp);
    let key: string;
    
    const pad = (n: number) => String(n).padStart(2, '0');
    
    if (interval === 'hour') {
      key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`;
    } else if (interval === 'day') {
      key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    } else {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = `${weekStart.getFullYear()}-${pad(weekStart.getMonth() + 1)}-${pad(weekStart.getDate())}`;
    }
    
    intervals[key] = (intervals[key] || 0) + 1;
  });
  
  return Object.entries(intervals)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Seed function to initialize with sample data for testing
export function seedAnalyticsData() {
  const now = Date.now();
  const daysAgo = (days: number) => now - (days * 24 * 60 * 60 * 1000);
  
  // Only seed if data is empty
  if (pageViews.length === 0) {
    const paths = ['/', '/about-us', '/products-services', '/contacts', '/careers', '/blog'];
    const referrers = ['Direct', 'https://google.com', 'https://bing.com', 'https://facebook.com'];
    
    // Generate page views for the last 7 days
    for (let day = 0; day < 7; day++) {
      const dayStart = daysAgo(day);
      const viewsPerDay = Math.floor(Math.random() * 50) + 20; // 20-70 views per day
      
      for (let i = 0; i < viewsPerDay; i++) {
        const sessionId = `session-${day}-${i}`;
        const path = paths[Math.floor(Math.random() * paths.length)];
        const referrer = referrers[Math.floor(Math.random() * referrers.length)];
        const timestamp = dayStart + (i * 60000); // Spread throughout the day
        
        trackPageView({
          path,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          referrer: referrer === 'Direct' ? '' : referrer,
          sessionId,
        });
      }
    }
    
    // Generate system metrics
    for (let day = 0; day < 7; day++) {
      const dayStart = daysAgo(day);
      const requestsPerDay = Math.floor(Math.random() * 100) + 50;
      
      for (let i = 0; i < requestsPerDay; i++) {
        const timestamp = dayStart + (i * 10000);
        const statusCode = Math.random() > 0.95 ? 500 : Math.random() > 0.9 ? 404 : 200;
        
        trackSystemMetric({
          responseTime: Math.floor(Math.random() * 200) + 50,
          statusCode,
          path: paths[Math.floor(Math.random() * paths.length)],
          method: ['GET', 'POST'][Math.floor(Math.random() * 2)],
        });
      }
    }
    
    console.log(`✅ Seeded analytics data: ${pageViews.length} page views, ${systemMetrics.length} system metrics`);
  }
}

// Initialize cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldData, 60 * 60 * 1000); // Cleanup every hour
}

