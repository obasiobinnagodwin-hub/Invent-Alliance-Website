import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { seedAnalyticsData } from '@/lib/analytics';

async function requireAuth(request: NextRequest): Promise<boolean> {
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

