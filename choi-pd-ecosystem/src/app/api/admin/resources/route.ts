import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorResources } from '@/lib/db/schema';
import { eq, sql, like, or } from 'drizzle-orm';

// GET /api/admin/resources - 리소스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    // 카테고리 필터
    const results = category && category !== 'all'
      ? await db.select().from(distributorResources).where(eq(distributorResources.category, category as any)).all()
      : await db.select().from(distributorResources).all();

    // 검색어 필터 (클라이언트 사이드에서 처리하거나 여기서 처리 가능)
    let filteredResults = results;
    if (searchQuery) {
      filteredResults = results.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      resources: filteredResults,
    });
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/admin/resources - 신규 리소스 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      category,
      requiredPlan,
    } = body;

    // 필수 필드 검증
    if (!title || !fileUrl || !fileType || !category) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 리소스 생성
    const result = await db.insert(distributorResources).values({
      title,
      description: description || null,
      fileUrl,
      fileType,
      fileSize: fileSize || null,
      category,
      requiredPlan: requiredPlan || 'all',
      downloadCount: 0,
      isActive: true,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning();

    return NextResponse.json({
      success: true,
      resource: result[0],
    });
  } catch (error) {
    console.error('Failed to create resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
