import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * LinkedIn OAuth2 인증 시작
 * GET /api/auth/linkedin → LinkedIn 로그인 페이지로 리다이렉트
 *
 * 관리자가 소셜 미디어 관리 페이지에서 "LinkedIn 연결" 클릭 시 호출
 * 인증 완료 후 /api/auth/linkedin/callback 으로 돌아옴
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'LinkedIn API가 설정되지 않았습니다. LINKEDIN_CLIENT_ID 환경변수를 설정해주세요.' },
      { status: 500 }
    );
  }

  // CSRF 방지용 state 파라미터
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid profile w_member_social',
  });

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return NextResponse.redirect(linkedInAuthUrl);
}
