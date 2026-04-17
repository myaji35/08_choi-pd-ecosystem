import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members, memberDocuments, memberSkills, memberGapReports } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantCondition } from '@/lib/tenant/query-helpers';

export const dynamic = 'force-dynamic';

// GET /api/admin/members - 회원 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const status = request.nextUrl.searchParams.get('status');

    const results = status
      ? await db.select().from(members).where(and(tenantFilter(members.tenantId, tenantId), eq(members.status, status))).all()
      : await db.select().from(members).where(tenantFilter(members.tenantId, tenantId)).all();

    // 회원별 달란트·문서·갭 요약 조인 (각각 sub-query)
    const enriched = await Promise.all(
      results.map(async (m) => {
        const [docs, skillsCount, latestReport] = await Promise.all([
          db
            .select({ c: sql<number>`count(*)` })
            .from(memberDocuments)
            .where(eq(memberDocuments.memberId, m.id))
            .get(),
          db
            .select({ c: sql<number>`count(*)` })
            .from(memberSkills)
            .where(eq(memberSkills.memberId, m.id))
            .get(),
          db
            .select()
            .from(memberGapReports)
            .where(eq(memberGapReports.memberId, m.id))
            .orderBy(desc(memberGapReports.generatedAt))
            .limit(1)
            .get(),
        ]);
        return {
          ...m,
          documentCount: Number(docs?.c || 0),
          skillCount: Number(skillsCount?.c || 0),
          completeness: latestReport?.completenessScore ?? null,
          lastReportAt: latestReport?.generatedAt ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      members: enriched,
    });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { success: false, error: '회원 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
