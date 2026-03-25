import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, createSession } from '@/lib/auth/session';
import { RESERVED_SLUGS, SLUG_REGEX, SLUG_MIN_LENGTH, SLUG_MAX_LENGTH } from '@/lib/auth/constants';

// POST /api/dashboard/apply - 회원 가입 신청
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    if (session.role !== 'member') {
      return NextResponse.json(
        { success: false, error: '회원만 신청할 수 있습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slug, businessType, region, bio } = body;

    // slug 필수 검증
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'slug는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // slug 형식 검증
    if (normalizedSlug.length < SLUG_MIN_LENGTH || normalizedSlug.length > SLUG_MAX_LENGTH) {
      return NextResponse.json(
        { success: false, error: `slug는 ${SLUG_MIN_LENGTH}~${SLUG_MAX_LENGTH}자여야 합니다.` },
        { status: 400 }
      );
    }

    if (!SLUG_REGEX.test(normalizedSlug)) {
      return NextResponse.json(
        { success: false, error: '영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.' },
        { status: 400 }
      );
    }

    if (RESERVED_SLUGS.includes(normalizedSlug)) {
      return NextResponse.json(
        { success: false, error: '사용할 수 없는 주소입니다.' },
        { status: 400 }
      );
    }

    // DB 중복 검증
    const existingSlug = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.slug, normalizedSlug))
      .get();

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 주소입니다.' },
        { status: 409 }
      );
    }

    // 이미 신청한 사용자인지 확인
    const existingMember = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.email, session.email))
      .get();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: '이미 신청된 계정입니다.' },
        { status: 409 }
      );
    }

    // businessType 검증
    const validBusinessTypes = ['individual', 'company', 'organization'];
    if (businessType && !validBusinessTypes.includes(businessType)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 사업 유형입니다.' },
        { status: 400 }
      );
    }

    // 회원 등록
    const result = await db.insert(members).values({
      towningraphUserId: session.userId,
      slug: normalizedSlug,
      name: session.name,
      email: session.email,
      businessType: businessType || 'individual',
      region: region || null,
      bio: bio || null,
      status: 'pending_approval',
      subscriptionPlan: 'basic',
      enabledModules: '[]',
      themeConfig: '{}',
    });

    const memberId = Number(result.lastInsertRowid);

    // 세션 업데이트 (slug와 status 반영)
    await createSession({
      ...session,
      slug: normalizedSlug,
      status: 'pending_approval',
    });

    return NextResponse.json({
      success: true,
      memberId,
      slug: normalizedSlug,
    });
  } catch (error) {
    console.error('Member apply failed:', error);
    return NextResponse.json(
      { success: false, error: '신청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
