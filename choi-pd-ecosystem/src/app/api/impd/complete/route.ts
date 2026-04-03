// POST /api/impd/complete — IMPD 최종 완료 & Townin 역할 업그레이드 호출
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TOWNIN_API_BASE = process.env.TOWNINGRAPH_API_URL || 'https://townin.net/api';
const TOWNIN_API_KEY = process.env.TOWNINGRAPH_API_KEY || '';

async function upgradeTowninRole(towninUserId: string): Promise<boolean> {
  try {
    const res = await fetch(`${TOWNIN_API_BASE}/users/${towninUserId}/upgrade-role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TOWNIN_API_KEY,
      },
      body: JSON.stringify({ role: 'Merchant', source: 'impd_verified' }),
    });
    return res.ok;
  } catch (err) {
    console.error('Townin upgrade-role API error:', err);
    return false;
  }
}

export async function POST() {
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

  if (member.impdStatus === 'completed') {
    return NextResponse.json({ error: '이미 IMPD 검증을 완료했습니다' }, { status: 409 });
  }

  if (member.impdStatus !== 'in_progress') {
    return NextResponse.json(
      { error: 'IMPD 검증이 진행 중이 아닙니다' },
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
        { error: '7일 데드라인이 초과되었습니다. 의지 부족으로 IMPD가 거부되었습니다.' },
        { status: 410 }
      );
    }
  }

  // 3단계 모두 완료 여부 확인
  const stepsData: Record<string, unknown> = member.impdStepsData
    ? JSON.parse(member.impdStepsData as string)
    : {};

  const requiredSteps = ['profile', 'introduction', 'business_plan'];
  const incompleteSteps = requiredSteps.filter(
    step => stepsData[step] === null || stepsData[step] === undefined
  );

  if (incompleteSteps.length > 0) {
    return NextResponse.json(
      {
        error: '모든 단계를 완료해야 합니다',
        incompleteSteps,
        hint: `미완료 단계: ${incompleteSteps.join(', ')}`,
      },
      { status: 422 }
    );
  }

  const now = new Date();
  const verificationId = member.impdVerificationId || nanoid(16);

  // IMPD 완료 처리
  await db
    .update(members)
    .set({
      impdStatus: 'completed',
      impdCompletedAt: now,
      impdVerificationId: verificationId,
      status: 'approved', // Chopd 회원 자동 승인
      updatedAt: now,
    })
    .where(eq(members.id, member.id));

  // Townin 역할 업그레이드 (비동기 — 실패해도 IMPD 완료는 유지)
  let towninUpgraded = false;
  if (member.towningraphUserId) {
    towninUpgraded = await upgradeTowninRole(member.towningraphUserId);
    if (!towninUpgraded) {
      console.warn(
        `Townin upgrade-role 실패 (userId: ${member.towningraphUserId}). 수동 처리 필요.`
      );
    }
  }

  return NextResponse.json({
    message: 'IMPD 검증이 완료되었습니다! 환영합니다.',
    impdStatus: 'completed',
    impdVerificationId: verificationId,
    completedAt: now.toISOString(),
    towninUpgraded,
    nextStep: towninUpgraded
      ? 'Townin 역할이 업그레이드되었습니다. 대시보드로 이동하세요.'
      : '대시보드로 이동하세요. Townin 역할 업그레이드는 수동 처리됩니다.',
  });
}
