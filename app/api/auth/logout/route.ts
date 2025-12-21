import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth-wrapper';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (token) {
    await logout(token);
  }
  
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookie
  response.cookies.delete('auth-token');
  
  return response;
}

