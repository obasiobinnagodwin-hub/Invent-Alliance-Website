import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// This endpoint can be called to track custom system metrics
export async function POST(request: NextRequest) {
  try {
    // Dynamic import to prevent build-time analysis issues
    const { trackSystemMetric } = await import('@/lib/analytics');
    
    const body = await request.json();
    const { responseTime, statusCode, path, method, error } = body;

    trackSystemMetric({
      responseTime: responseTime || 0,
      statusCode: statusCode || 200,
      path: path || 'unknown',
      method: method || 'GET',
      error,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track metric error:', error);
    return NextResponse.json(
      { error: 'Failed to track metric' },
      { status: 500 }
    );
  }
}

