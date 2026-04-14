import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 미들웨어(Edge Runtime)에서는 직접 상수 정의 (constants.ts와 동일 값)
const SESSION_COOKIE_NAME = 'impd_session';

/**
 * JWT payload의 role 필드 디코드 (서명 검증은 API 레벨에서 수행)
 * Edge Runtime에서 jwtVerify 호출 최소화. 위변조 차단이 아닌 "최소한의 role 분기" 용도.
 */
function decodeSessionRole(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    );
    return typeof payload?.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

/**
 * 서브도메인에서 tenantSlug 추출
 * 패턴: {slug}.impd.158.247.235.31.nip.io → slug
 *        {slug}.impd.io → slug (프로덕션)
 *        impd.158.247.235.31.nip.io → null (메인 도메인)
 *        app.impd.io → 'app' (슈퍼어드민)
 *        chopd.* → 'chopd' (레거시 호환)
 */
function extractTenantSlug(hostname: string): string | null {
  const baseDomain = process.env.BASE_DOMAIN || 'impd.158.247.235.31.nip.io';

  // localhost 개발 환경 — 서브도메인 없음
  if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    return null;
  }

  // 레거시 chopd.* 호환 (chopd.localhost, chopd.example.com 등)
  if (hostname.startsWith('chopd.')) {
    return 'chopd';
  }

  // nip.io 패턴: {slug}.impd.{IP}.nip.io
  // 프로덕션 패턴: {slug}.impd.io
  // baseDomain 앞에 붙은 서브도메인 추출
  if (hostname.endsWith(baseDomain) && hostname !== baseDomain) {
    const prefix = hostname.slice(0, -(baseDomain.length + 1)); // +1 for dot
    // prefix가 비어있지 않고, 추가 dot이 없는 경우만 유효 slug
    if (prefix && !prefix.includes('.')) {
      return prefix;
    }
  }

  return null;
}

/**
 * JWT 세션 기반 미들웨어
 * - 멀티테넌트 서브도메인 라우팅 ({slug}.impd.*.nip.io)
 * - 보호된 라우트(/admin/*, /pd/*)에 대해 세션 쿠키 존재 여부 확인
 * - 서브도메인 라우팅 (chopd.*, member slug)
 * - JWT 검증은 API 레벨에서 수행 (Edge에서는 쿠키 존재만 체크)
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ─── 멀티테넌트 서브도메인 라우팅 ─────────────────────────
  const tenantSlug = extractTenantSlug(hostname);

  // tenantSlug가 있으면 x-tenant-slug 헤더 주입
  if (tenantSlug) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', tenantSlug);

    // 'app' 서브도메인 → 슈퍼어드민 (향후 구현)
    if (tenantSlug === 'app') {
      // 슈퍼어드민은 별도 처리 없이 통과 (Phase 4에서 구현)
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // 'chopd' 테넌트 → /chopd prefix rewrite (레거시 호환)
    if (tenantSlug === 'chopd') {
      // 정적 파일, _next, api는 rewrite 대상 제외
      if (!pathname.startsWith('/chopd') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
        const url = request.nextUrl.clone();
        url.pathname = `/chopd${pathname}`;
        return NextResponse.rewrite(url, {
          request: { headers: requestHeaders },
        });
      }
    }

    // 일반 테넌트 및 API 요청 → x-tenant-slug 헤더만 주입, 기존 라우트 그대로 접근
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // /p/chopd → /chopd rewrite (최PD 전용 페이지)
  if (pathname.startsWith('/p/chopd')) {
    const subPath = pathname.replace('/p/chopd', '') || '';
    const url = request.nextUrl.clone();
    url.pathname = `/chopd${subPath}`;
    return NextResponse.rewrite(url);
  }

  // /chopd/admin/* → /admin/* rewrite (URL 통합)
  if (pathname.startsWith('/chopd/admin')) {
    const subPath = pathname.replace('/chopd/admin', '') || '';
    const realPath = `/admin${subPath}`;
    const isDevModeChopd = process.env.DEV_MODE === 'true';

    // 로그인 페이지는 인증 체크 없이 통과
    if (realPath === '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = realPath;
      return NextResponse.rewrite(url);
    }

    // 인증 체크 (개발 모드에서는 스킵)
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie && !isDevModeChopd) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/chopd/admin/dashboard', request.url));
    }

    const url = request.nextUrl.clone();
    url.pathname = realPath;
    return NextResponse.rewrite(url);
  }

  // /chopd/pd/* → /pd/* rewrite (URL 통합)
  if (pathname.startsWith('/chopd/pd')) {
    const subPath = pathname.replace('/chopd/pd', '') || '';
    const realPath = `/pd${subPath}`;
    const isDevModePd = process.env.DEV_MODE === 'true';

    // 로그인 페이지는 인증 체크 없이 통과
    if (realPath === '/pd/login') {
      const url = request.nextUrl.clone();
      url.pathname = realPath;
      return NextResponse.rewrite(url);
    }

    // 인증 체크 (개발 모드에서는 스킵)
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie && !isDevModePd) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/chopd/pd/dashboard', request.url));
    }

    const url = request.nextUrl.clone();
    url.pathname = realPath;
    return NextResponse.rewrite(url);
  }

  // ─── API 인증 가드 (/api/admin/*, /api/pd/*) ────────────────
  // 인증 불필요 공개 API 경로
  const PUBLIC_API_PATHS = [
    '/api/health',
    '/api/onboarding',
    '/api/auth/',
    '/api/courses',
    '/api/tenants/by-slug/',
    '/api/payments/webhook/', // provider 서명 기반 인증 — 세션 쿠키 없이 접근 허용
    '/api/checkout/start', // 내부에서 세션 검증 후 외부 결제로 redirect
    '/api/enrollments/me', // 내부에서 requireAuth() 가드
  ];

  // /api/choi는 GET만 공개 (브랜드 색상 조회), 쓰기는 세션 필요
  const isChoiWriteApi =
    pathname.startsWith('/api/choi') && request.method !== 'GET';

  const isProtectedApi =
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/pd') ||
    isChoiWriteApi;

  if (isProtectedApi) {
    const isPublicApi = PUBLIC_API_PATHS.some((p) =>
      p.endsWith('/') ? pathname.startsWith(p) : pathname === p || pathname.startsWith(p + '/')
    );

    if (!isPublicApi) {
      // 개발 모드에서는 통과
      const isDevMode = process.env.DEV_MODE === 'true';

      if (!isDevMode) {
        const sessionCookie =
          request.cookies.get(SESSION_COOKIE_NAME)?.value ||
          request.cookies.get('admin_session')?.value;
        const clerkUserId = request.headers.get('x-clerk-user-id');

        if (!sessionCookie && !clerkUserId) {
          return NextResponse.json(
            { error: '인증이 필요합니다' },
            { status: 401 }
          );
        }
      }
    }
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

  // 개발 모드에서는 페이지 인증 체크 스킵
  const isDevMode = process.env.DEV_MODE === 'true';

  // Check for protected admin routes — admin role 필수
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie && !isDevMode) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/chopd/admin/dashboard', request.url));
    }
    if (sessionCookie && !isDevMode) {
      const role = decodeSessionRole(sessionCookie);
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/login?error=admin_required&callbackUrl=/chopd/admin/dashboard', request.url));
      }
    }
  }

  // Check for protected PD routes — 로그인 필수 (role은 /pd 내부에서 구분)
  if (pathname.startsWith('/pd') && pathname !== '/pd/login') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie && !isDevMode) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/chopd/pd/dashboard', request.url));
    }
  }

  // Check for protected /choi/admin routes (최PD 전용 관리 UI)
  if (pathname.startsWith('/choi/admin')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie && !isDevMode) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/choi/admin', request.url));
    }
  }

  // Check for protected dashboard routes (회원 대시보드)
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie && !isDevMode) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/dashboard', request.url));
    }
  }

  // ─── 테넌트 vanity URL: /{slug} → /p/{slug} rewrite ──────────
  // 알려진 라우트가 아닌 최상위 경로는 테넌트 slug로 간주
  const KNOWN_PREFIXES = [
    '/admin', '/pd', '/chopd', '/choi', '/api', '/login', '/onboarding',
    '/signup', '/dashboard', '/p/', '/education', '/media', '/works',
    '/community', '/pricing', '/_next', '/images', '/icons', '/fonts',
  ];
  const isKnownRoute = KNOWN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isRootPath = pathname === '/';

  if (!isKnownRoute && !isRootPath && /^\/[a-z0-9][a-z0-9-]*/.test(pathname)) {
    // /{slug}/settings, /{slug}/dashboard 등 → /pd/* 로 rewrite
    const slugMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]*)\/(.+)$/);
    if (slugMatch) {
      const subPath = slugMatch[2]; // settings, dashboard, etc.
      const url = request.nextUrl.clone();
      url.pathname = `/pd/${subPath}`;
      return NextResponse.rewrite(url);
    }

    // /{slug} (서브경로 없음) → /p/{slug} rewrite
    if (/^\/[a-z0-9][a-z0-9-]*$/.test(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = `/p${pathname}`;
      return NextResponse.rewrite(url);
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
