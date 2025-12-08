import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// DELETE /api/pd/newsletter/[id] - 구독 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscriber ID' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber removed successfully',
    });
  } catch (error) {
    console.error('Failed to remove subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove subscriber' },
      { status: 500 }
    );
  }
}
