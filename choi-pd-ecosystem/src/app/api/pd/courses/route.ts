import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/pd/courses - 교육 과정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    let results;

    if (publishedOnly) {
      results = await db
        .select()
        .from(courses)
        .where(eq(courses.published, true))
        .orderBy(desc(courses.createdAt))
        .all();
    } else {
      results = await db
        .select()
        .from(courses)
        .orderBy(desc(courses.createdAt))
        .all();
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      results = results.filter(course => course.type === type);
    }

    return NextResponse.json({
      success: true,
      courses: results,
    });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/pd/courses - 교육 과정 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      price,
      thumbnailUrl,
      externalLink,
      published = true,
    } = body;

    // 필수 필드 검증
    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 과정 생성
    const result = await db.insert(courses).values({
      title,
      description,
      type,
      price: price || null,
      thumbnailUrl: thumbnailUrl || null,
      externalLink: externalLink || null,
      published,
    }).returning();

    return NextResponse.json({
      success: true,
      course: result[0],
    });
  } catch (error) {
    console.error('Failed to create course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
