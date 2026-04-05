import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enrichmentCache } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/enrichment/suggestions/:id
 * 특정 회원의 pending 상태 제안 목록 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return NextResponse.json(
        { success: false, error: '유효한 회원 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    // pending(isApproved=0) 제안만 조회, 신뢰도 높은 순
    const suggestions = await db
      .select()
      .from(enrichmentCache)
      .where(
        and(
          eq(enrichmentCache.memberId, memberId),
          eq(enrichmentCache.isApproved, 0),
        ),
      )
      .orderBy(desc(enrichmentCache.confidence))
      .all();

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('[Enrichment:suggestions] 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '제안 목록 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}
