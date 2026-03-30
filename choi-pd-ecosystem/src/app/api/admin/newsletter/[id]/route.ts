import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 ID입니다' },
        { status: 400 }
      );
    }

    await db.delete(leads).where(and(
      eq(leads.id, id),
      tenantFilter(leads.tenantId, tenantId)
    ));

    return NextResponse.json({
      success: true,
      message: '구독자가 삭제되었습니다',
    });
  } catch (error) {
    console.error('Newsletter subscriber deletion error:', error);
    return NextResponse.json(
      { success: false, error: '구독자 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
