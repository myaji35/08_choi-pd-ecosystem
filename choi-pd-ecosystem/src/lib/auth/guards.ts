import { NextResponse } from 'next/server';
import { getSession, type SessionPayload } from './session';

export type Role = 'admin' | 'member';
export type RouteDomain = 'admin' | 'pd' | 'choi';

/**
 * API route 인증/권한 가드 (Node runtime 전용 — Edge middleware와 별개)
 *
 * 사용 예시:
 *   export async function POST(req: Request) {
 *     const guard = await requireSession({ role: 'admin' });
 *     if (guard instanceof NextResponse) return guard;
 *     const { session } = guard;
 *     // ... 이후 session.userId, session.role 신뢰 사용
 *   }
 */
export async function requireSession(opts?: {
  role?: Role;
  domain?: RouteDomain;
}): Promise<{ session: SessionPayload } | NextResponse> {
  // dev 모드에선 mock 세션 허용 (기존 동작 유지)
  const isDevMode = process.env.DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  if (isDevMode) {
    return {
      session: {
        userId: 'dev-user',
        email: 'dev@impd.local',
        name: 'Dev',
        role: (opts?.role ?? 'admin') as Role,
        provider: 'google',
      },
    };
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (opts?.role && session.role !== opts.role) {
    return NextResponse.json(
      { error: `권한이 부족합니다 (required: ${opts.role})` },
      { status: 403 }
    );
  }

  return { session };
}

/**
 * admin 전용 API route 가드
 */
export async function requireAdmin(): Promise<{ session: SessionPayload } | NextResponse> {
  return requireSession({ role: 'admin' });
}

/**
 * 로그인만 필요한 (role 무관) 라우트 가드
 */
export async function requireAuth(): Promise<{ session: SessionPayload } | NextResponse> {
  return requireSession();
}
