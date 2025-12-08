import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/subscription-plans - 구독 플랜 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const results = activeOnly
      ? await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).all()
      : await db.select().from(subscriptionPlans).all();

    return NextResponse.json({
      success: true,
      plans: results,
    });
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

// POST /api/admin/subscription-plans - 구독 플랜 생성 (초기 데이터)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      displayName,
      description,
      price,
      features,
      maxDistributors,
      maxResources,
    } = body;

    // 필수 필드 검증
    if (!name || !displayName || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 플랜 생성
    const result = await db.insert(subscriptionPlans).values({
      name,
      displayName,
      description: description || null,
      price,
      features: features ? JSON.stringify(features) : null,
      maxDistributors: maxDistributors || null,
      maxResources: maxResources || null,
      isActive: true,
    }).returning();

    return NextResponse.json({
      success: true,
      plan: result[0],
    });
  } catch (error) {
    console.error('Failed to create subscription plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}
