import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/admin/distributors - 수요자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const results = status
      ? await db.select().from(distributors).where(eq(distributors.status, status as any)).all()
      : await db.select().from(distributors).all();

    return NextResponse.json({
      success: true,
      distributors: results,
    });
  } catch (error) {
    console.error('Failed to fetch distributors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distributors' },
      { status: 500 }
    );
  }
}

// POST /api/admin/distributors - 신규 수요자 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, businessType, region, subscriptionPlan, notes } = body;

    // 필수 필드 검증
    if (!name || !email || !businessType) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existing = await db
      .select()
      .from(distributors)
      .where(eq(distributors.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    // 수요자 생성
    const result = await db.insert(distributors).values({
      name,
      email,
      phone: phone || null,
      businessType,
      region: region || null,
      status: 'pending',
      subscriptionPlan: subscriptionPlan || null,
      notes: notes || null,
      totalRevenue: 0,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning();

    return NextResponse.json({
      success: true,
      distributor: result[0],
    });
  } catch (error) {
    console.error('Failed to create distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create distributor' },
      { status: 500 }
    );
  }
}
