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

    // reason 필수 파라미터 검증
    let body: { reason?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 }
      );
    }

    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Suspension reason is required' },
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

    // 상태 전이 검증: active → suspended만 허용
    if (distributor.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot suspend distributor with status '${distributor.status}'. Only 'active' distributors can be suspended.`,
        },
        { status: 409 }
      );
    }

    // 정지 처리 (사유를 notes에 추가)
    const suspendNote = `[정지 사유 ${new Date().toISOString()}] ${reason.trim()}`;
    const updatedNotes = distributor.notes
      ? `${suspendNote}\n${distributor.notes}`
      : suspendNote;

    await db
      .update(distributors)
      .set({
        status: 'suspended',
        notes: updatedNotes,
        lastActivityAt: new Date(),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(distributors.id, id));

    // 활동 로그 기록
    await db.insert(distributorActivityLog).values({
      tenantId,
      distributorId: id,
      activityType: 'support_request', // enum 제약상 가장 근접한 타입 사용
      description: `유통사 정지: ${distributor.name} (${distributor.email}) — active → suspended. 사유: ${reason.trim()}`,
      metadata: JSON.stringify({
        action: 'suspend',
        previousStatus: 'active',
        newStatus: 'suspended',
        reason: reason.trim(),
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor suspended',
    });
  } catch (error) {
    console.error('Failed to suspend distributor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to suspend distributor' },
      { status: 500 }
    );
  }
}
