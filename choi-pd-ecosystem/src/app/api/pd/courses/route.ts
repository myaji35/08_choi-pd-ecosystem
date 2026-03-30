import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

// GET /api/pd/courses - 교육 과정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    let results;

    if (publishedOnly) {
      results = await db
        .select()
        .from(courses)
        .where(and(
          tenantFilter(courses.tenantId, tenantId),
          eq(courses.published, true)
        ))
        .orderBy(desc(courses.createdAt))
        .all();
    } else {
      results = await db
        .select()
        .from(courses)
        .where(tenantFilter(courses.tenantId, tenantId))
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
    const tenantId = getTenantIdFromRequest(request);
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

    // 과정 생성 (tenantId 자동 주입)
    const result = await db.insert(courses).values(
      withTenantId({
        title,
        description,
        type,
        price: price || null,
        thumbnailUrl: thumbnailUrl || null,
        externalLink: externalLink || null,
        published,
      }, tenantId)
    ).returning();

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
