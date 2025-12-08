import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET /api/admin/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');

    let query = db.select().from(posts);

    if (category) {
      query = query.where(eq(posts.category, category as any)) as any;
    }

    if (published !== null && published !== undefined) {
      query = query.where(eq(posts.published, published === 'true')) as any;
    }

    const allPosts = await query.orderBy(desc(posts.createdAt)).all();

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
      .values({
        title,
        content,
        category,
        published: published !== undefined ? published : true,
      })
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
