import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import { jwtVerify } from 'jose';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'choi-pd-ecosystem-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // JWT 토큰 검증
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '새 비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 비밀번호 검증
    const hashedCurrentPassword = hashPassword(currentPassword);
    if (user.password !== hashedCurrentPassword) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 새 비밀번호로 업데이트
    const hashedNewPassword = hashPassword(newPassword);
    await db
      .update(adminUsers)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, userId));

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
