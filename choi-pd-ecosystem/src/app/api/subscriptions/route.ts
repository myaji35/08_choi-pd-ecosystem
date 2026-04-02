/**
 * 구독 관리 API
 *
 * GET /api/subscriptions — 현재 테넌트의 구독 정보
 * POST /api/subscriptions — 구독 생성/변경 (Stripe Checkout 세션 생성)
 * PATCH /api/subscriptions — 기존 구독 플랜 변경 (Upgrade/Downgrade, proration 자동 적용)
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

    const priceId = STRIPE_PRICE_IDS[planId]?.[billingPeriod];

    if (!priceId) {
      return NextResponse.json(
        { error: '가격 정보를 찾을 수 없습니다.', code: 'PRICE_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Stripe 연동: 환경변수가 설정된 경우 실제 Checkout 세션 생성
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3011';

    if (stripeSecretKey && !stripeSecretKey.startsWith('price_')) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey);

      // 기존 Stripe Customer가 없으면 생성
      let customerId = tenant.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          name: tenant.name,
          metadata: { tenantId: tenantId.toString(), slug: tenant.slug },
        });
        customerId = customer.id;

        // 테넌트에 stripeCustomerId 저장
        await db
          .update(tenants)
          .set({ stripeCustomerId: customerId })
          .where(eq(tenants.id, tenantId));
      }

      // Checkout 세션 생성
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${appUrl}/pd/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/pd/dashboard?checkout=cancel`,
        metadata: { tenantId: tenantId.toString(), planId, billingPeriod },
        subscription_data: {
          metadata: { tenantId: tenantId.toString(), planId },
        },
      });

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
        planId,
        billingPeriod,
      });
    }

    // Stripe 미설정 시 placeholder 응답 (개발 모드)
    return NextResponse.json({
      message: 'Stripe 미설정 — STRIPE_SECRET_KEY 환경변수를 설정하세요.',
      checkoutUrl: null,
      sessionId: `dev_${tenantId}_${planId}_${billingPeriod}`,
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

// PATCH /api/subscriptions — 기존 구독 플랜 변경 (Upgrade/Downgrade)
export async function PATCH(request: NextRequest) {
  try {
    // 인증 확인
    const clerkUserId = request.headers.get('x-clerk-user-id');
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!clerkUserId && !isDevMode) {
      return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { planId, billingPeriod } = body;

    // 유효성 검증
    if (!planId || !['free', 'pro', 'enterprise'].includes(planId)) {
      return NextResponse.json(
        { error: '유효하지 않은 플랜입니다.', code: 'INVALID_PLAN' },
        { status: 400 }
      );
    }

    // 기존 구독 조회
    const subscription = await db
      .select()
      .from(saasSubscriptions)
      .where(eq(saasSubscriptions.tenantId, tenantId))
      .get();

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: '활성 구독을 찾을 수 없습니다.', code: 'NO_ACTIVE_SUBSCRIPTION' },
        { status: 404 }
      );
    }

    // free 플랜으로 변경 요청 시 → 구독 취소로 처리
    if (planId === 'free') {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (stripeSecretKey) {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeSecretKey);
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      }

      await db
        .update(saasSubscriptions)
        .set({ cancelAtPeriodEnd: true })
        .where(eq(saasSubscriptions.tenantId, tenantId));

      return NextResponse.json({
        message: '구독이 현재 결제 기간 종료 후 취소됩니다.',
        cancelAtPeriodEnd: true,
      });
    }

    // 결제 주기 결정 (변경 요청에 포함되었으면 사용, 아니면 기존 유지)
    const newBillingPeriod = billingPeriod && ['monthly', 'yearly'].includes(billingPeriod)
      ? billingPeriod
      : subscription.billingPeriod;

    const newPriceId = STRIPE_PRICE_IDS[planId]?.[newBillingPeriod];
    if (!newPriceId) {
      return NextResponse.json(
        { error: '가격 정보를 찾을 수 없습니다.', code: 'PRICE_NOT_FOUND' },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey);

      // 현재 Stripe 구독 조회
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

      if (!stripeSub || stripeSub.items.data.length === 0) {
        return NextResponse.json(
          { error: 'Stripe 구독 정보를 가져올 수 없습니다.', code: 'STRIPE_ERROR' },
          { status: 500 }
        );
      }

      // 구독 아이템 업데이트 (proration 자동 적용)
      const updatedSub = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: stripeSub.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
        cancel_at_period_end: false, // 취소 예정이었다면 해제
        metadata: {
          tenantId: tenantId.toString(),
          planId,
        },
      });

      // DB 즉시 업데이트 (webhook에서도 보강하지만 응답 속도를 위해 선반영)
      type SaasPlan = 'free' | 'pro' | 'enterprise';
      type BillingPeriod = 'monthly' | 'yearly';
      await db
        .update(saasSubscriptions)
        .set({
          plan: planId as SaasPlan,
          billingPeriod: newBillingPeriod as BillingPeriod,
          stripePriceId: newPriceId,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        })
        .where(eq(saasSubscriptions.tenantId, tenantId));

      // 테넌트 플랜도 업데이트
      await db
        .update(tenants)
        .set({ plan: planId as SaasPlan })
        .where(eq(tenants.id, tenantId));

      return NextResponse.json({
        message: '플랜이 변경되었습니다.',
        plan: planId,
        billingPeriod: newBillingPeriod,
        stripeSubscriptionId: updatedSub.id,
        prorationApplied: true,
      });
    }

    // Stripe 미설정 시 (개발 모드)
    type SaasPlanDev = 'free' | 'pro' | 'enterprise';
    type BillingPeriodDev = 'monthly' | 'yearly';
    await db
      .update(saasSubscriptions)
      .set({
        plan: planId as SaasPlanDev,
        billingPeriod: newBillingPeriod as BillingPeriodDev,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(saasSubscriptions.tenantId, tenantId));

    await db
      .update(tenants)
      .set({ plan: planId as SaasPlanDev })
      .where(eq(tenants.id, tenantId));

    return NextResponse.json({
      message: 'Stripe 미설정 — DB만 업데이트됨 (개발 모드)',
      plan: planId,
      billingPeriod: newBillingPeriod,
      prorationApplied: false,
    });

  } catch (error) {
    console.error('플랜 변경 실패:', error);
    return NextResponse.json(
      { error: '플랜 변경에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
