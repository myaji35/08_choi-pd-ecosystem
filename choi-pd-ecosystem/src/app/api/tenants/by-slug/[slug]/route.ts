/**
 * 테넌트 slug 조회 API
 *
 * GET /api/tenants/by-slug/:slug — slug로 활성 테넌트 조회
 */

import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || slug.length < 3) {
      return NextResponse.json(
        { error: '유효하지 않은 slug입니다.', code: 'INVALID_SLUG' },
        { status: 400 }
      );
    }

    const tenant = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, slug), eq(tenants.status, 'active')))
      .get();

    if (!tenant) {
      return NextResponse.json(
        { error: '테넌트를 찾을 수 없습니다.', code: 'TENANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 민감 정보 제외하고 공개 정보만 반환
    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      profession: tenant.profession,
      plan: tenant.plan,
      status: tenant.status,
      logoUrl: tenant.logoUrl,
      faviconUrl: tenant.faviconUrl,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      fontFamily: tenant.fontFamily,
      createdAt: tenant.createdAt,
    });
  } catch (error) {
    console.error('테넌트 slug 조회 실패:', error);
    return NextResponse.json(
      { error: '테넌트 조회에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
