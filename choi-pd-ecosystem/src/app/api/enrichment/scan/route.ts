import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { enrichMember } from '@/lib/enrichment';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/enrichment/scan
 * 회원 프로필 자동 강화 스캔 실행
 * Body: { memberId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { memberId } = body;

    if (!memberId || typeof memberId !== 'number') {
      return NextResponse.json(
        { success: false, error: '유효한 memberId가 필요합니다.' },
        { status: 400 },
      );
    }

    // 회원 조회
    const member = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .get();

    if (!member) {
      return NextResponse.json(
        { success: false, error: '회원을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 수집 실행
    const results = await enrichMember(memberId, member.email, member.name);

    return NextResponse.json({
      success: true,
      status: 'completed',
      suggestionsCount: results.length,
    });
  } catch (error) {
    console.error('[Enrichment:scan] 스캔 실패:', error);
    return NextResponse.json(
      { success: false, error: '프로필 스캔에 실패했습니다.' },
      { status: 500 },
    );
  }
}
