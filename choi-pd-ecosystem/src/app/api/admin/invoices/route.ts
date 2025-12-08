import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, payments, distributors } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/invoices - 영수증 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const distributorId = searchParams.get('distributorId');
    const status = searchParams.get('status');

    let query = db
      .select({
        invoice: invoices,
        payment: payments,
        distributor: distributors,
      })
      .from(invoices)
      .leftJoin(payments, eq(invoices.paymentId, payments.id))
      .leftJoin(distributors, eq(invoices.distributorId, distributors.id))
      .orderBy(desc(invoices.createdAt));

    const results = await query.all();

    // Apply filters in memory (since complex joins with filters can be tricky)
    let filtered = results;

    if (distributorId) {
      const distId = parseInt(distributorId);
      filtered = filtered.filter(r => r.invoice.distributorId === distId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(r => r.invoice.status === status);
    }

    return NextResponse.json({
      success: true,
      invoices: filtered.map(r => ({
        ...r.invoice,
        payment: r.payment,
        distributor: r.distributor,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/admin/invoices - 영수증 수동 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentId,
      distributorId,
      amount,
      taxAmount,
      dueDate,
    } = body;

    // 필수 필드 검증
    if (!paymentId || !distributorId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 영수증 번호 생성
    const invoiceNumber = `INV-${Date.now()}-${paymentId}`;
    const tax = taxAmount || Math.floor(amount * 0.1);
    const total = amount + tax;

    // 영수증 생성
    const result = await db.insert(invoices).values({
      paymentId,
      distributorId,
      invoiceNumber,
      amount,
      taxAmount: tax,
      totalAmount: total,
      dueDate: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : null,
      paidAt: null,
      status: 'draft',
      pdfUrl: null,
    }).returning();

    return NextResponse.json({
      success: true,
      invoice: result[0],
    });
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
