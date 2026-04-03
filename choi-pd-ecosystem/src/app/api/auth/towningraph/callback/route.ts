import { NextRequest, NextResponse } from 'next/server';
import { exchangeTowninGraphCode, getTowninGraphUserInfo } from '@/lib/auth/oauth';
import { createSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const tokenData = await exchangeTowninGraphCode(code);
    const userInfo = await getTowninGraphUserInfo(tokenData.access_token);

    // Townin 사용자 정보: id, email, name, role
    const towninUserId = String(userInfo.id);
    const towninEmail = userInfo.email || '';
    const towninName = userInfo.name || userInfo.email || '';
    const towninRole = userInfo.role || 'User';

    // 기존 회원 조회 (towningraphUserId 기준)
    const existing = await db
      .select()
      .from(members)
      .where(eq(members.towningraphUserId, towninUserId))
      .limit(1)
      .then(rows => rows[0]);

    if (existing) {
      // 기존 회원 → Townin 정보 최신화 (upsert)
      await db
        .update(members)
        .set({
          towninEmail,
          towninName,
          towninRole,
          updatedAt: new Date(),
        })
        .where(eq(members.id, existing.id));

      await createSession({
        userId: String(existing.id),
        email: existing.email,
        name: existing.name,
        role: 'member',
        slug: existing.slug ?? undefined,
        status: existing.status ?? undefined,
        provider: 'towningraph',
      });

      if (existing.status === 'approved') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard/pending', request.url));
    }

    // 신규 회원 → members 테이블에 Townin 정보로 upsert 생성
    // slug: Townin 이메일 앞부분 + nanoid 6자리 (충돌 방지)
    const baseSlug = towninEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
    const slug = `${baseSlug}-${nanoid(6)}`;

    const [newMember] = await db
      .insert(members)
      .values({
        towningraphUserId: towninUserId,
        towninEmail,
        towninName,
        towninRole,
        slug,
        name: towninName,
        email: towninEmail,
        status: 'pending_approval',
        impdStatus: 'none',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 신규 회원 임시 세션 (status: new → IMPD 시작 유도)
    await createSession({
      userId: String(newMember.id),
      email: newMember.email,
      name: newMember.name,
      role: 'member',
      slug: newMember.slug,
      status: 'new',
      provider: 'towningraph',
    });

    // IMPD 검증 페이지로 안내 (의지 있는 사람 필터)
    return NextResponse.redirect(new URL('/impd', request.url));
  } catch (error) {
    console.error('TowninGraph OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
