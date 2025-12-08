import { NextRequest, NextResponse } from 'next/server';
import { generateEmail } from '@/lib/ai';

// POST /api/ai/generate/email - Generate email draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { purpose, recipient, tone, userId, userType } = body;

    // Validation
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
