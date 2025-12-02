import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/admin/distributors/[id] - 수요자 상세 조회
export async function GET(
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

    return NextResponse.json({
      success: true,
      distributor,
    });
  } catch (error) {
    console.error('Failed to fetch distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distributor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/distributors/[id] - 수요자 정보 수정
export async function PUT(
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

    const body = await request.json();
    const {
      name,
      email,
      phone,
      businessType,
      region,
      status,
      subscriptionPlan,
      notes,
    } = body;

    // 수요자 존재 확인
    const existing = await db
      .select()
      .from(distributors)
      .where(eq(distributors.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // 이메일 중복 체크 (자신 제외)
    if (email && email !== existing.email) {
      const emailExists = await db
        .select()
        .from(distributors)
        .where(eq(distributors.email, email))
        .get();

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // 업데이트 데이터 준비
    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (region !== undefined) updateData.region = region;
    if (status !== undefined) updateData.status = status;
    if (subscriptionPlan !== undefined) updateData.subscriptionPlan = subscriptionPlan;
    if (notes !== undefined) updateData.notes = notes;

    // 업데이트 실행
    await db
      .update(distributors)
      .set(updateData)
      .where(eq(distributors.id, id));

    // 업데이트된 데이터 조회
    const updated = await db
      .select()
      .from(distributors)
      .where(eq(distributors.id, id))
      .get();

    return NextResponse.json({
      success: true,
      distributor: updated,
    });
  } catch (error) {
    console.error('Failed to update distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update distributor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/distributors/[id] - 수요자 삭제
export async function DELETE(
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
    const existing = await db
      .select()
      .from(distributors)
      .where(eq(distributors.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // 삭제 실행 (CASCADE로 activity log도 자동 삭제)
    await db.delete(distributors).where(eq(distributors.id, id));

    return NextResponse.json({
      success: true,
      message: 'Distributor deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete distributor' },
      { status: 500 }
    );
  }
}
