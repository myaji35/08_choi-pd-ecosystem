import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 미들웨어(Edge Runtime)에서는 직접 상수 정의 (constants.ts와 동일 값)
const SESSION_COOKIE_NAME = 'impd_session';

/**
 * JWT 세션 기반 미들웨어
 * - 보호된 라우트(/admin/*, /pd/*)에 대해 세션 쿠키 존재 여부 확인
 * - 서브도메인 라우팅 (chopd.*, member slug)
 * - JWT 검증은 API 레벨에서 수행 (Edge에서는 쿠키 존재만 체크)
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Handle subdomain routing for chopd (레거시 지원)
  if (hostname.startsWith('chopd.')) {
    if (!pathname.startsWith('/chopd') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = `/chopd${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // /p/chopd → /chopd rewrite (최PD 전용 페이지)
  if (pathname.startsWith('/p/chopd')) {
    const subPath = pathname.replace('/p/chopd', '') || '';
    const url = request.nextUrl.clone();
    url.pathname = `/chopd${subPath}`;
    return NextResponse.rewrite(url);
  }

  // Allow public routes
  if (
    pathname === '/login' ||
    pathname === '/admin/login' ||
    pathname === '/pd/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/p/')
  ) {
    return NextResponse.next();
  }

  // Check for protected admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin/dashboard', request.url));
    }
  }

  // Check for protected PD routes
  if (pathname.startsWith('/pd')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/pd/dashboard', request.url));
    }
  }

  // Check for protected dashboard routes (회원 대시보드)
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
