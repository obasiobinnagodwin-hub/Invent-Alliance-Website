import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_ROPA_ENDPOINT } from '@/lib/feature-flags';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Verify admin authentication
 */
async function requireAdminAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return false;
  }

  // Dynamic imports to prevent build-time analysis issues
  const { verifyToken, verifyTokenWithSession } = await import('@/lib/auth-wrapper');
  
  const useDatabase = process.env.USE_DATABASE === 'true';
  const user = useDatabase 
    ? await verifyTokenWithSession(token)
    : verifyToken(token);

  // Check if user exists and has admin role
  return user !== null && (user.role === 'admin' || user.role === 'editor');
}

export async function GET(request: NextRequest) {
  // Check if feature is enabled
  if (!FEATURE_ROPA_ENDPOINT) {
    return NextResponse.json(
      { error: 'ROPA endpoint is not available' },
      { status: 404 }
    );
  }

  // Check authentication
  const isAuthenticated = await requireAdminAuth(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    // Dynamic imports to prevent build-time analysis issues
    const { logger } = await import('@/lib/secure-logger');
    const { getAllProcessingActivities } = await import('@/lib/data-processing-register');
    
    logger.info('ROPA register accessed by admin');

    const activities = getAllProcessingActivities();

    return NextResponse.json({
      success: true,
      register: {
        version: '1.0',
        lastUpdated: '2025-01-16',
        controller: {
          name: 'Invent Alliance Limited',
          address: '[Company Address]',
          email: 'Contact via website contact form',
        },
        activities: activities,
        totalActivities: activities.length,
      },
    });
  } catch (error) {
    // Dynamic import for error logging
    try {
      const { logger } = await import('@/lib/secure-logger');
      logger.error('ROPA endpoint error', error instanceof Error ? error : new Error(String(error)));
    } catch (logError) {
      // Fallback to console if logger import fails
      console.error('ROPA endpoint error:', error);
    }
    return NextResponse.json(
      { error: 'An error occurred while retrieving processing activities register' },
      { status: 500 }
    );
  }
}

// Return 404 for other methods if feature is disabled
export async function POST() {
  if (!FEATURE_ROPA_ENDPOINT) {
    return NextResponse.json(
      { error: 'ROPA endpoint is not available' },
      { status: 404 }
    );
  }
  return NextResponse.json({ 
    message: 'ROPA endpoint',
    method: 'GET',
    description: 'GET this endpoint to retrieve Records of Processing Activities register',
  });
}

