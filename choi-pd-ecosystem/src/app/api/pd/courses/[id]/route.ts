import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/pd/courses/[id] - 과정 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .get();

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Failed to fetch course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/pd/courses/[id] - 과정 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      type,
      price,
      thumbnailUrl,
      externalLink,
      published,
    } = body;

    // 업데이트 데이터 준비
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (price !== undefined) updateData.price = price;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (externalLink !== undefined) updateData.externalLink = externalLink;
    if (published !== undefined) updateData.published = published;

    const result = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course: result[0],
    });
  } catch (error) {
    console.error('Failed to update course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/pd/courses/[id] - 과정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
