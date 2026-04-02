import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

// GET /api/admin/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');

    const conditions = [tenantFilter(posts.tenantId, tenantId)];

    if (category) {
      conditions.push(eq(posts.category, category as 'notice' | 'review' | 'media'));
    }

    if (published !== null && published !== undefined) {
      conditions.push(eq(posts.published, published === 'true'));
    }

    const allPosts = await db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.createdAt)).all();

    return NextResponse.json({
      success: true,
      posts: allPosts,
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { title, content, category, published } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const result = await db
      .insert(posts)
      .values(withTenantId({
        title,
        content,
        category,
        published: published !== undefined ? published : true,
      }, tenantId))
      .returning()
      .get();

    return NextResponse.json({
      success: true,
      post: result,
    });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
