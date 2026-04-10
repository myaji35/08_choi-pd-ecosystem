import { NextRequest, NextResponse } from 'next/server';
import { generateEmail } from '@/lib/ai';

const SESSION_COOKIE_NAME = 'impd_session';

// POST /api/ai/generate/email - Generate email draft
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

    const { purpose, recipient, tone, userId, userType } = body;

    // Validation (userId는 body에서 받되, 인증은 세션 쿠키로 검증됨)
    if (!purpose || !recipient || !userId || !userType) {
      return NextResponse.json(
        { success: false, error: 'purpose, recipient, userId, and userType are required' },
        { status: 400 }
      );
    }

    if (!['distributor', 'pd', 'admin'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userType' },
        { status: 400 }
      );
    }

    const generatedEmail = await generateEmail({
      purpose,
      recipient,
      tone: tone || 'formal',
      userId,
      userType
    });

    return NextResponse.json({
      success: true,
      data: {
        email: generatedEmail,
        purpose,
        recipient
      }
    });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
