import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  // Dynamic imports to prevent build-time analysis issues
  const { logout } = await import('@/lib/auth-wrapper');
  
  const token = request.cookies.get('auth-token')?.value;
  
  if (token) {
    await logout(token);
  }
  
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookie
  response.cookies.delete('auth-token');
  
  return response;
}

