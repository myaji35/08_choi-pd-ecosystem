import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'online' | 'offline' | 'b2b' | null;
    const tenantId = getTenantIdFromRequest(request);

    // 필터 조건 구성 (tenantId 필터 포함)
    const conditions = [eq(courses.published, true), eq(courses.tenantId, tenantId)];
    if (type) {
      conditions.push(eq(courses.type, type));
    }

    const result = await db.query.courses.findMany({
      where: conditions.length > 1 ? and(...conditions) : conditions[0],
      orderBy: (courses, { desc }) => [desc(courses.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
