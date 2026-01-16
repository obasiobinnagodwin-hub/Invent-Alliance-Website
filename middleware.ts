import { NextRequest, NextResponse } from 'next/server';
// Middleware runs in Edge Runtime which doesn't support Node.js modules like 'pg'
// So we always use in-memory analytics here, even if USE_DATABASE=true
// The in-memory data can be synced to database via API routes if needed
// API routes (which run in Node.js runtime) can use database-backed analytics
import { trackPageView, trackSystemMetric } from '@/lib/analytics';
import { generateCSRFToken, isCSRFEnabled } from '@/lib/csrf';

/**
 * Check if cookie consent allows analytics tracking
 * Only checks if FEATURE_COOKIE_CONSENT is enabled
 */
function hasAnalyticsConsent(request: NextRequest): boolean {
  // Check feature flag (must be enabled via environment variable)
  const featureEnabled = process.env.FEATURE_COOKIE_CONSENT === 'true';
  
  if (!featureEnabled) {
    // If feature is disabled, allow analytics (backward compatibility)
    return true;
  }

  // Parse cookie-consent cookie
  const consentCookie = request.cookies.get('cookie-consent')?.value;
  if (!consentCookie) {
    // No consent cookie = no consent
    return false;
  }

  try {
    const consent = JSON.parse(decodeURIComponent(consentCookie));
    // Analytics consent must be explicitly true
    return consent.analytics === true;
  } catch {
    // If parsing fails, assume no consent
    return false;
  }
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  
  // Skip tracking for API routes, static files, dashboard, and login
  // But still set CSRF cookie for login page
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/dashboard') ||
    path.includes('.')
  ) {
    const response = NextResponse.next();
    
    // Set CSRF token cookie for login page (needed for CSRF protection)
    if (path.startsWith('/login') && isCSRFEnabled()) {
      const existingCSRFToken = request.cookies.get('csrf-token')?.value;
      if (!existingCSRFToken) {
        const csrfToken = generateCSRFToken();
        response.cookies.set('csrf-token', csrfToken, {
          httpOnly: true, // HttpOnly as per requirements (token accessible via /api/csrf-token endpoint)
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60, // 24 hours
          path: '/',
        });
      }
    }
    
    // Still track system metrics for API routes (only if analytics consent is given)
    const analyticsConsent = hasAnalyticsConsent(request);
    if (path.startsWith('/api/') && analyticsConsent) {
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
  
  // Check if analytics consent is given (only if cookie consent feature is enabled)
  const analyticsConsent = hasAnalyticsConsent(request);
  
  // Generate or get session ID (only if analytics consent is given)
  let sessionId: string | undefined = undefined;
  if (analyticsConsent) {
    sessionId = request.cookies.get('session-id')?.value;
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  // Track page view only if consent is given
  if (analyticsConsent && sessionId) {
    // Get client information
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || '';
    
    // Use batch collection if feature is enabled, otherwise use immediate tracking
    const useBatchWrite = process.env.FEATURE_ANALYTICS_BATCH_WRITE === 'true';
    
    if (useBatchWrite) {
      // Send to batch collection endpoint (non-blocking, Edge Runtime compatible)
      // Use fetch with keepalive to ensure request completes even if page unloads
      try {
        const origin = request.nextUrl.origin;
        fetch(`${origin}/api/analytics/collect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            path,
            ip,
            userAgent,
            referrer,
          }),
          keepalive: true, // Ensure request completes even if page unloads
        }).catch((error) => {
          // Silently fail - analytics should not block page load
          console.error('Analytics batch collection error:', error);
        });
      } catch (error) {
        // Fallback to immediate tracking if batch collection fails
        console.error('Analytics batch collection setup error:', error);
        try {
          trackPageView({
            path,
            ip,
            userAgent,
            referrer,
            sessionId,
          });
        } catch (fallbackError) {
          console.error('Analytics tracking fallback error:', fallbackError);
        }
      }
    } else {
      // Immediate tracking (existing behavior)
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
    }
  }
  
  // Create response
  const response = NextResponse.next();
  
  // Set session cookie only if analytics consent is given
  if (analyticsConsent && sessionId) {
    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });
  }

  // Set CSRF token cookie if feature is enabled and cookie is missing
  if (isCSRFEnabled()) {
    const existingCSRFToken = request.cookies.get('csrf-token')?.value;
    if (!existingCSRFToken) {
      const csrfToken = generateCSRFToken();
      response.cookies.set('csrf-token', csrfToken, {
        httpOnly: true, // HttpOnly as per requirements (token accessible via /api/csrf-token endpoint)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });
    }
  }
  
  // Track system metric after response (only if analytics consent is given)
  // Note: System metrics are considered necessary for site operation, but we respect consent
  if (analyticsConsent) {
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
  }
  
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

