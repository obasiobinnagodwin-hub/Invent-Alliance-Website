// Alternative PDF export using a simpler approach
// This is a fallback if the main PDF route fails due to font issues

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyTokenWithSession } from '@/lib/auth-wrapper';

export async function GET(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const useDatabase = process.env.USE_DATABASE === 'true';
  const user = useDatabase 
    ? await verifyTokenWithSession(token)
    : verifyToken(token);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // For now, redirect to CSV export as a workaround
  // Or return a message suggesting CSV instead
  return NextResponse.json(
    { 
      error: 'PDF export is currently unavailable due to font configuration issues.',
      suggestion: 'Please use CSV export instead, or contact support.',
      alternative: '/api/analytics/export/csv'
    },
    { status: 503 }
  );
}

