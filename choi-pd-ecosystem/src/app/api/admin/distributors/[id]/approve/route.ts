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

    // 승인 처리
    await db
      .update(distributors)
      .set({
        status: 'approved',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(distributors.id, id));

    return NextResponse.json({
      success: true,
      message: 'Distributor approved',
    });
  } catch (error) {
    console.error('Failed to approve distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve distributor' },
      { status: 500 }
    );
  }
}
