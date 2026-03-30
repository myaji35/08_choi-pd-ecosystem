/**
 * 구독 관리 API
 *
 * GET /api/subscriptions — 현재 테넌트의 구독 정보
 * POST /api/subscriptions — 구독 생성/변경 (Stripe Checkout 세션 생성)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saasSubscriptions, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';

// Stripe 가격 ID 매핑 (실제 Stripe 연동 시 환경변수로 교체)
const STRIPE_PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
  },
};

// GET /api/subscriptions — 현재 구독 정보 조회
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const clerkUserId = request.headers.get('x-clerk-user-id');
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!clerkUserId && !isDevMode) {
      return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const tenantId = getTenantIdFromRequest(request);

    // 구독 정보 조회
    const subscription = await db
      .select()
      .from(saasSubscriptions)
      .where(eq(saasSubscriptions.tenantId, tenantId))
      .get();

    if (!subscription) {
      // 구독이 없으면 Free 플랜 정보 반환
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      billingPeriod: subscription.billingPeriod,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    });

  } catch (error) {
    console.error('구독 정보 조회 실패:', error);
    return NextResponse.json(
      { error: '구독 정보 조회에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions — Stripe Checkout 세션 생성
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const clerkUserIdPost = request.headers.get('x-clerk-user-id');
    const isDevModePost = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!clerkUserIdPost && !isDevModePost) {
      return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { planId, billingPeriod = 'monthly' } = body;

    // 유효성 검증
    if (!planId || !['pro', 'enterprise'].includes(planId)) {
      return NextResponse.json(
        { error: '유효하지 않은 플랜입니다.', code: 'INVALID_PLAN' },
        { status: 400 }
      );
    }

    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: '유효하지 않은 결제 주기입니다.', code: 'INVALID_BILLING_PERIOD' },
        { status: 400 }
      );
    }

    // 테넌트 조회
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .get();

    if (!tenant) {
      return NextResponse.json(
        { error: '테넌트를 찾을 수 없습니다.', code: 'TENANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Stripe Checkout 세션 생성 (실제 Stripe 연동 시 활성화)
    // 현재는 placeholder 응답
    const priceId = STRIPE_PRICE_IDS[planId]?.[billingPeriod];

    if (!priceId) {
      return NextResponse.json(
        { error: '가격 정보를 찾을 수 없습니다.', code: 'PRICE_NOT_FOUND' },
        { status: 400 }
      );
    }

    // TODO: 실제 Stripe 연동
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({
    //   customer: tenant.stripeCustomerId || undefined,
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   mode: 'subscription',
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancel`,
    //   metadata: { tenantId: tenantId.toString() },
    // });

    return NextResponse.json({
      message: 'Stripe 연동 준비 중. 현재는 placeholder입니다.',
      checkoutUrl: `https://checkout.stripe.com/placeholder?plan=${planId}&period=${billingPeriod}`,
      sessionId: `cs_placeholder_${tenantId}_${planId}_${billingPeriod}`,
      planId,
      billingPeriod,
      priceId,
    });

  } catch (error) {
    console.error('구독 생성 실패:', error);
    return NextResponse.json(
      { error: '구독 생성에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
