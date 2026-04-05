// POST /api/impd/start — IMPD 검증 시작 (Townin 로그인 필수)
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }
    if (session.provider !== 'towningraph') {
      return NextResponse.json(
        { error: 'IMPD는 Townin 회원만 신청할 수 있습니다' },
        { status: 403 }
      );
    }

    const member = await db
      .select()
      .from(members)
      .where(eq(members.id, Number(session.userId)))
      .limit(1)
      .then(rows => rows[0]);

    if (!member) {
      return NextResponse.json({ error: '회원 정보를 찾을 수 없습니다' }, { status: 404 });
    }

    if (member.impdStatus === 'completed') {
      return NextResponse.json({ error: '이미 IMPD 검증을 완료했습니다' }, { status: 409 });
    }

    if (member.impdStatus === 'in_progress') {
      // 이미 진행 중이면 현재 상태 반환
      const deadline = member.impdStartedAt
        ? new Date(member.impdStartedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;
      return NextResponse.json({
        message: 'IMPD 검증이 이미 진행 중입니다',
        impdStatus: member.impdStatus,
        impdVerificationId: member.impdVerificationId,
        deadline: deadline?.toISOString(),
      });
    }

    // 신규 시작
    const verificationId = nanoid(16);
    const now = new Date();

    await db
      .update(members)
      .set({
        impdStatus: 'in_progress',
        impdStartedAt: now,
        impdVerificationId: verificationId,
        impdStepsData: JSON.stringify({
          profile: null,
          introduction: null,
          business_plan: null,
        }),
        updatedAt: now,
      })
      .where(eq(members.id, member.id));

    const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      message: 'IMPD 검증이 시작되었습니다. 7일 내에 3단계를 완료하세요.',
      impdStatus: 'in_progress',
      impdVerificationId: verificationId,
      startedAt: now.toISOString(),
      deadline: deadline.toISOString(),
      steps: ['profile', 'introduction', 'business_plan'],
    });
  } catch (error) {
    console.error('[IMPD_START] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
