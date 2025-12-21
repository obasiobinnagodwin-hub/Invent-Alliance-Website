import { NextRequest, NextResponse } from 'next/server';
import { trackSystemMetric } from '@/lib/analytics';

// This endpoint can be called to track custom system metrics
export async function POST(request: NextRequest) {
  try {
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

