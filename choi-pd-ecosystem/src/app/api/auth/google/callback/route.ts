import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCode, getGoogleUserInfo, isAdminEmail } from '@/lib/auth/oauth';
import { createSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const tokenData = await exchangeGoogleCode(code);
    const userInfo = await getGoogleUserInfo(tokenData.access_token);

    if (!isAdminEmail(userInfo.email)) {
      return NextResponse.redirect(new URL('/login?error=not_admin', request.url));
    }

    await createSession({
      userId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || userInfo.email,
      role: 'admin',
      provider: 'google',
    });

    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
