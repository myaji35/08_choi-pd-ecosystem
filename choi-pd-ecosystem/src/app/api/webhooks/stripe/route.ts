/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * 구독 생성/갱신/취소/결제 실패 이벤트를 처리하여
 * saasSubscriptions + tenants 테이블을 업데이트
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saasSubscriptions, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeSecretKey);

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const tenantId = parseInt(session.metadata?.tenantId || '0');
        const planId = session.metadata?.planId || 'pro';

        if (tenantId && session.subscription) {
          // 구독 레코드 생성
          type SaasPlan = 'free' | 'pro' | 'enterprise';
          await db.insert(saasSubscriptions).values({
            tenantId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: session.metadata?.stripePriceId || '',
            plan: planId as SaasPlan,
            status: 'active',
            billingPeriod: session.metadata?.billingPeriod === 'yearly' ? 'yearly' : 'monthly',
          });

          // 테넌트 플랜 업데이트
          await db
            .update(tenants)
            .set({
              plan: planId as SaasPlan,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            })
            .where(eq(tenants.id, tenantId));

          logger.info('Stripe subscription created', { tenantId, planId });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subDetails = invoice.parent?.subscription_details;
        const subscriptionId = (typeof subDetails?.subscription === 'string'
          ? subDetails.subscription
          : subDetails?.subscription?.id) as string | undefined;

        if (subscriptionId) {
          await db
            .update(saasSubscriptions)
            .set({
              status: 'active',
              currentPeriodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : undefined,
              currentPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
            })
            .where(eq(saasSubscriptions.stripeSubscriptionId, subscriptionId));

          logger.info('Stripe payment succeeded', { subscriptionId });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object;
        const failedSubDetails = failedInvoice.parent?.subscription_details;
        const failedSubId = (typeof failedSubDetails?.subscription === 'string'
          ? failedSubDetails.subscription
          : failedSubDetails?.subscription?.id) as string | undefined;

        if (failedSubId) {
          await db
            .update(saasSubscriptions)
            .set({ status: 'past_due' })
            .where(eq(saasSubscriptions.stripeSubscriptionId, failedSubId));

          logger.info('Stripe payment failed', { subscriptionId: failedSubId });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const updatedSub = event.data.object;
        const updatedTenantId = parseInt(updatedSub.metadata?.tenantId || '0');

        if (updatedSub.id) {
          // 플랜 결정: metadata 우선, 없으면 price에서 추론
          type SaasPlan = 'free' | 'pro' | 'enterprise';
          const planFromMeta = updatedSub.metadata?.planId as SaasPlan | undefined;

          // 구독 상태 매핑
          const statusMap: Record<string, string> = {
            active: 'active',
            past_due: 'past_due',
            canceled: 'canceled',
            trialing: 'trialing',
            unpaid: 'unpaid',
          };
          const mappedStatus = (statusMap[updatedSub.status] || 'active') as 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid';

          // 결제 주기 결정
          const interval = updatedSub.items?.data?.[0]?.price?.recurring?.interval;
          const billingPeriod: 'monthly' | 'yearly' = interval === 'year' ? 'yearly' : 'monthly';

          const updateData: Record<string, unknown> = {
            status: mappedStatus,
            billingPeriod,
            cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
            currentPeriodStart: (updatedSub as unknown as Record<string, number>).current_period_start
              ? new Date((updatedSub as unknown as Record<string, number>).current_period_start * 1000)
              : undefined,
            currentPeriodEnd: (updatedSub as unknown as Record<string, number>).current_period_end
              ? new Date((updatedSub as unknown as Record<string, number>).current_period_end * 1000)
              : undefined,
            updatedAt: new Date(),
          };

          // 새 price ID가 있으면 업데이트
          const newPriceId = updatedSub.items?.data?.[0]?.price?.id;
          if (newPriceId) {
            updateData.stripePriceId = newPriceId;
          }

          if (planFromMeta) {
            updateData.plan = planFromMeta;
          }

          await db
            .update(saasSubscriptions)
            .set(updateData)
            .where(eq(saasSubscriptions.stripeSubscriptionId, updatedSub.id));

          // 테넌트 플랜 업데이트 (planFromMeta가 있을 때만)
          if (planFromMeta && updatedTenantId) {
            await db
              .update(tenants)
              .set({ plan: planFromMeta })
              .where(eq(tenants.id, updatedTenantId));
          }

          logger.info('Stripe subscription updated', {
            subscriptionId: updatedSub.id,
            plan: planFromMeta,
            status: mappedStatus,
            billingPeriod,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;

        await db
          .update(saasSubscriptions)
          .set({ status: 'canceled', canceledAt: new Date() })
          .where(eq(saasSubscriptions.stripeSubscriptionId, deletedSub.id));

        // 테넌트를 free 플랜으로 다운그레이드
        const subRecord = await db
          .select()
          .from(saasSubscriptions)
          .where(eq(saasSubscriptions.stripeSubscriptionId, deletedSub.id))
          .get();

        if (subRecord) {
          await db
            .update(tenants)
            .set({ plan: 'free' })
            .where(eq(tenants.id, subRecord.tenantId));
        }

        logger.info('Stripe subscription canceled', { subscriptionId: deletedSub.id });
        break;
      }

      default:
        logger.info('Stripe unhandled event', { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe] Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
