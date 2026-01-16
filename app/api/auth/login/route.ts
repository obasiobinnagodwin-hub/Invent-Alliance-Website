import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_RATE_LIMIT_LOGIN, FEATURE_STRICT_SAMESITE_AUTH } from '@/lib/feature-flags';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  // Dynamic imports to prevent build-time analysis issues
  const { login } = await import('@/lib/auth-wrapper');
  const { checkLoginRateLimit, recordFailedLogin } = await import('@/lib/rate-limit');
  const { validateCSRFToken, isCSRFEnabled } = await import('@/lib/csrf');
  const { logger } = await import('@/lib/secure-logger');
  
  try {
    // CSRF protection (only if feature is enabled)
    if (isCSRFEnabled() && !validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Rate limiting check (only if feature is enabled)
    if (FEATURE_RATE_LIMIT_LOGIN) {
      const rateLimitResult = checkLoginRateLimit(request);
      
      if (rateLimitResult && !rateLimitResult.allowed) {
        // Rate limit exceeded - return 429 with Retry-After header
        const retryAfter = rateLimitResult.retryAfter || 900; // Default to 15 minutes
        
        return NextResponse.json(
          { 
            error: 'Too many login attempts. Please try again later.',
            retryAfter: retryAfter
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString()
            }
          }
        );
      }
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await login(username, password);

    if (!result.success) {
      // Record failed login attempt (only if feature is enabled)
      // This ensures only failed attempts count toward the rate limit
      if (FEATURE_RATE_LIMIT_LOGIN) {
        recordFailedLogin(request);
      }

      // Provide more helpful error messages
      const errorMessage = result.error || 'Invalid credentials';
      logger.error('Login failed', undefined, { username }); // Never log password
      
      return NextResponse.json(
        { 
          error: errorMessage,
          hint: errorMessage.includes('Database connection') 
            ? 'Try setting USE_DATABASE=false in .env.local to use in-memory authentication, or set up your database properly.'
            : undefined
        },
        { status: 401 }
      );
    }

    if (!result.token) {
      logger.error('Login succeeded but no token generated');
      return NextResponse.json(
        { error: 'Failed to generate authentication token' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });
    
    // Set HTTP-only cookie with configurable SameSite setting
    // Note: SameSite=Strict provides stronger CSRF protection but may break:
    // - External OAuth redirects (if redirect goes through third-party domain)
    // - Iframe embeds from different domains
    // - Email tracking redirects that go through tracking domains
    // Use FEATURE_STRICT_SAMESITE_AUTH=true to enable Strict mode
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: FEATURE_STRICT_SAMESITE_AUTH ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Login error', error instanceof Error ? error : new Error(String(error)));
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

