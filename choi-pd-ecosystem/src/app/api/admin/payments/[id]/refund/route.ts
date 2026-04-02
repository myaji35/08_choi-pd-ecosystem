/**
 * 결제 환불 API
 * POST /api/admin/payments/[id]/refund
 *
 * - Stripe refunds.create() 호출
 * - payments 테이블 status='refunded' 업데이트
 * - 부분 환불 지원 (amount 파라미터)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 결제 ID입니다.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // 결제 정보 조회
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .get();

    if (!payment) {
      return NextResponse.json(
        { success: false, error: '결제 내역을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (payment.status === 'refunded') {
      return NextResponse.json(
        { success: false, error: '이미 환불된 결제입니다.', code: 'ALREADY_REFUNDED' },
        { status: 409 }
      );
    }

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: '완료된 결제만 환불할 수 있습니다.', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { amount, reason } = body as { amount?: number; reason?: string };

    // 부분 환불 금액 검증
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { success: false, error: '환불 금액은 0보다 큰 숫자여야 합니다.', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
      if (amount > payment.amount) {
        return NextResponse.json(
          { success: false, error: '환불 금액이 결제 금액을 초과합니다.', code: 'EXCEEDS_AMOUNT' },
          { status: 400 }
        );
      }
    }

    const refundAmount = amount || payment.amount;
    const isPartialRefund = refundAmount < payment.amount;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // Stripe 환불 처리
    let stripeRefundId: string | null = null;
    if (stripeSecretKey && payment.transactionId) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey);

      try {
        const refundParams: Record<string, unknown> = {
          payment_intent: payment.transactionId,
        };

        // 부분 환불인 경우 금액 지정
        if (isPartialRefund) {
          refundParams.amount = refundAmount;
        }

        // 환불 사유
        if (reason && ['duplicate', 'fraudulent', 'requested_by_customer'].includes(reason)) {
          refundParams.reason = reason;
        }

        const refund = await stripe.refunds.create(refundParams as Parameters<typeof stripe.refunds.create>[0]);
        stripeRefundId = refund.id;
      } catch (stripeError) {
        console.error('Stripe 환불 실패:', stripeError);
        const errorMessage = stripeError instanceof Error ? stripeError.message : 'Stripe 환불 처리 중 오류가 발생했습니다.';
        return NextResponse.json(
          { success: false, error: errorMessage, code: 'STRIPE_REFUND_FAILED' },
          { status: 500 }
        );
      }
    }

    // DB 업데이트
    const existingMetadata = payment.metadata ? JSON.parse(payment.metadata) : {};
    const updatedMetadata = {
      ...existingMetadata,
      refund: {
        amount: refundAmount,
        isPartial: isPartialRefund,
        stripeRefundId,
        reason: reason || null,
        refundedAt: new Date().toISOString(),
      },
    };

    const result = await db
      .update(payments)
      .set({
        status: 'refunded',
        metadata: JSON.stringify(updatedMetadata),
      })
      .where(eq(payments.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      payment: result[0],
      refund: {
        amount: refundAmount,
        isPartial: isPartialRefund,
        stripeRefundId,
        reason: reason || null,
      },
    });

  } catch (error) {
    console.error('환불 처리 실패:', error);
    return NextResponse.json(
      { success: false, error: '환불 처리에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
