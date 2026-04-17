import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsScheduledPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }
    const post = await db
      .select()
      .from(snsScheduledPosts)
      .where(eq(snsScheduledPosts.id, id))
      .get();
    if (!post) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('scheduled-post GET failed:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(snsScheduledPosts)
      .where(eq(snsScheduledPosts.id, id))
      .get();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (existing.status === 'published' || existing.status === 'publishing') {
      return NextResponse.json(
        { success: false, error: '이미 발행된 포스트는 수정할 수 없습니다.' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { message, imageUrl, link, scheduledAt, status } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (message !== undefined) updateData.message = message;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (link !== undefined) updateData.link = link || null;
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (status !== undefined) updateData.status = status;

    const result = await db
      .update(snsScheduledPosts)
      .set(updateData)
      .where(eq(snsScheduledPosts.id, id))
      .returning();

    return NextResponse.json({ success: true, post: result[0] });
  } catch (error) {
    console.error('scheduled-post PATCH failed:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }
    const deleted = await db
      .delete(snsScheduledPosts)
      .where(eq(snsScheduledPosts.id, id))
      .returning();
    if (deleted.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('scheduled-post DELETE failed:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
