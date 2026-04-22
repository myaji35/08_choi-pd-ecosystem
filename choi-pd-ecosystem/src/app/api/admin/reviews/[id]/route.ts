/**
 * ISS-067: PATCH /api/admin/reviews/[id]
 * 어드민 리뷰 상태 업데이트
 *
 * Body: { status: 'new'|'triaged'|'responded'|'archived' }
 *
 * 인증은 /api/admin/* 미들웨어(src/middleware.ts)에서 쿠키 기반으로 처리.
 * 이 핸들러는 추가 로직 없이 DB + JSON 싱크만 담당.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { memberReviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateReviewStatusInJson } from '@/lib/reviews/json-sync';

const patchSchema = z.object({
  status: z.enum(['new', 'triaged', 'responded', 'archived']),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || '상태값이 올바르지 않습니다' },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // isApproved 하위 호환: triaged/responded면 1, 아니면 0
    const isApproved = status === 'triaged' || status === 'responded' ? 1 : 0;

    const updated = await db
      .update(memberReviews)
      .set({
        status,
        isApproved,
        updatedAt: new Date(),
      })
      .where(eq(memberReviews.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ ok: false, error: '리뷰를 찾을 수 없습니다' }, { status: 404 });
    }

    // JSON 싱크 (best-effort)
    try {
      await updateReviewStatusInJson(id, status);
    } catch (err) {
      console.warn('[admin.reviews.patch] JSON sync failed:', err);
    }

    return NextResponse.json({ ok: true, review: updated[0] });
  } catch (err) {
    console.error('[admin.reviews.patch] error:', err);
    return NextResponse.json({ ok: false, error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
