// GET /api/impd/status — IMPD 진행 상태 확인
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getStepStatus(stepsData: Record<string, unknown>, step: string) {
  return stepsData[step] !== null && stepsData[step] !== undefined
    ? 'completed'
    : 'pending';
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
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

    const stepsData: Record<string, unknown> = member.impdStepsData
      ? JSON.parse(member.impdStepsData as string)
      : {};

    // 7일 경과 여부 체크 → 자동 rejected
    let impdStatus = member.impdStatus;
    let isExpired = false;

    if (impdStatus === 'in_progress' && member.impdStartedAt) {
      const elapsed = Date.now() - member.impdStartedAt.getTime();
      if (elapsed > SEVEN_DAYS_MS) {
        isExpired = true;
        impdStatus = 'rejected';
        // DB 업데이트 (비동기 — 응답 차단 안 함)
        db.update(members)
          .set({ impdStatus: 'rejected', updatedAt: new Date() })
          .where(eq(members.id, member.id))
          .catch(console.error);
      }
    }

    const deadline = member.impdStartedAt
      ? new Date(member.impdStartedAt.getTime() + SEVEN_DAYS_MS)
      : null;

    const remainingMs = deadline ? Math.max(0, deadline.getTime() - Date.now()) : null;
    const remainingDays = remainingMs !== null ? Math.ceil(remainingMs / (1000 * 60 * 60 * 24)) : null;

    const completedSteps = ['profile', 'introduction', 'business_plan'].filter(
      step => getStepStatus(stepsData, step) === 'completed'
    );

    return NextResponse.json({
      impdStatus,
      isExpired,
      impdVerificationId: member.impdVerificationId,
      startedAt: member.impdStartedAt?.toISOString() ?? null,
      completedAt: member.impdCompletedAt?.toISOString() ?? null,
      deadline: deadline?.toISOString() ?? null,
      remainingDays,
      steps: {
        profile: getStepStatus(stepsData, 'profile'),
        introduction: getStepStatus(stepsData, 'introduction'),
        business_plan: getStepStatus(stepsData, 'business_plan'),
      },
      completedStepsCount: completedSteps.length,
      totalSteps: 3,
      towninInfo: {
        userId: member.towningraphUserId,
        email: member.towninEmail,
        name: member.towninName,
        role: member.towninRole,
      },
    });
  } catch (error) {
    console.error('[IMPD_STATUS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
