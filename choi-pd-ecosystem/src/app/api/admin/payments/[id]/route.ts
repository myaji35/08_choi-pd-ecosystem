import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/payments/[id] - 결제 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .get();

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Failed to fetch payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/payments/[id] - 결제 상태 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { status, transactionId, paymentMethod, metadata } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    // 결제 상태 업데이트
    const updateData: any = {};
    if (status) updateData.status = status;
    if (transactionId) updateData.transactionId = transactionId;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (metadata) updateData.metadata = JSON.stringify(metadata);

    // completed 상태일 경우 paidAt 설정
    if (status === 'completed') {
      updateData.paidAt = Math.floor(Date.now() / 1000);
    }

    const result = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // completed 상태일 경우 자동으로 영수증 생성
    if (status === 'completed') {
      const payment = result[0];
      const invoiceNumber = `INV-${Date.now()}-${payment.id}`;
      const taxRate = 0.1; // 10% VAT
      const taxAmount = Math.floor(payment.amount * taxRate);
      const totalAmount = payment.amount + taxAmount;

      await db.insert(invoices).values({
        paymentId: payment.id,
        distributorId: payment.distributorId,
        invoiceNumber,
        amount: payment.amount,
        taxAmount,
        totalAmount,
        dueDate: null,
        paidAt: payment.paidAt,
        status: 'paid',
        pdfUrl: null,
      });
    }

    return NextResponse.json({
      success: true,
      payment: result[0],
    });
  } catch (error) {
    console.error('Failed to update payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
