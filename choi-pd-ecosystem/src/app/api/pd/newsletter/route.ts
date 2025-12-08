import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/pd/newsletter - 구독자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let query = db
      .select()
      .from(leads)
      .orderBy(desc(leads.subscribedAt));

    // Pagination
    if (limit) {
      query = query.limit(parseInt(limit)) as any;
      if (offset) {
        query = query.offset(parseInt(offset)) as any;
      }
    }

    const results = await query.all();

    // Get total count
    const totalCount = await db.select().from(leads).all();

    return NextResponse.json({
      success: true,
      subscribers: results,
      total: totalCount.length,
    });
  } catch (error) {
    console.error('Failed to fetch newsletter subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST /api/pd/newsletter - 구독 추가 (프론트엔드용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 필수 필드 검증
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 중복 확인
    const existing = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // 구독 추가
    const result = await db.insert(leads).values({
      email,
    }).returning();

    return NextResponse.json({
      success: true,
      subscriber: result[0],
    });
  } catch (error) {
    console.error('Failed to add subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add subscriber' },
      { status: 500 }
    );
  }
}
