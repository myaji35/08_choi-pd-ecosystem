/**
 * ISS-067: GET /api/reviews
 * 공개 리뷰 조회 (0000_master 등 외부 폴링 소스)
 *
 * Query:
 *   status: 'new'|'triaged'|'responded'|'archived' (선택)
 *   limit: number (기본 50, 최대 200)
 *   since: ISO8601 (선택, 해당 시각 이후 생성된 리뷰만)
 *
 * 응답 필드: id, member_slug, reviewer_name, rating, content, status, created_at
 *            (이메일/해시는 절대 노출하지 않는다)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memberReviews, members, tenants } from '@/lib/db/schema';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['new', 'triaged', 'responded', 'archived'] as const;
type ReviewStatus = typeof VALID_STATUSES[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const sinceParam = searchParams.get('since');

    const status = statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as ReviewStatus)
      : null;

    const limitRaw = limitParam ? Number(limitParam) : 50;
    const limit = Math.min(Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 50), 200);

    let sinceDate: Date | null = null;
    if (sinceParam) {
      const d = new Date(sinceParam);
      if (!Number.isNaN(d.getTime())) sinceDate = d;
    }

    // members + tenants 조인으로 slug 구함.
    // members.slug 우선, 없으면 tenants.slug fallback
    const conditions = [] as ReturnType<typeof eq>[];
    if (status) conditions.push(eq(memberReviews.status, status));
    if (sinceDate) conditions.push(gte(memberReviews.createdAt, sinceDate));

    const rows = await db
      .select({
        id: memberReviews.id,
        memberId: memberReviews.memberId,
        memberSlug: members.slug,
        tenantSlug: tenants.slug,
        reviewerName: memberReviews.reviewerName,
        rating: memberReviews.rating,
        content: memberReviews.content,
        status: memberReviews.status,
        createdAt: memberReviews.createdAt,
      })
      .from(memberReviews)
      .leftJoin(members, eq(memberReviews.memberId, members.id))
      .leftJoin(tenants, eq(members.tenantId, tenants.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(memberReviews.createdAt))
      .limit(limit);

    const totalRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(memberReviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(totalRow[0]?.count ?? 0);

    const reviews = rows.map((r) => ({
      id: r.id,
      member_slug: r.memberSlug || r.tenantSlug || null,
      reviewer_name: r.reviewerName,
      rating: r.rating,
      content: r.content,
      status: r.status,
      created_at:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : r.createdAt
          ? new Date(r.createdAt as unknown as string | number).toISOString()
          : null,
    }));

    return NextResponse.json({
      reviews,
      total,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[api.reviews.GET] error:', err);
    return NextResponse.json({ reviews: [], total: 0, error: '서버 오류' }, { status: 500 });
  }
}
