import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { RESERVED_SLUGS, SLUG_REGEX, SLUG_MIN_LENGTH, SLUG_MAX_LENGTH } from '@/lib/auth/constants';

// GET /api/dashboard/apply/check-slug?slug=xxx
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug')?.toLowerCase().trim();

    if (!slug) {
      return NextResponse.json({ available: false, reason: 'slug 값이 필요합니다.' });
    }

    // 길이 검증
    if (slug.length < SLUG_MIN_LENGTH) {
      return NextResponse.json({ available: false, reason: `최소 ${SLUG_MIN_LENGTH}자 이상이어야 합니다.` });
    }
    if (slug.length > SLUG_MAX_LENGTH) {
      return NextResponse.json({ available: false, reason: `최대 ${SLUG_MAX_LENGTH}자까지 가능합니다.` });
    }

    // 형식 검증
    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json({
        available: false,
        reason: '영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다. 시작과 끝은 문자 또는 숫자여야 합니다.',
      });
    }

    // 예약어 검증
    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.json({ available: false, reason: '사용할 수 없는 주소입니다.' });
    }

    // DB 중복 검증
    const existing = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.slug, slug))
      .get();

    if (existing) {
      return NextResponse.json({ available: false, reason: '이미 사용 중인 주소입니다.' });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Slug check failed:', error);
    return NextResponse.json(
      { available: false, reason: '확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
