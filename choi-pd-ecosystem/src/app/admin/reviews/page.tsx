/**
 * ISS-067: Admin Reviews Page
 * /admin/reviews — 리뷰 목록 + 상태 트리아지
 */

import { db } from '@/lib/db';
import { memberReviews, members, tenants } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import ReviewsClient, { type AdminReviewRow } from './ReviewsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '리뷰 관리 | imPD Admin',
};

export default async function AdminReviewsPage() {
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
      source: memberReviews.source,
      createdAt: memberReviews.createdAt,
    })
    .from(memberReviews)
    .leftJoin(members, eq(memberReviews.memberId, members.id))
    .leftJoin(tenants, eq(members.tenantId, tenants.id))
    .orderBy(desc(memberReviews.createdAt))
    .all();

  const initialRows: AdminReviewRow[] = rows.map((r) => {
    const createdAt =
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : r.createdAt
        ? new Date(r.createdAt as unknown as string | number).toISOString()
        : null;

    const status = (r.status ?? 'new') as AdminReviewRow['status'];
    const source = (r.source ?? 'public_form') as AdminReviewRow['source'];

    return {
      id: r.id,
      memberSlug: r.memberSlug || r.tenantSlug || null,
      reviewerName: r.reviewerName,
      rating: r.rating,
      content: r.content,
      status,
      source,
      createdAt,
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#16325C]">리뷰 관리</h1>
        <p className="mt-1 text-sm text-gray-600">
          고객 리뷰를 조회하고 상태(신규 → 확인 → 답변 → 보관)를 관리합니다.
        </p>
      </header>

      <ReviewsClient initialRows={initialRows} />
    </main>
  );
}
