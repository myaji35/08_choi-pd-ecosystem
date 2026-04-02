import { NextRequest, NextResponse } from 'next/server';
import { exchangeTowninGraphCode, getTowninGraphUserInfo } from '@/lib/auth/oauth';
import { createSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const tokenData = await exchangeTowninGraphCode(code);
    const userInfo = await getTowninGraphUserInfo(tokenData.access_token);

    // TODO: members 테이블은 Task 5에서 추가 예정
    // 현재는 try-catch로 감싸서 테이블 미존재 시에도 크래시 방지
    let existing: { id: number; email: string; name: string; slug: string; status: string } | undefined;

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const schema = await import('@/lib/db/schema');
      if ('members' in schema) {
        // TODO: ISS-012 — Replace with direct import once members table is added in Task 5
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const members = (schema as any).members;
        const results = await db
          .select()
          .from(members)
          .where(eq((members as Record<string, import('drizzle-orm').Column>).towningraphUserId, userInfo.id));
        existing = results[0] as typeof existing;
      }
    } catch {
      // members 테이블이 아직 존재하지 않음 - Task 5에서 추가 예정
      console.warn('members 테이블이 아직 존재하지 않습니다. Task 5에서 추가됩니다.');
    }

    if (existing) {
      // 기존 회원 -> 세션 생성
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

    // 신규 회원 -> 승인 신청 페이지로
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
