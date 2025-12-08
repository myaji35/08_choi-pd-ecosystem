/**
 * Epic 21: 2FA 활성화 API
 * POST /api/admin/security/2fa/enable - 2FA 활성화
 */

import { NextRequest, NextResponse } from 'next/server';
import { enable2FA } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userType, method = 'totp' } = body;

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { secret, backupCodes } = await enable2FA(userId, userType, method);

    // 실제 프로덕션에서는 QR 코드 생성
    const otpAuthUrl = `otpauth://totp/imPD:${userId}?secret=${secret}&issuer=imPD`;

    return NextResponse.json({
      success: true,
      data: {
        secret,
        backupCodes,
        otpAuthUrl,
        // QR 코드는 클라이언트에서 생성: qrcode.react 라이브러리 사용
      },
      message: '2FA enabled successfully. Save your backup codes in a secure location.',
    });
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}
