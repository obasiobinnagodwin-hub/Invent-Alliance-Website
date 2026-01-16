import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_ANALYTICS_BATCH_WRITE } from '@/lib/feature-flags';
import { bufferPageView } from '@/lib/analytics-buffer';
import { logger } from '@/lib/secure-logger';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';

/**
 * Analytics Collection Endpoint
 * 
 * Receives analytics events from Edge Runtime middleware and buffers them
 * for batch insertion into the database.
 * 
 * This endpoint runs in Node.js runtime (server-side) and can use database
 * connections, unlike Edge Runtime middleware.
 * 
 * POST /api/analytics/collect
 */
export async function POST(request: NextRequest) {
  // Check if batch write feature is enabled
  if (!FEATURE_ANALYTICS_BATCH_WRITE) {
    return NextResponse.json(
      { error: 'Batch write feature is not enabled' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Extract page view data
    const pageView = {
      sessionId: body.sessionId,
      path: body.path,
      ip: body.ip || 'unknown',
      userAgent: body.userAgent || 'unknown',
      referrer: body.referrer || '',
      timeOnPage: body.timeOnPage || null,
    };

    // Validate required fields
    if (!pageView.sessionId || !pageView.path) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, path' },
        { status: 400 }
      );
    }

    // Buffer the page view
    bufferPageView(pageView);

    // Return success immediately (non-blocking)
    return NextResponse.json(
      { success: true, buffered: true },
      { status: 202 } // Accepted (async processing)
    );
  } catch (error) {
    logger.error('Analytics collect error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}

/**
 * Health check for collection endpoint
 */
export async function GET() {
  if (!FEATURE_ANALYTICS_BATCH_WRITE) {
    return NextResponse.json(
      { error: 'Batch write feature is not enabled' },
      { status: 404 }
    );
  }

  const { getBufferSize } = await import('@/lib/analytics-buffer');
  
  return NextResponse.json({
    status: 'ok',
    featureEnabled: true,
    bufferSize: getBufferSize(),
  });
}

