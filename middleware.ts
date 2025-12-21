import { NextRequest, NextResponse } from 'next/server';
// Middleware runs in Edge Runtime which doesn't support Node.js modules like 'pg'
// So we always use in-memory analytics here, even if USE_DATABASE=true
// The in-memory data can be synced to database via API routes if needed
// API routes (which run in Node.js runtime) can use database-backed analytics
import { trackPageView, trackSystemMetric } from '@/lib/analytics';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  
  // Skip tracking for API routes, static files, dashboard, and login
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/login') ||
    path.includes('.')
  ) {
    const response = NextResponse.next();
    // Still track system metrics for API routes
    if (path.startsWith('/api/')) {
      const responseTime = Date.now() - startTime;
      setTimeout(() => {
        try {
          trackSystemMetric({
            responseTime,
            statusCode: 200,
            path,
            method: request.method,
          });
        } catch (error) {
          console.error('System metric tracking error:', error);
        }
      }, 0);
    }
    return response;
  }
  
  // Generate or get session ID
  let sessionId = request.cookies.get('session-id')?.value;
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Get client information
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referrer = request.headers.get('referer') || '';
  
  // Track page view - in-memory version is synchronous
  try {
    trackPageView({
      path,
      ip,
      userAgent,
      referrer,
      sessionId,
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
  
  // Create response
  const response = NextResponse.next();
  
  // Set session cookie
  response.cookies.set('session-id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
  });
  
  // Track system metric after response
  const responseTime = Date.now() - startTime;
  setTimeout(() => {
    try {
      trackSystemMetric({
        responseTime,
        statusCode: 200, // We don't know the actual status code here
        path,
        method: request.method,
      });
    } catch (error) {
      console.error('System metric tracking error:', error);
    }
  }, 0);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

