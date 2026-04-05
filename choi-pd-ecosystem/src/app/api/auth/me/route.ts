import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      // dev mode에서는 dev 유저 반환
      if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
        return NextResponse.json({
          user: {
            userId: 'dev_user',
            email: 'dev@impd.io',
            name: '개발 사용자',
            role: 'admin',
            provider: 'google',
          },
        });
      }
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: session });
  } catch (error) {
    console.error('[AUTH_ME] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
