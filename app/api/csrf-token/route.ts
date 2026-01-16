import { NextRequest, NextResponse } from 'next/server';
import { isCSRFEnabled } from '@/lib/csrf';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';

/**
 * CSRF Token Endpoint
 * 
 * Returns the CSRF token from the HttpOnly cookie.
 * This endpoint is needed because HttpOnly cookies cannot be read by JavaScript.
 * 
 * Security: Only returns token if CSRF feature is enabled and cookie exists.
 */
export async function GET(request: NextRequest) {
  // Only return token if CSRF feature is enabled
  if (!isCSRFEnabled()) {
    return NextResponse.json(
      { error: 'CSRF protection is not enabled' },
      { status: 404 }
    );
  }

  const csrfToken = request.cookies.get('csrf-token')?.value;

  if (!csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ token: csrfToken });
}

