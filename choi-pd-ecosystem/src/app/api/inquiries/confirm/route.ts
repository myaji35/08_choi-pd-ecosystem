import { NextRequest, NextResponse } from 'next/server';
import { sendInquiryConfirmationEmail } from '@/lib/email';

// POST /api/inquiries/confirm - Send inquiry confirmation email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Send confirmation email
    const result = await sendInquiryConfirmationEmail(email, name);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
    });
  } catch (error) {
    console.error('Failed to send confirmation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}
