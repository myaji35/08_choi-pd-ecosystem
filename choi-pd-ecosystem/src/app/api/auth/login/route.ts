import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { adminUsers, loginAttempts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// JWT_SECRET 필수 — 폴백 문자열 없음
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다. 서버를 시작하기 전에 반드시 설정하세요.');
  }
  return new TextEncoder().encode(secret);
}

// 로그인 시도 기록
async function recordLoginAttempt(
  identifier: string,
  ipAddress: string,
  success: boolean,
  userAgent: string | null,
  failureReason?: string
) {
  try {
    await db.insert(loginAttempts).values({
      identifier,
      ipAddress,
      success,
      userAgent,
      failureReason: failureReason ?? null,
    });
  } catch (err) {
    // 로그인 시도 기록 실패가 인증 자체를 막으면 안 됨
    console.error('Failed to record login attempt:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const userAgent = request.headers.get('user-agent');

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Dev mode 우회 (NEXT_PUBLIC_DEV_MODE=true 시)
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      const token = await new SignJWT({
        userId: 0,
        username: 'dev-admin',
        role: 'superadmin',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getJwtSecret());

      const response = NextResponse.json({
        success: true,
        user: {
          id: 0,
          username: 'dev-admin',
          role: 'superadmin',
        },
      });

      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return response;
    }

    // DB에서 adminUsers 조회
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (!user) {
      await recordLoginAttempt(username, ipAddress, false, userAgent, 'user_not_found');
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // bcrypt 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await recordLoginAttempt(username, ipAddress, false, userAgent, 'wrong_password');
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // 로그인 성공 기록
    await recordLoginAttempt(username, ipAddress, true, userAgent);

    // JWT 토큰 생성
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(getJwtSecret());

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
