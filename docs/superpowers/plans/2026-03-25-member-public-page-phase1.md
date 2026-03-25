# 회원 개인비즈니스 페이지 Phase 1 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clerk를 제거하고 Google Workspace + TowninGraph OAuth 통합 인증으로 전환, members 테이블 추가, 서브도메인 미들웨어 구현

**Architecture:** Clerk 의존성을 완전히 제거하고, httpOnly 쿠키 기반 JWT 세션으로 교체. 관리자는 Google OAuth, 회원은 TowninGraph OAuth로 인증. middleware.ts에서 서브도메인 slug를 추출하여 회원 공개 페이지로 rewrite.

**Tech Stack:** Next.js 16, Drizzle ORM (SQLite), jose (JWT), Google OAuth 2.0, TowninGraph OAuth 2.0

**Spec:** `docs/superpowers/specs/2026-03-25-member-public-page-design.md`

---

## File Structure

### 삭제할 파일/코드
| 파일 | 변경 |
|------|------|
| `package.json` | `@clerk/nextjs` 제거 |
| `src/app/layout.tsx` | `ClerkProvider` import/래핑 제거 |
| `src/middleware.ts` | Clerk 미들웨어 전면 교체 |
| `src/lib/auth-utils.ts` | Clerk import 제거, JWT 기반으로 교체 |
| `src/app/admin/login/page.tsx` | `<SignIn>` 제거, OAuth 로그인으로 교체 |
| `src/app/pd/login/page.tsx` | `<SignIn>` 제거, OAuth 로그인으로 교체 |
| `src/app/admin/dashboard/page.tsx` | `useUser/useClerk` → JWT 세션으로 교체 |
| `src/app/pd/dashboard/page.tsx` | `useUser/useClerk` → JWT 세션으로 교체 |
| `src/components/layout/Header.tsx` | `useUser` → JWT 세션으로 교체 |
| `src/components/layout/NotionHeader.tsx` | `useUser` → JWT 세션으로 교체 |
| `.env.example` | Clerk 변수 제거, OAuth 변수 추가 |

### 신규 파일
| 파일 | 역할 |
|------|------|
| `src/lib/auth/session.ts` | JWT 세션 생성/검증/갱신 유틸리티 |
| `src/lib/auth/oauth.ts` | Google + TowninGraph OAuth 헬퍼 |
| `src/lib/auth/constants.ts` | 예약어, 허용 도메인, 설정 상수 |
| `src/app/login/page.tsx` | 통합 로그인 페이지 |
| `src/app/api/auth/google/route.ts` | Google OAuth 시작 |
| `src/app/api/auth/google/callback/route.ts` | Google OAuth 콜백 |
| `src/app/api/auth/towningraph/route.ts` | TowninGraph OAuth 시작 |
| `src/app/api/auth/towningraph/callback/route.ts` | TowninGraph OAuth 콜백 |
| `src/app/api/auth/logout/route.ts` | 로그아웃 (기존 대체) |
| `src/app/api/auth/me/route.ts` | 현재 세션 사용자 정보 |
| `src/app/member/[slug]/page.tsx` | 회원 공개 페이지 (프로필) |
| `src/app/member/[slug]/layout.tsx` | 회원 페이지 레이아웃 |
| `src/hooks/use-session.ts` | 클라이언트 세션 훅 (useUser 대체) |

### 수정할 파일 (스키마)
| 파일 | 변경 |
|------|------|
| `src/lib/db/schema.ts` | members + 6개 모듈 테이블 추가 |

---

## Task 1: Clerk 제거 + JWT 세션 인프라

**Files:**
- Create: `src/lib/auth/session.ts`
- Create: `src/lib/auth/constants.ts`
- Create: `src/hooks/use-session.ts`
- Modify: `package.json` (Clerk 제거, jose 추가)
- Modify: `src/app/layout.tsx` (ClerkProvider 제거)

- [ ] **Step 1: jose 설치 + Clerk 제거**

```bash
cd choi-pd-ecosystem
npm install jose
npm uninstall @clerk/nextjs
```

- [ ] **Step 2: 인증 상수 파일 생성**

`src/lib/auth/constants.ts`:
```typescript
export const RESERVED_SLUGS = [
  'admin', 'api', 'pd', 'www', 'mail', 'ftp',
  'dashboard', '_next', 'static', 'public',
  'login', 'signup', 'auth', 'oauth', 'member',
  'chopd',
];

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 30;

export const SESSION_COOKIE_NAME = 'impd_session';
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24시간

export const ADMIN_ALLOWED_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);
```

- [ ] **Step 3: JWT 세션 유틸리티 생성**

`src/lib/auth/session.ts`:
```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from './constants';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  slug?: string;
  status?: string;
  provider: 'google' | 'towningraph';
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: 클라이언트 세션 훅 생성**

`src/hooks/use-session.ts`:
```typescript
'use client';

import { useState, useEffect } from 'react';

interface User {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  slug?: string;
  status?: string;
  provider: 'google' | 'towningraph';
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  return { user, loading, logout };
}
```

- [ ] **Step 5: layout.tsx에서 ClerkProvider 제거**

`src/app/layout.tsx` 변경:
- `import { ClerkProvider } from '@clerk/nextjs';` 삭제
- `<ClerkProvider>` 래퍼 제거, `<html>` 직접 반환

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "refactor: Clerk 제거 + JWT 세션 인프라 구축

- @clerk/nextjs 제거, jose 추가
- src/lib/auth/session.ts: JWT 세션 생성/검증/소멸
- src/lib/auth/constants.ts: 예약어, slug 규칙, 설정
- src/hooks/use-session.ts: 클라이언트 세션 훅
- ClerkProvider 래핑 제거"
```

---

## Task 2: OAuth API 라우트 (Google + TowninGraph)

**Files:**
- Create: `src/lib/auth/oauth.ts`
- Create: `src/app/api/auth/google/route.ts`
- Create: `src/app/api/auth/google/callback/route.ts`
- Create: `src/app/api/auth/towningraph/route.ts`
- Create: `src/app/api/auth/towningraph/callback/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`

- [ ] **Step 1: OAuth 헬퍼 생성**

`src/lib/auth/oauth.ts`:
```typescript
import { ADMIN_ALLOWED_EMAILS } from './constants';

// Google OAuth
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

export async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_ALLOWED_EMAILS.some(allowed => {
    if (allowed.startsWith('@')) return email.endsWith(allowed);
    return email === allowed;
  });
}

// TowninGraph OAuth
export function getTowninGraphAuthUrl(state: string): string {
  const baseUrl = process.env.TOWNINGRAPH_OAUTH_URL || '';
  const params = new URLSearchParams({
    client_id: process.env.TOWNINGRAPH_CLIENT_ID || '',
    redirect_uri: process.env.TOWNINGRAPH_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'profile email',
    state,
  });
  return `${baseUrl}/authorize?${params}`;
}

export async function exchangeTowninGraphCode(code: string) {
  const baseUrl = process.env.TOWNINGRAPH_OAUTH_URL || '';
  const res = await fetch(`${baseUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.TOWNINGRAPH_CLIENT_ID || '',
      client_secret: process.env.TOWNINGRAPH_CLIENT_SECRET || '',
      redirect_uri: process.env.TOWNINGRAPH_REDIRECT_URI || '',
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

export async function getTowninGraphUserInfo(accessToken: string) {
  const baseUrl = process.env.TOWNINGRAPH_OAUTH_URL?.replace('/oauth', '') || '';
  const res = await fetch(`${baseUrl}/api/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}
```

- [ ] **Step 2: Google OAuth 시작 라우트**

`src/app/api/auth/google/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getGoogleAuthUrl } from '@/lib/auth/oauth';

export async function GET() {
  const state = nanoid();
  const url = getGoogleAuthUrl(state);
  return NextResponse.redirect(url);
}
```

- [ ] **Step 3: Google OAuth 콜백 라우트**

`src/app/api/auth/google/callback/route.ts`:
```typescript
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
```

- [ ] **Step 4: TowninGraph OAuth 시작 라우트**

`src/app/api/auth/towningraph/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getTowninGraphAuthUrl } from '@/lib/auth/oauth';

export async function GET() {
  const state = nanoid();
  const url = getTowninGraphAuthUrl(state);
  return NextResponse.redirect(url);
}
```

- [ ] **Step 5: TowninGraph OAuth 콜백 라우트**

`src/app/api/auth/towningraph/callback/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exchangeTowninGraphCode, getTowninGraphUserInfo } from '@/lib/auth/oauth';
import { createSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const tokenData = await exchangeTowninGraphCode(code);
    const userInfo = await getTowninGraphUserInfo(tokenData.access_token);

    // 기존 회원 조회
    const [existing] = await db
      .select()
      .from(members)
      .where(eq(members.towningraphUserId, userInfo.id));

    if (existing) {
      // 기존 회원 → 세션 생성
      await createSession({
        userId: String(existing.id),
        email: existing.email,
        name: existing.name,
        role: 'member',
        slug: existing.slug,
        status: existing.status,
        provider: 'towningraph',
      });

      if (existing.status === 'approved') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard/pending', request.url));
    }

    // 신규 회원 → 승인 신청 페이지로
    // 임시 세션 생성 (status: new)
    await createSession({
      userId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || userInfo.email,
      role: 'member',
      status: 'new',
      provider: 'towningraph',
    });

    return NextResponse.redirect(new URL('/dashboard/apply', request.url));
  } catch (error) {
    console.error('TowninGraph OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
```

- [ ] **Step 6: 로그아웃 + 세션 조회 API**

`src/app/api/auth/logout/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true });
}
```

`src/app/api/auth/me/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: Google + TowninGraph OAuth API 라우트 구현

- src/lib/auth/oauth.ts: OAuth 헬퍼 (Google + TowninGraph)
- /api/auth/google, /api/auth/google/callback
- /api/auth/towningraph, /api/auth/towningraph/callback
- /api/auth/logout, /api/auth/me"
```

---

## Task 3: 통합 로그인 페이지 + 기존 로그인 교체

**Files:**
- Create: `src/app/login/page.tsx`
- Modify: `src/app/admin/login/page.tsx` (Clerk 제거 → 리다이렉트)
- Modify: `src/app/pd/login/page.tsx` (Clerk 제거 → 리다이렉트)
- Modify: `src/components/layout/Header.tsx` (useUser → useSession)
- Modify: `src/components/layout/NotionHeader.tsx` (useUser → useSession)
- Modify: `src/app/admin/dashboard/page.tsx` (useUser/useClerk → useSession)
- Modify: `src/app/pd/dashboard/page.tsx` (useUser/useClerk → useSession)
- Modify: `src/lib/auth-utils.ts` (Clerk → JWT)

- [ ] **Step 1: 통합 로그인 페이지 생성**

`src/app/login/page.tsx`:
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">imPD 로그인</h1>
          <p className="mt-2 text-sm text-gray-600">
            개인비즈니스 페이지 플랫폼
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error === 'not_admin' && '관리자 권한이 없는 계정입니다.'}
            {error === 'oauth_failed' && '로그인에 실패했습니다. 다시 시도해주세요.'}
            {error === 'no_code' && '인증 코드가 없습니다.'}
          </div>
        )}

        <div className="space-y-4">
          <a
            href="/api/auth/towningraph"
            className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition"
          >
            TowninGraph로 로그인
          </a>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400">또는</span>
            </div>
          </div>

          <a
            href="/api/auth/google"
            className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition"
          >
            Google로 로그인 (관리자)
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          TowninGraph 계정이 없으신가요?{' '}
          <a href="https://towningraph.townin.net" className="text-blue-500 hover:underline">
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: 기존 admin/login, pd/login을 /login으로 리다이렉트하도록 수정**

두 파일 모두 Clerk `<SignIn>` 제거, `/login`으로 리다이렉트 처리.

- [ ] **Step 3: Header, NotionHeader에서 useUser → useSession 교체**

`import { useUser } from '@clerk/nextjs'` → `import { useSession } from '@/hooks/use-session'`
`const { user } = useUser()` → `const { user } = useSession()`

- [ ] **Step 4: admin/dashboard, pd/dashboard에서 useUser/useClerk → useSession 교체**

`useClerk().signOut()` → `useSession().logout()`

- [ ] **Step 5: auth-utils.ts Clerk → JWT 교체**

`import { currentUser } from '@clerk/nextjs/server'` 삭제
`getSession()`을 사용하도록 변경

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: 통합 로그인 페이지 + Clerk 코드 전면 교체

- /login: TowninGraph + Google OAuth 통합 로그인
- Header/NotionHeader: useSession 훅으로 교체
- admin/pd 대시보드: useSession으로 교체
- auth-utils.ts: JWT 세션 기반으로 교체"
```

---

## Task 4: 미들웨어 전면 교체 (서브도메인 + 인증)

**Files:**
- Modify: `src/middleware.ts` (전면 교체)

- [ ] **Step 1: middleware.ts 전면 교체**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';
import { SESSION_COOKIE_NAME, RESERVED_SLUGS } from '@/lib/auth/constants';

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'impd.townin.net';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // 1. 서브도메인 처리: {slug}.impd.townin.net → /member/{slug}
  if (hostname !== BASE_DOMAIN
      && hostname !== `www.${BASE_DOMAIN}`
      && !hostname.startsWith('localhost')
      && hostname.endsWith(`.${BASE_DOMAIN}`)) {
    const slug = hostname.replace(`.${BASE_DOMAIN}`, '');
    if (!RESERVED_SLUGS.includes(slug)) {
      const url = request.nextUrl.clone();
      url.pathname = `/member/${slug}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 로컬 개발: chopd.localhost → /chopd rewrite (기존 유지)
  if (hostname.startsWith('chopd.')) {
    const url = request.nextUrl.clone();
    url.pathname = `/chopd${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. 인증 보호 라우트
  const protectedRoutes = ['/admin', '/dashboard', '/pd'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await verifySessionToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // 역할 기반 접근 제어
    if (pathname.startsWith('/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?error=not_admin', request.url));
    }
    if (pathname.startsWith('/dashboard') && session.role !== 'member') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/pd') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. 로그인 페이지 — 이미 로그인된 사용자 리다이렉트
  if (pathname === '/login') {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        const dest = session.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|public/).*)',
  ],
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/middleware.ts
git commit -m "feat: 미들웨어 전면 교체 — 서브도메인 라우팅 + JWT 인증

- 서브도메인 slug 추출 → /member/{slug} rewrite
- 예약어 slug 차단
- /admin, /dashboard, /pd 역할 기반 접근 제어
- 로그인 페이지 자동 리다이렉트"
```

---

## Task 5: Members 테이블 + 모듈 테이블 스키마

**Files:**
- Modify: `src/lib/db/schema.ts` (members + 6개 모듈 테이블 추가)

- [ ] **Step 1: schema.ts에 members 테이블 추가**

기존 `distributors` 테이블 아래에 `members` 테이블과 6개 모듈 테이블 추가.
설계서 Section 6의 스키마를 Drizzle ORM 문법으로 변환.

- [ ] **Step 2: drizzle-kit push로 스키마 동기화**

```bash
npx drizzle-kit push
```

- [ ] **Step 3: 커밋**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: members + 모듈 테이블 6개 스키마 추가

- members: 회원 프로필, slug, 상태, 플랜, 모듈 설정
- member_portfolio_items, member_services, member_posts
- member_inquiries, member_reviews, member_bookings"
```

---

## Task 6: 회원 승인 신청 + 관리자 승인 플로우

**Files:**
- Create: `src/app/dashboard/apply/page.tsx` (승인 신청 폼)
- Create: `src/app/dashboard/pending/page.tsx` (승인 대기 화면)
- Create: `src/app/api/dashboard/apply/route.ts` (승인 신청 API)
- Create: `src/app/admin/members/page.tsx` (관리자 회원 관리)
- Create: `src/app/api/admin/members/route.ts` (회원 목록/승인 API)
- Create: `src/app/api/admin/members/[id]/route.ts` (회원 상세/승인/거부)

- [ ] **Step 1: 승인 신청 페이지 생성**

`src/app/dashboard/apply/page.tsx`:
- slug 입력 (실시간 가용성 체크)
- 사업자 유형, 지역, 소개글 입력
- POST `/api/dashboard/apply` → members 테이블에 INSERT

- [ ] **Step 2: 승인 대기 페이지 생성**

`src/app/dashboard/pending/page.tsx`:
- "승인 대기 중입니다" 안내
- 상태 자동 갱신 (polling)

- [ ] **Step 3: 승인 신청 API**

`src/app/api/dashboard/apply/route.ts`:
- slug 유효성 검증 (길이, 형식, 예약어, 중복)
- members 테이블에 INSERT (status: pending_approval)

- [ ] **Step 4: 관리자 회원 관리 페이지**

`src/app/admin/members/page.tsx`:
- 회원 목록 (상태 필터: pending/approved/rejected/suspended)
- 승인/거부 버튼 + 사유 입력

- [ ] **Step 5: 관리자 회원 API**

`src/app/api/admin/members/route.ts`: GET (목록)
`src/app/api/admin/members/[id]/route.ts`: GET/PUT (상세/승인/거부)

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: 회원 승인 신청 + 관리자 승인/거부 플로우

- /dashboard/apply: 승인 신청 폼 (slug 선택)
- /dashboard/pending: 승인 대기 안내
- /admin/members: 관리자 회원 관리 (승인/거부)
- API: /api/dashboard/apply, /api/admin/members"
```

---

## Task 7: 회원 공개 페이지 (프로필 모듈)

**Files:**
- Create: `src/app/member/[slug]/page.tsx`
- Create: `src/app/member/[slug]/layout.tsx`
- Create: `src/app/member/[slug]/not-found.tsx`
- Create: `src/app/api/members/[slug]/route.ts`

- [ ] **Step 1: 회원 공개 데이터 API**

`src/app/api/members/[slug]/route.ts`:
- slug로 회원 조회 → status 확인 → 공개 데이터 반환
- 비활성 회원: 적절한 에러 메시지

- [ ] **Step 2: 회원 페이지 레이아웃**

`src/app/member/[slug]/layout.tsx`:
- 간결한 공개 페이지 레이아웃 (Header 없이 독립)

- [ ] **Step 3: 회원 프로필 페이지**

`src/app/member/[slug]/page.tsx`:
- 커버 이미지 + 프로필 사진 + 이름 + 소개
- SNS 링크 아이콘
- 활성화된 모듈 탭 네비게이션

- [ ] **Step 4: 404 페이지**

`src/app/member/[slug]/not-found.tsx`:
- 존재하지 않거나 비활성 회원일 때 표시

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 회원 공개 페이지 — 프로필 모듈

- /member/[slug]: 회원 공개 프로필 페이지
- 커버 이미지, 프로필, SNS 링크, 모듈 탭
- 비활성 회원 404 처리
- API: /api/members/[slug]"
```

---

## Task 8: 환경변수 + 최종 정리

**Files:**
- Modify: `.env.example` (Clerk 제거, OAuth 추가)
- Modify: `.env.production.example` (동일)

- [ ] **Step 1: 환경변수 파일 업데이트**

```env
# Clerk 관련 모두 삭제 후 추가:

# Google OAuth (관리자 인증)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://impd.townin.net/api/auth/google/callback

# TowninGraph OAuth (회원 인증)
TOWNINGRAPH_CLIENT_ID=
TOWNINGRAPH_CLIENT_SECRET=
TOWNINGRAPH_OAUTH_URL=https://towningraph.townin.net/oauth
TOWNINGRAPH_REDIRECT_URI=https://impd.townin.net/api/auth/towningraph/callback

# 관리자 허용 이메일 (쉼표 구분)
ADMIN_ALLOWED_EMAILS=admin@gagahoho.com

# 서브도메인 베이스 도메인
BASE_DOMAIN=impd.townin.net
```

- [ ] **Step 2: NEXT_PUBLIC_DEV_MODE 관련 코드 정리**

dev-auth 쿠키 방식 완전 제거. 로컬에서도 OAuth로 동작 (localhost 허용 처리).

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit 2>&1 | grep -v "e2e\|drizzle.config"
```

- [ ] **Step 4: 최종 커밋 + push**

```bash
git add -A
git commit -m "chore: 환경변수 정리 + Clerk 흔적 완전 제거

- .env.example: Clerk 제거, Google/TowninGraph OAuth 추가
- DEV_MODE 쿠키 인증 제거
- TypeScript 타입 체크 통과"
git push
```

---

## 구현 순서 요약

| Task | 내용 | 예상 시간 |
|:----:|------|:---------:|
| 1 | Clerk 제거 + JWT 세션 인프라 | 15분 |
| 2 | OAuth API 라우트 (Google + TowninGraph) | 20분 |
| 3 | 통합 로그인 + 기존 컴포넌트 교체 | 20분 |
| 4 | 미들웨어 전면 교체 | 10분 |
| 5 | Members + 모듈 테이블 스키마 | 15분 |
| 6 | 승인 신청 + 관리자 승인 플로우 | 25분 |
| 7 | 회원 공개 페이지 (프로필) | 15분 |
| 8 | 환경변수 + 최종 정리 | 10분 |
