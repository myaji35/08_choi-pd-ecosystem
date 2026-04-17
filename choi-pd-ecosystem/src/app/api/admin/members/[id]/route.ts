import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

/** id 파라미터는 숫자(id) 또는 문자열(slug) 모두 허용 */
async function resolveMember(idOrSlug: string) {
  const asInt = parseInt(idOrSlug);
  if (!isNaN(asInt) && String(asInt) === idOrSlug) {
    return db.select().from(members).where(eq(members.id, asInt)).get();
  }
  return db.select().from(members).where(eq(members.slug, idOrSlug)).get();
}

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
    const member = await resolveMember(id);

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

    const member = await resolveMember(id);

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
      .where(eq(members.id, member.id));

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

// PATCH /api/admin/members/:id - 프로필 필드 + 브랜드 DNA 편집
export async function PATCH(
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
    const member = await resolveMember(id);
    if (!member) {
      return NextResponse.json(
        { success: false, error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      profession,
      region,
      businessType,
      bio,
      profileImage,
      coverImage,
      socialLinks,
      themeConfig,
      status,
    } = body as Record<string, unknown>;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name === 'string') updateData.name = name.trim();
    if (typeof email === 'string') updateData.email = email.trim();
    if (typeof phone === 'string' || phone === null) updateData.phone = phone || null;
    if (typeof profession === 'string' || profession === null) updateData.profession = profession || null;
    if (typeof region === 'string' || region === null) updateData.region = region || null;
    if (typeof businessType === 'string' || businessType === null) updateData.businessType = businessType || null;
    if (typeof bio === 'string' || bio === null) updateData.bio = bio || null;
    if (typeof profileImage === 'string' || profileImage === null) updateData.profileImage = profileImage || null;
    if (typeof coverImage === 'string' || coverImage === null) updateData.coverImage = coverImage || null;

    if (socialLinks !== undefined) {
      updateData.socialLinks =
        typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks);
    }
    if (themeConfig !== undefined) {
      updateData.themeConfig =
        typeof themeConfig === 'string' ? themeConfig : JSON.stringify(themeConfig);
    }
    if (typeof status === 'string') {
      const valid = ['pending_approval', 'approved', 'rejected', 'suspended'];
      if (!valid.includes(status)) {
        return NextResponse.json(
          { success: false, error: '유효하지 않은 상태입니다.' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length <= 1) {
      return NextResponse.json(
        { success: false, error: '수정할 필드가 없습니다.' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, member.id))
      .returning();

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Failed to patch member:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'patch failed' },
      { status: 500 }
    );
  }
}
