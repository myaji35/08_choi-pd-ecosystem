import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors, distributorActivityLog } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // 수요자 존재 확인 (tenantId 소유권)
    const tenantId = getTenantIdFromRequest(request);
    const distributor = await db
      .select()
      .from(distributors)
      .where(and(eq(distributors.id, id), eq(distributors.tenantId, tenantId)))
      .get();

    if (!distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // 상태 전이 검증: approved → active만 허용
    if (distributor.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot activate distributor with status '${distributor.status}'. Only 'approved' distributors can be activated.`,
        },
        { status: 409 }
      );
    }

    const now = new Date();

    // 활성화 처리 + subscriptionStartDate 설정
    await db
      .update(distributors)
      .set({
        status: 'active',
        subscriptionStartDate: now,
        lastActivityAt: now,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(distributors.id, id));

    // 활동 로그 기록
    await db.insert(distributorActivityLog).values({
      tenantId,
      distributorId: id,
      activityType: 'login', // enum 제약상 가장 근접한 타입 사용
      description: `유통사 활성화: ${distributor.name} (${distributor.email}) — approved → active`,
      metadata: JSON.stringify({
        action: 'activate',
        previousStatus: 'approved',
        newStatus: 'active',
        subscriptionStartDate: now.toISOString(),
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor activated',
      data: {
        subscriptionStartDate: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to activate distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate distributor' },
      { status: 500 }
    );
  }
}
