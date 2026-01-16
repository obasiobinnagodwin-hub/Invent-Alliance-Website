import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Dynamic imports to prevent build-time analysis issues
  const { verifyToken, verifyTokenWithSession } = await import('@/lib/auth-wrapper');
  
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

