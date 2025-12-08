import { NextRequest, NextResponse } from 'next/server';
import { processChatMessage } from '@/lib/ai';
import { nanoid } from 'nanoid';

// POST /api/ai/chat - Process chatbot message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { message, sessionId, userId, userType } = body;

    // Validation
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const finalSessionId = sessionId || nanoid();

    const finalUserType = userType || 'anonymous';

    if (!['distributor', 'pd', 'customer', 'anonymous'].includes(finalUserType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userType' },
        { status: 400 }
      );
    }

    const result = await processChatMessage({
      message,
      sessionId: finalSessionId,
      userId,
      userType: finalUserType
    });

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        sessionId: finalSessionId,
        matchedFaqId: result.matchedFaqId,
        confidence: result.confidence
      }
    });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
