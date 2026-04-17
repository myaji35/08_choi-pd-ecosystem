import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members, memberFollowers } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

async function getMember(slug: string) {
  return db.select().from(members).where(eq(members.slug, slug)).get();
}

// GET — 팔로우 수 + 현재 사용자 팔로우 여부
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) {
    return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
  }
  const session = await getSession();
  const [count, my] = await Promise.all([
    db
      .select({ c: sql<number>`count(*)` })
      .from(memberFollowers)
      .where(and(eq(memberFollowers.memberId, member.id), eq(memberFollowers.status, 'active')))
      .get(),
    session?.userId
      ? db
          .select()
          .from(memberFollowers)
          .where(
            and(
              eq(memberFollowers.memberId, member.id),
              eq(memberFollowers.followerUserId, session.userId)
            )
          )
          .get()
      : null,
  ]);
  return NextResponse.json({
    success: true,
    followerCount: Number(count?.c || 0),
    isFollowing: !!(my && my.status === 'active'),
  });
}

// POST — 팔로우 토글 or 이메일 구독
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const member = await getMember(slug);
    if (!member) {
      return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { email, name, subscribeNewsletter, subscribeLiveAlert } = body as {
      email?: string;
      name?: string;
      subscribeNewsletter?: boolean;
      subscribeLiveAlert?: boolean;
    };
    const session = await getSession();

    if (!session?.userId && !email) {
      return NextResponse.json(
        { success: false, error: '로그인 또는 이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 기존 레코드 찾기
    const existing = session?.userId
      ? await db
          .select()
          .from(memberFollowers)
          .where(
            and(
              eq(memberFollowers.memberId, member.id),
              eq(memberFollowers.followerUserId, session.userId)
            )
          )
          .get()
      : email
        ? await db
            .select()
            .from(memberFollowers)
            .where(
              and(
                eq(memberFollowers.memberId, member.id),
                eq(memberFollowers.followerEmail, email)
              )
            )
            .get()
        : null;

    if (existing) {
      if (existing.status === 'active') {
        // 토글 해제
        await db
          .update(memberFollowers)
          .set({ status: 'unsubscribed', updatedAt: new Date() })
          .where(eq(memberFollowers.id, existing.id));
        return NextResponse.json({ success: true, isFollowing: false, message: '팔로우를 취소했습니다.' });
      }
      // 재구독
      await db
        .update(memberFollowers)
        .set({
          status: 'active',
          subscribeNewsletter: subscribeNewsletter ?? existing.subscribeNewsletter,
          subscribeLiveAlert: subscribeLiveAlert ?? existing.subscribeLiveAlert,
          updatedAt: new Date(),
        })
        .where(eq(memberFollowers.id, existing.id));
      return NextResponse.json({ success: true, isFollowing: true, message: '다시 팔로우합니다.' });
    }

    await db.insert(memberFollowers).values({
      tenantId: member.tenantId || 1,
      memberId: member.id,
      followerUserId: session?.userId || null,
      followerEmail: email || session?.email || null,
      followerName: name || session?.name || null,
      subscribeNewsletter: subscribeNewsletter ?? true,
      subscribeLiveAlert: subscribeLiveAlert ?? true,
      status: 'active',
    });

    return NextResponse.json({ success: true, isFollowing: true, message: '팔로우 완료!' });
  } catch (error) {
    console.error('[follow] failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'follow failed' },
      { status: 500 }
    );
  }
}
