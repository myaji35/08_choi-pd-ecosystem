import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt } from '@/lib/crypto/encryption';

/**
 * LinkedIn OAuth2 콜백 핸들러
 * 1. 인가 코드를 받아 액세스 토큰으로 교환
 * 2. LinkedIn 프로필 정보를 가져와 settings에 자동 저장
 * 3. 관리자 소셜 미디어 페이지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // 에러 처리
  if (error) {
    console.error('LinkedIn OAuth error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(
      `${baseUrl}/pd/dashboard/social?error=linkedin_denied`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/pd/dashboard/social?error=no_code`
    );
  }

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${baseUrl}/pd/dashboard/social?error=not_configured`
      );
    }

    // 1. 인가 코드를 액세스 토큰으로 교환
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.json();
      console.error('LinkedIn token exchange failed:', errData);
      return NextResponse.redirect(
        `${baseUrl}/pd/dashboard/social?error=token_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. 프로필 정보 가져오기 (UserInfo endpoint)
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let profileUrl = '';
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      // LinkedIn 프로필 URL 구성
      profileUrl = profile.sub
        ? `https://www.linkedin.com/in/${profile.sub}`
        : '';

      // 백그라운드: LinkedIn 프로필 URL을 settings에 자동 저장
      if (profileUrl) {
        const existing = await db.query.settings.findFirst({
          where: eq(settings.key, 'social_linkedin'),
        });

        if (existing) {
          await db.update(settings)
            .set({ value: profileUrl, updatedAt: new Date() })
            .where(eq(settings.key, 'social_linkedin'));
        } else {
          await db.insert(settings).values({ key: 'social_linkedin', value: profileUrl });
        }
      }

      // 액세스 토큰도 암호화하여 저장 (SNS 포스팅에 필요)
      const tokenKey = 'linkedin_access_token';
      const existingToken = await db.query.settings.findFirst({
        where: eq(settings.key, tokenKey),
      });

      const encryptedToken = encrypt(accessToken);
      if (existingToken) {
        await db.update(settings)
          .set({ value: encryptedToken, updatedAt: new Date() })
          .where(eq(settings.key, tokenKey));
      } else {
        await db.insert(settings).values({ key: tokenKey, value: encryptedToken });
      }
    }

    // 3. 성공 리다이렉트
    return NextResponse.redirect(
      `${baseUrl}/pd/dashboard/social?linkedin=connected`
    );
  } catch (err) {
    console.error('LinkedIn OAuth callback error:', err);
    return NextResponse.redirect(
      `${baseUrl}/pd/dashboard/social?error=callback_failed`
    );
  }
}
