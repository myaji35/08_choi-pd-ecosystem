import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

// GET /api/admin/members/:id - 회원 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const member = await db
      .select()
      .from(members)
      .where(eq(members.id, parseInt(id)))
      .get();

    if (!member) {
      return NextResponse.json(
        { success: false, error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('Failed to fetch member:', error);
    return NextResponse.json(
      { success: false, error: '회원 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/members/:id - 회원 상태 변경 (승인/거부/정지)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    const validStatuses = ['pending_approval', 'approved', 'rejected', 'suspended'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const member = await db
      .select()
      .from(members)
      .where(eq(members.id, parseInt(id)))
      .get();

    if (!member) {
      return NextResponse.json(
        { success: false, error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 거부 시 사유 필수
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { success: false, error: '거부 사유를 입력해주세요.' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    // 승인 시 거부 사유 초기화
    if (status === 'approved') {
      updateData.rejectionReason = null;
    }

    await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: status === 'approved'
        ? '회원이 승인되었습니다.'
        : status === 'rejected'
        ? '회원이 거부되었습니다.'
        : status === 'suspended'
        ? '회원이 정지되었습니다.'
        : '상태가 변경되었습니다.',
    });
  } catch (error) {
    console.error('Failed to update member:', error);
    return NextResponse.json(
      { success: false, error: '회원 상태 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}
