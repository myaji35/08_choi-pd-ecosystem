/**
 * 테넌트 상세/수정/삭제 API
 *
 * GET    /api/tenants/:id — 테넌트 상세 조회
 * PATCH  /api/tenants/:id — 테넌트 수정
 * DELETE /api/tenants/:id — 테넌트 삭제 (소프트 딜리트)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPlanLimits } from '@/lib/tenant/context';

type RouteParams = { params: Promise<{ id: string }> };

// 인증 헬퍼
function authenticateRequest(request: NextRequest) {
  const clerkUserId = request.headers.get('x-clerk-user-id');
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  if (!clerkUserId && !isDevMode) {
    return { authenticated: false as const, userId: null };
  }
  return { authenticated: true as const, userId: clerkUserId || 'dev_user' };
}

// GET /api/tenants/:id — 테넌트 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = parseInt(id, 10);

    if (isNaN(tenantId)) {
      return NextResponse.json(
        { error: '유효하지 않은 테넌트 ID입니다.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .get();

    if (!tenant) {
      return NextResponse.json(
        { error: '테넌트를 찾을 수 없습니다.', code: 'TENANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 플랜 제한 정보 포함
    const limits = getPlanLimits(tenant.plan);

    return NextResponse.json({
      ...tenant,
      branding: {
        logoUrl: tenant.logoUrl,
        faviconUrl: tenant.faviconUrl,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        fontFamily: tenant.fontFamily,
      },
      limits: {
        maxSnsAccounts: limits.maxSnsAccounts,
        maxStorage: limits.maxStorage,
        usedStorage: tenant.usedStorage,
        maxTeamMembers: limits.maxTeamMembers,
        customDomain: limits.customDomain,
      },
    });

  } catch (error) {
    console.error('테넌트 조회 실패:', error);
    return NextResponse.json(
      { error: '테넌트 조회에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// PATCH /api/tenants/:id — 테넌트 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = parseInt(id, 10);

    if (isNaN(tenantId)) {
      return NextResponse.json(
        { error: '유효하지 않은 테넌트 ID입니다.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 수정 가능한 필드만 필터링
    const allowedFields = [
      'name', 'region', 'businessType',
      'logoUrl', 'faviconUrl', 'primaryColor', 'secondaryColor', 'fontFamily',
      'customDomain', 'settings', 'metadata',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // camelCase → snake_case 변환은 Drizzle가 자동 처리
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 필드가 없습니다.', code: 'NO_CHANGES' },
        { status: 400 }
      );
    }

    // updatedAt 갱신
    updateData.updatedAt = new Date();

    const updated = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, tenantId))
      .returning()
      .get();

    if (!updated) {
      return NextResponse.json(
        { error: '테넌트를 찾을 수 없습니다.', code: 'TENANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);

  } catch (error) {
    console.error('테넌트 수정 실패:', error);
    return NextResponse.json(
      { error: '테넌트 수정에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// DELETE /api/tenants/:id — 테넌트 삭제 (소프트 딜리트)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = parseInt(id, 10);

    if (isNaN(tenantId)) {
      return NextResponse.json(
        { error: '유효하지 않은 테넌트 ID입니다.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // 기본 테넌트(id=1)는 삭제 불가
    if (tenantId === 1) {
      return NextResponse.json(
        { error: '기본 테넌트는 삭제할 수 없습니다.', code: 'CANNOT_DELETE_DEFAULT' },
        { status: 403 }
      );
    }

    const now = new Date();
    const permanentDeletionDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30일 후

    const updated = await db
      .update(tenants)
      .set({
        status: 'deleted',
        deletedAt: now,
        updatedAt: now,
      })
      .where(eq(tenants.id, tenantId))
      .returning()
      .get();

    if (!updated) {
      return NextResponse.json(
        { error: '테넌트를 찾을 수 없습니다.', code: 'TENANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '테넌트가 비활성화되었습니다. 30일 후 완전 삭제됩니다.',
      deletedAt: now.toISOString(),
      permanentDeletionAt: permanentDeletionDate.toISOString(),
    });

  } catch (error) {
    console.error('테넌트 삭제 실패:', error);
    return NextResponse.json(
      { error: '테넌트 삭제에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
