import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inquiries, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, email, message, type } = body;

    // 필수 필드 검증
    if (!tenantId || !name || !email || !message) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 테넌트 존재 확인
    const tenant = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenant.length === 0) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      );
    }

    // 문의 저장
    await db.insert(inquiries).values({
      tenantId,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      type: type || 'contact',
      status: 'pending',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Brand page inquiry error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
