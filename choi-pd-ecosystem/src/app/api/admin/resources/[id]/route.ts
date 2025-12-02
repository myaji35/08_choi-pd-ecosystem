import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorResources } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/admin/resources/[id] - 리소스 상세 조회
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

    const resource = await db
      .select()
      .from(distributorResources)
      .where(eq(distributorResources.id, id))
      .get();

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resource,
    });
  } catch (error) {
    console.error('Failed to fetch resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/resources/[id] - 리소스 정보 수정
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
      title,
      description,
      category,
      requiredPlan,
      isActive,
    } = body;

    // 리소스 존재 확인
    const existing = await db
      .select()
      .from(distributorResources)
      .where(eq(distributorResources.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    // 업데이트 데이터 준비
    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (requiredPlan !== undefined) updateData.requiredPlan = requiredPlan;
    if (isActive !== undefined) updateData.isActive = isActive;

    // 업데이트 실행
    await db
      .update(distributorResources)
      .set(updateData)
      .where(eq(distributorResources.id, id));

    // 업데이트된 데이터 조회
    const updated = await db
      .select()
      .from(distributorResources)
      .where(eq(distributorResources.id, id))
      .get();

    return NextResponse.json({
      success: true,
      resource: updated,
    });
  } catch (error) {
    console.error('Failed to update resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/resources/[id] - 리소스 삭제
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

    // 리소스 존재 확인
    const existing = await db
      .select()
      .from(distributorResources)
      .where(eq(distributorResources.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    // 삭제 실행
    await db.delete(distributorResources).where(eq(distributorResources.id, id));

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}

// POST /api/admin/resources/[id]/download - 다운로드 카운트 증가
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

    // 다운로드 카운트 증가
    await db
      .update(distributorResources)
      .set({
        downloadCount: sql`${distributorResources.downloadCount} + 1`,
      })
      .where(eq(distributorResources.id, id));

    return NextResponse.json({
      success: true,
      message: 'Download count updated',
    });
  } catch (error) {
    console.error('Failed to update download count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update download count' },
      { status: 500 }
    );
  }
}
