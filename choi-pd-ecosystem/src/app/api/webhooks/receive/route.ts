import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/workflows';
import { db } from '@/lib/db';
import { webhooks, webhookLogs } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

// ============================================================
// Event Handlers — 이벤트 타입별 처리 로직
// ============================================================

type EventHandler = (payload: Record<string, unknown>) => Promise<{ ok: boolean; detail?: string }>;

const EVENT_HANDLERS: Record<string, EventHandler> = {
  'distributor.created': async (payload) => {
    logger.info('Distributor created event', { distributorId: payload.distributorId });
    // 신규 유통사 → 온보딩 워크플로우 트리거 가능
    return { ok: true, detail: 'distributor.created processed' };
  },

  'distributor.updated': async (payload) => {
    logger.info('Distributor updated event', { distributorId: payload.distributorId });
    return { ok: true, detail: 'distributor.updated processed' };
  },

  'distributor.deleted': async (payload) => {
    logger.info('Distributor deleted event', { distributorId: payload.distributorId });
    return { ok: true, detail: 'distributor.deleted processed' };
  },

  'payment.completed': async (payload) => {
    logger.info('Payment completed event', { paymentId: payload.paymentId, amount: payload.amount });
    return { ok: true, detail: 'payment.completed processed' };
  },

  'payment.failed': async (payload) => {
    logger.warn('Payment failed event', { paymentId: payload.paymentId, reason: payload.reason as string });
    return { ok: true, detail: 'payment.failed processed' };
  },

  'course.published': async (payload) => {
    logger.info('Course published event', { courseId: payload.courseId });
    return { ok: true, detail: 'course.published processed' };
  },

  'post.published': async (payload) => {
    logger.info('Post published event', { postId: payload.postId });
    return { ok: true, detail: 'post.published processed' };
  },

  'subscription.changed': async (payload) => {
    logger.info('Subscription changed event', { distributorId: payload.distributorId, plan: payload.plan });
    return { ok: true, detail: 'subscription.changed processed' };
  },
};

/**
 * 와일드카드(`*`) 구독을 포함해 적합한 핸들러를 찾아 실행
 */
async function routeEvent(event: string, payload: Record<string, unknown>): Promise<{ ok: boolean; detail?: string }> {
  const handler = EVENT_HANDLERS[event];
  if (handler) {
    return handler(payload);
  }

  // 등록된 핸들러가 없어도 정상 수신으로 처리 (로깅만)
  logger.info('No dedicated handler for event, accepted as-is', { event });
  return { ok: true, detail: `event '${event}' accepted (no dedicated handler)` };
}

// ============================================================
// Retry helper — retryConfig 기반 재시도
// ============================================================

async function processWithRetry(
  event: string,
  payload: Record<string, unknown>,
  webhookId: number,
  retryConfig: { max_retries?: number; backoff?: string },
): Promise<{ ok: boolean; detail?: string; attempts: number }> {
  const maxRetries = Math.min(retryConfig.max_retries ?? 3, 5); // 상한 5
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await routeEvent(event, payload);

      // 성공 로그 기록
      await db.insert(webhookLogs).values({
        webhookId,
        event,
        payload: JSON.stringify(payload),
        status: 'success',
        responseCode: 200,
        responseBody: result.detail ?? null,
        attemptNumber: attempt,
      });

      return { ...result, attempts: attempt };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      lastError = errorMsg;

      const isLastAttempt = attempt >= maxRetries;

      // 실패/재시도 로그
      await db.insert(webhookLogs).values({
        webhookId,
        event,
        payload: JSON.stringify(payload),
        status: isLastAttempt ? 'failed' : 'retrying',
        attemptNumber: attempt,
        error: errorMsg,
      });

      logger.warn('Webhook processing attempt failed', {
        webhookId,
        event,
        attempt,
        maxRetries,
        error: errorMsg,
      });

      if (!isLastAttempt) {
        const delay = retryConfig.backoff === 'exponential'
          ? Math.pow(2, attempt) * 500   // 1s, 2s, 4s …
          : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return { ok: false, detail: lastError, attempts: maxRetries };
}

// ============================================================
// POST /api/webhooks/receive
// ============================================================

/**
 * POST /api/webhooks/receive?id=<webhookId>
 *
 * Headers:
 * - X-Webhook-Signature: HMAC-SHA256 서명 (필수)
 * - X-Webhook-Event: 이벤트 타입 (선택, payload.event 대체 가능)
 */
export async function POST(request: NextRequest) {
  const receivedAt = new Date();

  try {
    // ── 1. 파라미터 추출 ──
    const { searchParams } = new URL(request.url);
    const webhookIdParam = searchParams.get('id');
    const signature = request.headers.get('X-Webhook-Signature');

    if (!webhookIdParam) {
      return NextResponse.json(
        { success: false, error: 'Webhook ID required' },
        { status: 400 },
      );
    }

    const webhookId = parseInt(webhookIdParam, 10);
    if (Number.isNaN(webhookId)) {
      return NextResponse.json(
        { success: false, error: 'Webhook ID must be a number' },
        { status: 400 },
      );
    }

    // ── 2. Webhook 조회 ──
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));

    if (!webhook) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 },
      );
    }

    if (!webhook.isActive) {
      return NextResponse.json(
        { success: false, error: 'Webhook is disabled' },
        { status: 403 },
      );
    }

    // ── 3. Body 읽기 ──
    const rawBody = await request.text();

    // ── 4. HMAC 서명 검증 (필수) ──
    if (!signature) {
      logger.warn('Webhook request missing signature', { webhookId });

      await db.insert(webhookLogs).values({
        webhookId,
        event: 'unknown',
        payload: rawBody.substring(0, 2000),
        status: 'failed',
        responseCode: 401,
        error: 'Missing X-Webhook-Signature header',
        attemptNumber: 1,
      });

      return NextResponse.json(
        { success: false, error: 'Signature required' },
        { status: 401 },
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature, webhook.secret);
    if (!isValid) {
      logger.warn('Webhook signature verification failed', { webhookId });

      await db.insert(webhookLogs).values({
        webhookId,
        event: 'unknown',
        payload: rawBody.substring(0, 2000),
        status: 'failed',
        responseCode: 401,
        error: 'Invalid HMAC signature',
        attemptNumber: 1,
      });

      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 },
      );
    }

    // ── 5. JSON 파싱 ──
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      await db.insert(webhookLogs).values({
        webhookId,
        event: 'unknown',
        payload: rawBody.substring(0, 2000),
        status: 'failed',
        responseCode: 400,
        error: 'Invalid JSON payload',
        attemptNumber: 1,
      });

      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 },
      );
    }

    // 이벤트 타입: 헤더 > payload.event
    const event = request.headers.get('X-Webhook-Event')
      || (typeof payload.event === 'string' ? payload.event : null);

    if (!event) {
      await db.insert(webhookLogs).values({
        webhookId,
        event: 'unknown',
        payload: JSON.stringify(payload).substring(0, 2000),
        status: 'failed',
        responseCode: 400,
        error: 'Event type is required (X-Webhook-Event header or payload.event)',
        attemptNumber: 1,
      });

      return NextResponse.json(
        { success: false, error: 'Event type required' },
        { status: 400 },
      );
    }

    // ── 6. 이벤트 구독 확인 ──
    const subscribedEvents: string[] = JSON.parse(webhook.events);
    if (!subscribedEvents.includes(event) && !subscribedEvents.includes('*')) {
      logger.info('Webhook not subscribed to event', { webhookId, event, subscribedEvents });

      await db.insert(webhookLogs).values({
        webhookId,
        event,
        payload: JSON.stringify(payload).substring(0, 2000),
        status: 'failed',
        responseCode: 422,
        error: `Webhook is not subscribed to event '${event}'`,
        attemptNumber: 1,
      });

      return NextResponse.json(
        { success: false, error: `Not subscribed to event '${event}'` },
        { status: 422 },
      );
    }

    // ── 7. 이벤트 처리 (재시도 포함) ──
    const retryConfig = JSON.parse(webhook.retryConfig || '{"max_retries":3}');

    logger.info('Webhook processing started', { webhookId, event });

    const result = await processWithRetry(event, payload, webhookId, retryConfig);

    // ── 8. Webhook 통계 업데이트 ──
    if (result.ok) {
      await db.update(webhooks)
        .set({
          lastTriggeredAt: receivedAt,
          successCount: sql`${webhooks.successCount} + 1`,
        })
        .where(eq(webhooks.id, webhookId));

      logger.info('Webhook processed successfully', {
        webhookId,
        event,
        attempts: result.attempts,
      });

      return NextResponse.json({
        success: true,
        message: 'Webhook received and processed',
        event,
        attempts: result.attempts,
        receivedAt: receivedAt.toISOString(),
      });
    }

    // 모든 재시도 실패
    await db.update(webhooks)
      .set({
        failureCount: sql`${webhooks.failureCount} + 1`,
      })
      .where(eq(webhooks.id, webhookId));

    logger.error('Webhook processing failed after retries', {
      webhookId,
      event,
      attempts: result.attempts,
      error: result.detail,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed after retries',
        event,
        attempts: result.attempts,
        receivedAt: receivedAt.toISOString(),
      },
      { status: 502 },
    );

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Unexpected error in webhook receive', { error: errorMsg });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
