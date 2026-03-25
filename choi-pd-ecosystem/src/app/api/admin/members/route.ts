import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

// GET /api/admin/members - 회원 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const status = request.nextUrl.searchParams.get('status');

    const results = status
      ? await db.select().from(members).where(eq(members.status, status)).all()
      : await db.select().from(members).all();

    return NextResponse.json({
      success: true,
      members: results,
    });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { success: false, error: '회원 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
