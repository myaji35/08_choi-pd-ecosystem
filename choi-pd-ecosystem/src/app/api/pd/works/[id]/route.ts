import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { works } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { z } from 'zod';

// Zod 업데이트 스키마 (모든 필드 optional)
const updateWorkSchema = z.object({
  title: z.string().min(1, '제목은 비어있을 수 없습니다').optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url('유효한 URL이어야 합니다').optional(),
  category: z.enum(['gallery', 'press'], {
    message: "category는 'gallery' 또는 'press'여야 합니다",
  }).optional(),
});

function parseId(idStr: string): number | null {
  const id = parseInt(idStr, 10);
  return isNaN(id) ? null : id;
}

// GET /api/pd/works/[id] - 작품/언론보도 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);

    if (id === null) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Invalid work ID' } },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const work = await db
      .select()
      .from(works)
      .where(and(eq(works.id, id), eq(works.tenantId, tenantId)))
      .get();

    if (!work) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Work not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, work });
  } catch (error) {
    console.error('Failed to fetch work:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch work' } },
      { status: 500 }
    );
  }
}

// PUT /api/pd/works/[id] - 작품/언론보도 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);

    if (id === null) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Invalid work ID' } },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Zod 검증
    const parsed = updateWorkSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError.message,
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { title, description, imageUrl, category } = parsed.data;

    // 업데이트 데이터 준비 (전달된 필드만)
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category !== undefined) updateData.category = category;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_DATA', message: 'No fields to update' } },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const result = await db
      .update(works)
      .set(updateData)
      .where(and(eq(works.id, id), eq(works.tenantId, tenantId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Work not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      work: result[0],
    });
  } catch (error) {
    console.error('Failed to update work:', error);
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update work' } },
      { status: 500 }
    );
  }
}

// DELETE /api/pd/works/[id] - 작품/언론보도 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);

    if (id === null) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Invalid work ID' } },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const result = await db
      .delete(works)
      .where(and(eq(works.id, id), eq(works.tenantId, tenantId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Work not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Work deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete work:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete work' } },
      { status: 500 }
    );
  }
}
