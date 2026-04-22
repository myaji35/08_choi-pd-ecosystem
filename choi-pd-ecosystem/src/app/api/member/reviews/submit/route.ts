/**
 * ISS-067: POST /api/member/reviews/submit
 * 공개 리뷰 제출 엔드포인트
 *
 * Body:
 *   memberSlug: string
 *   rating: 1-5
 *   content: string (>=10자)
 *   reviewerName: string
 *   email?: string (선택)
 *   hashEmail?: boolean (기본 true)
 *
 * 저장:
 *   1. DB (memberReviews) — 필수, 실패 시 500
 *   2. JSON 싱크 파일 — best-effort, 실패해도 200 반환
 *
 * Rate limit: IP당 1시간 3회
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { members, memberReviews, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkRateLimit, extractIp } from '@/lib/reviews/rate-limit';
import { appendReviewToJson } from '@/lib/reviews/json-sync';

const submitSchema = z.object({
  memberSlug: z.string().min(1, 'memberSlug가 필요합니다'),
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(10, '리뷰는 10자 이상 작성해주세요').max(2000),
  reviewerName: z.string().trim().min(1).max(60),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  hashEmail: z.boolean().optional().default(true),
});

function hashEmailValue(email: string): string {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = extractIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: '잠시 후 다시 시도해주세요. (시간당 3회 제한)' },
        { status: 429 }
      );
    }

    // Parse + validate
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: '요청 본문이 올바르지 않습니다' }, { status: 400 });
    }

    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || '입력값이 올바르지 않습니다',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { memberSlug, rating, content, reviewerName, email, hashEmail } = parsed.data;

    // memberSlug → member 조회
    //   우선 members 테이블, 없으면 tenants → 해당 tenant의 첫 member 사용
    let memberRow: { id: number; tenantId: number | null } | null = null;

    const memberLookup = await db
      .select({ id: members.id, tenantId: members.tenantId })
      .from(members)
      .where(eq(members.slug, memberSlug))
      .limit(1);

    if (memberLookup.length > 0) {
      memberRow = { id: memberLookup[0].id, tenantId: memberLookup[0].tenantId ?? null };
    } else {
      // tenants.slug로 fallback
      const tenantLookup = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.slug, memberSlug))
        .limit(1);
      if (tenantLookup.length > 0) {
        const tenantMember = await db
          .select({ id: members.id, tenantId: members.tenantId })
          .from(members)
          .where(eq(members.tenantId, tenantLookup[0].id))
          .limit(1);
        if (tenantMember.length > 0) {
          memberRow = { id: tenantMember[0].id, tenantId: tenantMember[0].tenantId ?? null };
        }
      }
    }

    if (!memberRow) {
      return NextResponse.json(
        { ok: false, error: '해당 페이지를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 이메일 처리 (원문 또는 해시)
    let storedEmail: string | null = null;
    if (email) {
      storedEmail = hashEmail ? hashEmailValue(email) : email.trim().toLowerCase();
    }

    // DB 저장 (필수)
    const inserted = await db
      .insert(memberReviews)
      .values({
        tenantId: memberRow.tenantId ?? 1,
        memberId: memberRow.id,
        reviewerName: reviewerName.trim(),
        reviewerEmail: storedEmail,
        rating,
        content: content.trim(),
        status: 'new',
        source: 'public_form',
        isApproved: 0,
      })
      .returning({ id: memberReviews.id, createdAt: memberReviews.createdAt });

    const reviewId = inserted[0]?.id;
    const createdAt = inserted[0]?.createdAt;

    if (!reviewId) {
      return NextResponse.json({ ok: false, error: '리뷰 저장에 실패했습니다' }, { status: 500 });
    }

    // JSON 싱크 (best-effort)
    try {
      await appendReviewToJson({
        id: reviewId,
        member_slug: memberSlug,
        reviewer_name: reviewerName.trim(),
        rating,
        content: content.trim(),
        email_hash: storedEmail,
        status: 'new',
        source: 'public_form',
        created_at: createdAt instanceof Date ? createdAt.toISOString() : new Date().toISOString(),
      });
    } catch (err) {
      // JSON 실패는 무시 — DB 저장은 성공
      console.warn('[reviews.submit] JSON sync failed:', err);
    }

    return NextResponse.json({ ok: true, reviewId });
  } catch (err) {
    console.error('[reviews.submit] error:', err);
    return NextResponse.json({ ok: false, error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
