import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth-wrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await login(username, password);

    if (!result.success) {
      // Provide more helpful error messages
      const errorMessage = result.error || 'Invalid credentials';
      console.error('Login failed:', errorMessage);
      
      return NextResponse.json(
        { 
          error: errorMessage,
          hint: errorMessage.includes('Database connection') 
            ? 'Try setting USE_DATABASE=false in .env.local to use in-memory authentication, or set up your database properly.'
            : undefined
        },
        { status: 401 }
      );
    }

    if (!result.token) {
      console.error('Login succeeded but no token generated');
      return NextResponse.json(
        { error: 'Failed to generate authentication token' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });
    
    // Set HTTP-only cookie
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

