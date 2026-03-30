import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

const leadSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const validatedData = leadSchema.parse(body);

    // 이미 구독한 이메일인지 확인 (테넌트 범위 내)
    const existing = await db
      .select()
      .from(leads)
      .where(and(eq(leads.email, validatedData.email), tenantFilter(leads.tenantId, tenantId)))
      .get();

    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 구독하신 이메일입니다' },
        { status: 400 }
      );
    }

    const result = await db.insert(leads).values(withTenantId({
      email: validatedData.email,
    }, tenantId)).returning();

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: '구독에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
