import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyTokenWithSession } from '@/lib/auth-wrapper';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Use verifyTokenWithSession if database is enabled, otherwise use verifyToken
  const useDatabase = process.env.USE_DATABASE === 'true';
  const user = useDatabase 
    ? await verifyTokenWithSession(token)
    : verifyToken(token);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}

