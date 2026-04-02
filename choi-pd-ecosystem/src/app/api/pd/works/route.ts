import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { works } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';
import { z } from 'zod';

// Zod 입력 검증 스키마
const createWorkSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url('유효한 URL이어야 합니다'),
  category: z.enum(['gallery', 'press'], {
    errorMap: () => ({ message: "category는 'gallery' 또는 'press'여야 합니다" }),
  }),
});

// GET /api/pd/works - 작품/언론보도 목록 조회
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let results;

    if (category && (category === 'gallery' || category === 'press')) {
      results = await db
        .select()
        .from(works)
        .where(and(
          tenantFilter(works.tenantId, tenantId),
          eq(works.category, category)
        ))
        .orderBy(desc(works.createdAt))
        .all();
    } else {
      results = await db
        .select()
        .from(works)
        .where(tenantFilter(works.tenantId, tenantId))
        .orderBy(desc(works.createdAt))
        .all();
    }

    return NextResponse.json({
      success: true,
      works: results,
    });
  } catch (error) {
    console.error('Failed to fetch works:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch works' } },
      { status: 500 }
    );
  }
}

// POST /api/pd/works - 작품/언론보도 생성
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    // Zod 검증
    const parsed = createWorkSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError.message,
            details: parsed.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { title, description, imageUrl, category } = parsed.data;

    const result = await db.insert(works).values(
      withTenantId({
        title,
        description: description ?? null,
        imageUrl,
        category,
      }, tenantId)
    ).returning();

    return NextResponse.json({
      success: true,
      work: result[0],
    });
  } catch (error) {
    console.error('Failed to create work:', error);
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create work' } },
      { status: 500 }
    );
  }
}
