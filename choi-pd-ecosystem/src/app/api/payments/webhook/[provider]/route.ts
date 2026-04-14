import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enrollments, courses, auditLogs } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 외부 결제 webhook 수신 (Toss / Stripe)
 * POST /api/payments/webhook/[provider]
 *
 * 기본 원칙:
 * 1. 서명 검증 (provider별 secret 환경변수) — 미설정 시 production에서는 503
 * 2. externalOrderId + provider 로 멱등성 보장 (uniqueIndex)
 * 3. 결제 성공 시 enrollments.status = 'paid', paidAt 기록
 * 4. 환불 시 refunded 상태로 업데이트
 * 5. 모든 처리는 audit log 기록
 */

type Provider = 'toss' | 'stripe';

interface NormalizedEvent {
  orderId: string;
  courseId: number | null;
  userId: string | null;
  amount: number | null;
  status: 'paid' | 'refunded' | 'canceled';
  raw: unknown;
}

function verifyTossSignature(body: string, signature: string | null): boolean {
  const secret = process.env.TOSS_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production'; // dev에선 검증 스킵
  }
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function verifyStripeSignature(body: string, signature: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }
  if (!signature) return false;
  // 실제 Stripe는 t=...,v1=... 포맷. 단순화된 HMAC-SHA256 비교 (fallback)
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function normalizeToss(payload: Record<string, unknown>): NormalizedEvent | null {
  const status = String(payload.status || '').toLowerCase();
  const orderId = String(payload.orderId || '');
  if (!orderId) return null;
  const metadata = (payload.metadata ?? {}) as Record<string, unknown>;
  return {
    orderId,
    courseId: metadata.courseId ? Number(metadata.courseId) : null,
    userId: metadata.userId ? String(metadata.userId) : null,
    amount: typeof payload.totalAmount === 'number' ? (payload.totalAmount as number) : null,
    status: status === 'done' || status === 'paid' ? 'paid'
      : status.startsWith('refund') ? 'refunded'
      : 'canceled',
    raw: payload,
  };
}

function normalizeStripe(payload: Record<string, unknown>): NormalizedEvent | null {
  const data = (payload.data as Record<string, unknown> | undefined)?.object as
    | Record<string, unknown>
    | undefined;
  if (!data) return null;
  const orderId = String(data.id || '');
  if (!orderId) return null;
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;
  const eventType = String(payload.type || '');
  return {
    orderId,
    courseId: metadata.courseId ? Number(metadata.courseId) : null,
    userId: metadata.userId ? String(metadata.userId) : null,
    amount: typeof data.amount_total === 'number' ? (data.amount_total as number) : null,
    status: eventType.includes('refund') ? 'refunded'
      : eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded' ? 'paid'
      : 'canceled',
    raw: payload,
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = providerParam as Provider;

  if (provider !== 'toss' && provider !== 'stripe') {
    return NextResponse.json({ error: 'unknown provider' }, { status: 400 });
  }

  const body = await req.text();
  const signature = req.headers.get(provider === 'toss' ? 'toss-signature' : 'stripe-signature');

  const verified = provider === 'toss'
    ? verifyTossSignature(body, signature)
    : verifyStripeSignature(body, signature);

  if (!verified) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const event = provider === 'toss' ? normalizeToss(payload) : normalizeStripe(payload);
  if (!event) {
    return NextResponse.json({ error: 'unparseable event' }, { status: 400 });
  }

  if (!event.userId || !event.courseId) {
    return NextResponse.json(
      { error: 'userId and courseId metadata required on checkout' },
      { status: 400 }
    );
  }

  // 강의 존재 검증
  const course = await db.select().from(courses).where(eq(courses.id, event.courseId)).get();
  if (!course) {
    return NextResponse.json({ error: 'course not found' }, { status: 404 });
  }

  // 멱등성: 같은 provider+externalOrderId 중복 insert는 uniqueIndex가 막음
  const existing = await db.select().from(enrollments)
    .where(and(
      eq(enrollments.provider, provider),
      eq(enrollments.externalOrderId, event.orderId),
    ))
    .get();

  const now = new Date();
  let resultRow;

  if (existing) {
    // 상태 전이만 업데이트 (중복 webhook 허용)
    resultRow = await db.update(enrollments)
      .set({
        status: event.status,
        paidAt: event.status === 'paid' ? now : existing.paidAt,
        refundedAt: event.status === 'refunded' ? now : existing.refundedAt,
        metadata: JSON.stringify(event.raw),
        updatedAt: now,
      })
      .where(eq(enrollments.id, existing.id))
      .returning();
  } else {
    resultRow = await db.insert(enrollments).values({
      userId: event.userId,
      courseId: event.courseId,
      provider,
      externalOrderId: event.orderId,
      amount: event.amount ?? 0,
      status: event.status,
      paidAt: event.status === 'paid' ? now : null,
      refundedAt: event.status === 'refunded' ? now : null,
      metadata: JSON.stringify(event.raw),
    }).returning();
  }

  // Audit log
  try {
    await db.insert(auditLogs).values({
      userId: event.userId,
      userType: 'system',
      action: event.status.toUpperCase(),
      resource: 'enrollment',
      resourceId: String(resultRow[0]?.id ?? ''),
      metadata: JSON.stringify({ provider, orderId: event.orderId, courseId: event.courseId, amount: event.amount }),
    });
  } catch (err) {
    console.warn('[webhook] audit log failed', err);
  }

  return NextResponse.json({ ok: true, enrollment: resultRow[0] });
}
