import { NextRequest, NextResponse } from 'next/server';
import { generateSnsPost } from '@/lib/ai';

const SESSION_COOKIE_NAME = 'impd_session';

// POST /api/ai/generate/post - Generate SNS post draft
export async function POST(request: NextRequest) {
  try {
    // 인증 확인: 세션 쿠키에서 추출 (body userId 신뢰 금지)
    const isDevMode = process.env.DEV_MODE === 'true';
    const sessionCookie =
      request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.cookies.get('admin_session')?.value;

    if (!isDevMode && !sessionCookie) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { topic, platform, tone, userId, userType } = body;

    // Validation
    if (!topic || !platform || !userId || !userType) {
      return NextResponse.json(
        { success: false, error: 'topic, platform, userId, and userType are required' },
        { status: 400 }
      );
    }

    if (!['facebook', 'instagram', 'twitter', 'linkedin'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform' },
        { status: 400 }
      );
    }

    if (!['distributor', 'pd', 'admin'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userType' },
        { status: 400 }
      );
    }

    const generatedPost = await generateSnsPost({
      topic,
      platform,
      tone: tone || 'professional',
      userId,
      userType
    });

    return NextResponse.json({
      success: true,
      data: {
        post: generatedPost,
        platform,
        topic
      }
    });
  } catch (error: any) {
    console.error('Error generating SNS post:', error);
    return NextResponse.json(
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
