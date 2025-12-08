/**
 * Epic 21: 2FA 비활성화 API
 * POST /api/admin/security/2fa/disable - 2FA 비활성화
 */

import { NextRequest, NextResponse } from 'next/server';
import { disable2FA } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing user ID' },
        { status: 400 }
      );
    }

    await disable2FA(userId);

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
