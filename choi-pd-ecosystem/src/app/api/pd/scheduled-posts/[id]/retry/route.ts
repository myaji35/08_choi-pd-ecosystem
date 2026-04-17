import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsScheduledPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
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
    if (post.status !== 'failed') {
      return NextResponse.json(
        { success: false, error: '실패 상태인 포스트만 재시도할 수 있습니다.' },
        { status: 409 }
      );
    }

    const result = await db
      .update(snsScheduledPosts)
      .set({
        status: 'pending',
        error: null,
        retryCount: (post.retryCount || 0) + 1,
        scheduledAt: new Date(Date.now() + 60_000),
        updatedAt: new Date(),
      })
      .where(eq(snsScheduledPosts.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      post: result[0],
      message: '1분 후 재발행이 시도됩니다.',
    });
  } catch (error) {
    console.error('scheduled-post retry failed:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
