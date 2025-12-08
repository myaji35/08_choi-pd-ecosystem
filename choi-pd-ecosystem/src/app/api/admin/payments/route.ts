import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/payments - 결제 내역 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const distributorId = searchParams.get('distributorId');
    const status = searchParams.get('status');

    let query = db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));

    // Filter by distributor if specified
    if (distributorId) {
      const results = await query
        .where(eq(payments.distributorId, parseInt(distributorId)))
        .all();
      return NextResponse.json({ success: true, payments: results });
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      const results = await query
        .where(eq(payments.status, status as any))
        .all();
      return NextResponse.json({ success: true, payments: results });
    }

    const results = await query.all();
    return NextResponse.json({ success: true, payments: results });
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/admin/payments - 결제 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      distributorId,
      planId,
      amount,
      currency = 'KRW',
      paymentMethod,
      metadata,
    } = body;

    // 필수 필드 검증
    if (!distributorId || !planId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 결제 생성
    const result = await db.insert(payments).values({
      distributorId,
      planId,
      amount,
      currency,
      status: 'pending',
      paymentMethod: paymentMethod || null,
      transactionId: null,
      paidAt: null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }).returning();

    return NextResponse.json({
      success: true,
      payment: result[0],
    });
  } catch (error) {
    console.error('Failed to create payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
