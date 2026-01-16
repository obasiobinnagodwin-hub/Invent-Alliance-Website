import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function requireAuth(request: NextRequest): Promise<boolean> {
  // Dynamic imports to prevent build-time analysis issues
  const { verifyToken } = await import('@/lib/auth');
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  
  const user = verifyToken(token);
  return user !== null;
}

// Endpoint to manually seed analytics data
export async function POST(request: NextRequest) {
  // Check authentication
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Dynamic import to prevent build-time analysis issues
    const { seedAnalyticsData } = await import('@/lib/analytics');
    seedAnalyticsData();
    return NextResponse.json({ 
      success: true, 
      message: 'Analytics data seeded successfully' 
    });
  } catch (error) {
    console.error('Seed analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to seed analytics data' },
      { status: 500 }
    );
  }
}

