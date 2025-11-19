import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { SignJWT } from 'jose';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'choi-pd-ecosystem-secret-key-change-in-production'
);

// Hard-coded admin account for guaranteed access
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_PASSWORD_HASH = hashPassword(ADMIN_PASSWORD);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Simple admin authentication
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = await new SignJWT({
        userId: 1,
        username: ADMIN_USERNAME,
        role: 'superadmin',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

      // Set cookie and return success
      const response = NextResponse.json({
        success: true,
        user: {
          id: 1,
          username: ADMIN_USERNAME,
          role: 'superadmin',
        },
      });

      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    // Invalid credentials
    return NextResponse.json(
      { success: false, error: 'Invalid username or password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
