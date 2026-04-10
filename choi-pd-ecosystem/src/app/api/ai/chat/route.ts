import { NextRequest, NextResponse } from 'next/server';
import { processChatMessage } from '@/lib/ai';
import { loadMemberContext, saveConversationTurn } from '@/lib/obsidian';
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

    // Obsidian Memory: 회원 컨텍스트 로드 (userId가 있을 때만)
    let memberContext: string | undefined;
    if (userId) {
      try {
        memberContext = await loadMemberContext(userId);
      } catch (err) {
        console.error('Memory context load error:', err);
      }
    }

    const result = await processChatMessage({
      message,
      sessionId: finalSessionId,
      userId,
      userType: finalUserType,
      memberContext
    });

    // Obsidian Memory: 대화를 Vault에 비동기 저장 (응답 지연 없이)
    if (userId) {
      saveConversationTurn({
        sessionId: finalSessionId,
        memberId: userId,
        userMessage: message,
        assistantResponse: result.response,
        intent: result.matchedFaqId ? 'faq' : 'general',
        metadata: {
          confidence: result.confidence,
          matchedFaqId: result.matchedFaqId
        }
      }).catch(err => console.error('Memory save error:', err));
    }

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
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
