import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/pd/inquiries - 문의 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let results = await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt))
      .all();

    // Filter by status
    if (status && status !== 'all') {
      results = results.filter(inquiry => inquiry.status === status);
    }

    // Filter by type
    if (type && type !== 'all') {
      results = results.filter(inquiry => inquiry.type === type);
    }

    return NextResponse.json({
      success: true,
      inquiries: results,
    });
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// POST /api/pd/inquiries - 문의 생성 (프론트엔드용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, type } = body;

    // 필수 필드 검증
    if (!name || !email || !message || !type) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
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

    // 문의 생성
    const result = await db.insert(inquiries).values({
      name,
      email,
      phone: phone || null,
      message,
      type,
      status: 'pending',
    }).returning();

    return NextResponse.json({
      success: true,
      inquiry: result[0],
    });
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}
