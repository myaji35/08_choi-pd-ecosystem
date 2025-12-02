import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { reason } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // 수요자 존재 확인
    const distributor = await db
      .select()
      .from(distributors)
      .where(eq(distributors.id, id))
      .get();

    if (!distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // 거부 처리 (사유를 notes에 추가)
    const updatedNotes = reason
      ? `[거부 사유] ${reason}\n${distributor.notes || ''}`
      : distributor.notes;

    await db
      .update(distributors)
      .set({
        status: 'rejected',
        notes: updatedNotes,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(distributors.id, id));

    return NextResponse.json({
      success: true,
      message: 'Distributor rejected',
    });
  } catch (error) {
    console.error('Failed to reject distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject distributor' },
      { status: 500 }
    );
  }
}
