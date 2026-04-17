import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const invoice = await db.select().from(invoices).where(eq(invoices.id, id)).get();
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const updateData: { status?: 'sent' } = {};
    if (invoice.status === 'draft') updateData.status = 'sent';

    if (Object.keys(updateData).length > 0) {
      await db.update(invoices).set(updateData).where(eq(invoices.id, id));
    }

    return NextResponse.json({
      success: true,
      message: '영수증을 재발송했습니다.',
      invoice: { ...invoice, ...updateData },
    });
  } catch (error) {
    console.error('Failed to resend invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend invoice' },
      { status: 500 }
    );
  }
}
