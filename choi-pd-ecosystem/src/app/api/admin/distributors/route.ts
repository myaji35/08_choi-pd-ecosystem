import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';

// GET /api/admin/distributors - 수요자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tenantId = getTenantIdFromRequest(request);

    const results = status
      ? await db.select().from(distributors).where(and(eq(distributors.tenantId, tenantId), eq(distributors.status, status as 'pending' | 'approved' | 'active' | 'suspended' | 'rejected'))).all()
      : await db.select().from(distributors).where(eq(distributors.tenantId, tenantId)).all();

    return NextResponse.json({
      success: true,
      distributors: results,
    });
  } catch (error) {
    console.error('Failed to fetch distributors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distributors' },
      { status: 500 }
    );
  }
}

// POST /api/admin/distributors - 신규 수요자 등록
export async function POST(request: NextRequest) {
  try {
    const { validateSlug } = await import('@/lib/distributors/slug');
    const body = await request.json();
    const { slug: slugRaw, name, email, phone, businessType, region, subscriptionPlan, notes } = body;

    // 필수 필드 검증
    if (!name || !email || !businessType) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // slug 필수 + 유효성 (서버 재검증)
    let slug: string | null = null;
    if (slugRaw) {
      const v = validateSlug(String(slugRaw));
      if (!v.ok) {
        return NextResponse.json(
          { success: false, error: `ID 오류: ${v.reason}` },
          { status: 400 }
        );
      }
      slug = v.normalized;
    } else {
      return NextResponse.json(
        { success: false, error: 'ID(slug)는 필수입니다' },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);

    // 이메일 중복 체크
    const existing = await db
      .select()
      .from(distributors)
      .where(eq(distributors.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    // slug 중복 체크 (distributors + members 교차)
    const { members } = await import('@/lib/db/schema');
    const [slugDupDist, slugDupMember] = await Promise.all([
      db.select({ id: distributors.id }).from(distributors)
        .where(and(eq(distributors.tenantId, tenantId), eq(distributors.slug, slug))).get(),
      db.select({ id: members.id }).from(members).where(eq(members.slug, slug)).get(),
    ]);
    if (slugDupDist || slugDupMember) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 ID입니다' },
        { status: 409 }
      );
    }

    // 수요자 생성
    const result = await db.insert(distributors).values({
      tenantId,
      slug,
      name,
      email,
      phone: phone || null,
      businessType,
      region: region || null,
      status: 'pending',
      subscriptionPlan: subscriptionPlan || null,
      notes: notes || null,
      totalRevenue: 0,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning();

    return NextResponse.json({
      success: true,
      distributor: result[0],
    });
  } catch (error) {
    console.error('Failed to create distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create distributor' },
      { status: 500 }
    );
  }
}
