import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/pd/inquiries/[id] - 문의 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const inquiry = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id))
      .get();

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('Failed to fetch inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiry' },
      { status: 500 }
    );
  }
}

// PUT /api/pd/inquiries/[id] - 문의 상태 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { status } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    // 유효한 상태 검증
    const validStatuses = ['pending', 'contacted', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiry: result[0],
    });
  } catch (error) {
    console.error('Failed to update inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

// DELETE /api/pd/inquiries/[id] - 문의 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(inquiries)
      .where(eq(inquiries.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
