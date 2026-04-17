import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';

/** id 파라미터: 숫자 → distributors.id / 문자 → distributors.slug */
async function resolveDistributor(idOrSlug: string, tenantId: number) {
  const n = parseInt(idOrSlug);
  if (!isNaN(n) && String(n) === idOrSlug) {
    return db
      .select()
      .from(distributors)
      .where(and(eq(distributors.id, n), eq(distributors.tenantId, tenantId)))
      .get();
  }
  return db
    .select()
    .from(distributors)
    .where(and(eq(distributors.slug, idOrSlug), eq(distributors.tenantId, tenantId)))
    .get();
}

// GET /api/admin/distributors/[id] - 수요자 상세 조회 (id 또는 slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrSlug } = await params;
    const tenantId = getTenantIdFromRequest(request);

    const distributor = await resolveDistributor(idOrSlug, tenantId);

    if (!distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      distributor,
    });
  } catch (error) {
    console.error('Failed to fetch distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distributor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/distributors/[id] - 수요자 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrSlug } = await params;
    const tenantId = getTenantIdFromRequest(request);
    const existing = await resolveDistributor(idOrSlug, tenantId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      businessType,
      region,
      status,
      subscriptionPlan,
      notes,
    } = body;

    // 이메일 중복 체크 (자신 제외)
    if (email && email !== existing.email) {
      const emailExists = await db
        .select()
        .from(distributors)
        .where(eq(distributors.email, email))
        .get();

      if (emailExists && emailExists.id !== existing.id) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // 업데이트 데이터 준비
    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (region !== undefined) updateData.region = region;
    if (status !== undefined) updateData.status = status;
    if (subscriptionPlan !== undefined) updateData.subscriptionPlan = subscriptionPlan;
    if (notes !== undefined) updateData.notes = notes;

    await db
      .update(distributors)
      .set(updateData)
      .where(eq(distributors.id, existing.id));

    const updated = await db
      .select()
      .from(distributors)
      .where(eq(distributors.id, existing.id))
      .get();

    return NextResponse.json({
      success: true,
      distributor: updated,
    });
  } catch (error) {
    console.error('Failed to update distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update distributor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/distributors/[id] - 수요자 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrSlug } = await params;
    const tenantId = getTenantIdFromRequest(request);
    const existing = await resolveDistributor(idOrSlug, tenantId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    await db
      .delete(distributors)
      .where(and(eq(distributors.id, existing.id), eq(distributors.tenantId, tenantId)));

    return NextResponse.json({
      success: true,
      message: 'Distributor deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete distributor' },
      { status: 500 }
    );
  }
}
