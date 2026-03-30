/**
 * 테넌트 CRUD API
 *
 * POST /api/tenants — 테넌트 생성 (온보딩)
 * GET  /api/tenants — 현재 사용자의 테넌트 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants, tenantMembers } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// 유효한 직업군 목록
const VALID_PROFESSIONS = ['pd', 'shopowner', 'realtor', 'educator', 'insurance', 'freelancer'] as const;
const VALID_BUSINESS_TYPES = ['individual', 'company', 'organization'] as const;

// slug 유효성 검사 (영문 소문자, 숫자, 하이픈만 허용)
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(slug);
}

// POST /api/tenants — 테넌트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, profession, businessType, region } = body;

    // 필수 필드 검증
    if (!name || !slug || !profession) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // slug 형식 검증
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'slug는 영문 소문자, 숫자, 하이픈만 허용되며 3~50자여야 합니다.', code: 'INVALID_SLUG' },
        { status: 400 }
      );
    }

    // profession 검증
    if (!VALID_PROFESSIONS.includes(profession)) {
      return NextResponse.json(
        { error: '유효하지 않은 직업군입니다.', code: 'INVALID_PROFESSION' },
        { status: 400 }
      );
    }

    // businessType 검증 (선택적)
    if (businessType && !VALID_BUSINESS_TYPES.includes(businessType)) {
      return NextResponse.json(
        { error: '유효하지 않은 사업자 유형입니다.', code: 'INVALID_BUSINESS_TYPE' },
        { status: 400 }
      );
    }

    // slug 중복 확인
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .get();

    if (existingTenant) {
      return NextResponse.json(
        { error: '이미 사용 중인 slug입니다.', code: 'TENANT_SLUG_TAKEN' },
        { status: 409 }
      );
    }

    // 인증 정보에서 clerkUserId 추출
    const clerkUserId = request.headers.get('x-clerk-user-id');
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!clerkUserId && !isDevMode) {
      return NextResponse.json(
        { error: '인증이 필요합니다', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const userId = clerkUserId || 'dev_user';

    // 테넌트 생성
    const newTenant = await db.insert(tenants).values({
      clerkUserId: userId,
      name,
      slug,
      profession,
      businessType: businessType || 'individual',
      region: region || null,
      plan: 'free',
      status: 'active',
    }).returning().get();

    // 소유자를 테넌트 멤버로 등록
    await db.insert(tenantMembers).values({
      tenantId: newTenant.id,
      clerkUserId: userId,
      email: body.email || `${userId}@placeholder.com`,
      name,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    });

    return NextResponse.json({
      id: newTenant.id,
      name: newTenant.name,
      slug: newTenant.slug,
      profession: newTenant.profession,
      plan: newTenant.plan,
      status: newTenant.status,
      createdAt: newTenant.createdAt,
      publicUrl: `https://${newTenant.slug}.${process.env.BASE_DOMAIN || 'impd.io'}`,
    }, { status: 201 });

  } catch (error) {
    console.error('테넌트 생성 실패:', error);
    return NextResponse.json(
      { error: '테넌트 생성에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET /api/tenants — 현재 사용자의 테넌트 목록
export async function GET(request: NextRequest) {
  try {
    // 인증 정보에서 clerkUserId 추출
    const clerkUserId = request.headers.get('x-clerk-user-id');
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!clerkUserId && !isDevMode) {
      return NextResponse.json(
        { error: '인증이 필요합니다', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const userId = clerkUserId || 'dev_user';

    // 사용자가 속한 테넌트 멤버십 조회
    const memberships = await db
      .select({
        tenantId: tenantMembers.tenantId,
        role: tenantMembers.role,
        tenant: tenants,
      })
      .from(tenantMembers)
      .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
      .where(eq(tenantMembers.clerkUserId, userId))
      .orderBy(desc(tenants.createdAt))
      .all();

    return NextResponse.json({
      tenants: memberships.map(m => ({
        ...m.tenant,
        role: m.role,
      })),
      total: memberships.length,
    });

  } catch (error) {
    console.error('테넌트 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '테넌트 목록 조회에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
