// POST /api/impd/submit-step — IMPD 단계 제출
// Steps: profile | introduction | business_plan
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const STEP_VALIDATORS: Record<string, (data: Record<string, unknown>) => string | null> = {
  profile: (data) => {
    if (!data.name || String(data.name).trim().length < 2) return '이름을 2자 이상 입력하세요';
    if (!data.photo) return '프로필 사진을 업로드하세요';
    if (!data.intro || String(data.intro).trim().length < 10) return '소개를 10자 이상 입력하세요';
    return null;
  },
  introduction: (data) => {
    const text = String(data.text || '').trim();
    if (text.length < 100) return `자기소개를 100자 이상 작성하세요 (현재: ${text.length}자)`;
    return null;
  },
  business_plan: (data) => {
    const what = String(data.what || '').trim();
    const why = String(data.why || '').trim();
    const total = what.length + why.length;
    if (what.length < 50) return `"무엇을" 항목을 50자 이상 작성하세요 (현재: ${what.length}자)`;
    if (why.length < 50) return `"왜" 항목을 50자 이상 작성하세요 (현재: ${why.length}자)`;
    if (total < 200) return `사업 계획을 합계 200자 이상 작성하세요 (현재: ${total}자)`;
    return null;
  },
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { step, data } = body as { step: string; data: Record<string, unknown> };

  if (!step || !['profile', 'introduction', 'business_plan'].includes(step)) {
    return NextResponse.json(
      { error: 'step은 profile | introduction | business_plan 중 하나여야 합니다' },
      { status: 400 }
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

  if (member.impdStatus !== 'in_progress') {
    return NextResponse.json(
      { error: 'IMPD 검증이 진행 중이 아닙니다. 먼저 /api/impd/start를 호출하세요' },
      { status: 409 }
    );
  }

  // 7일 데드라인 체크
  if (member.impdStartedAt) {
    const elapsed = Date.now() - member.impdStartedAt.getTime();
    if (elapsed > SEVEN_DAYS_MS) {
      await db
        .update(members)
        .set({ impdStatus: 'rejected', updatedAt: new Date() })
        .where(eq(members.id, member.id));
      return NextResponse.json(
        { error: '7일 데드라인이 초과되었습니다. IMPD가 거부되었습니다.' },
        { status: 410 }
      );
    }
  }

  // 단계별 유효성 검사
  const validationError = STEP_VALIDATORS[step]?.(data || {});
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  // 기존 steps 데이터 업데이트
  const stepsData: Record<string, unknown> = member.impdStepsData
    ? JSON.parse(member.impdStepsData as string)
    : { profile: null, introduction: null, business_plan: null };

  stepsData[step] = {
    ...data,
    submittedAt: new Date().toISOString(),
  };

  await db
    .update(members)
    .set({
      impdStepsData: JSON.stringify(stepsData),
      updatedAt: new Date(),
    })
    .where(eq(members.id, member.id));

  const completedSteps = ['profile', 'introduction', 'business_plan'].filter(
    s => stepsData[s] !== null && stepsData[s] !== undefined
  );

  return NextResponse.json({
    message: `${step} 단계가 제출되었습니다`,
    step,
    completedStepsCount: completedSteps.length,
    totalSteps: 3,
    allStepsCompleted: completedSteps.length === 3,
    completedSteps,
  });
}
