import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import {
  chatConversations,
  chatMessages,
  memberMemories,
  members,
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { chatWithAI } from '@/lib/chat/openai';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db
      .select()
      .from(members)
      .where(and(eq(members.towningraphUserId, session.userId), tenantFilter(members.tenantId, tenantId)))
      .get();
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const body = await request.json();
    const { conversationId, content, imageUrls } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'conversationId and content are required' },
        { status: 400 }
      );
    }

    // Verify conversation ownership (테넌트 범위 내)
    const conversation = await db
      .select()
      .from(chatConversations)
      .where(and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.memberId, member.id),
        tenantFilter(chatConversations.tenantId, tenantId)
      ))
      .get();
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // 1. Save user message
    const [userMessage] = await db
      .insert(chatMessages)
      .values(withTenantId({
        conversationId,
        role: 'user',
        content,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
      }, tenantId))
      .returning();

    // 2. Load recent 20 memories for this member
    const recentMemories = await db
      .select()
      .from(memberMemories)
      .where(eq(memberMemories.memberId, member.id))
      .orderBy(desc(memberMemories.createdAt))
      .limit(20);

    // 3. Load recent conversation history for context
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(12);
    const conversationHistory = history
      .reverse()
      .filter((m) => m.id !== userMessage.id)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // 4. Call OpenAI
    let aiResponse;
    try {
      aiResponse = await chatWithAI(content, recentMemories, conversationHistory, imageUrls);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'AI 호출 실패';
      // Save error as assistant message
      const [assistantMessage] = await db
        .insert(chatMessages)
        .values(withTenantId({
          conversationId,
          role: 'assistant',
          content: `[오류] ${errMsg}`,
        }, tenantId))
        .returning();

      return NextResponse.json({
        success: true,
        data: { userMessage, assistantMessage, memory: null },
      });
    }

    // 5. Save assistant message
    const [assistantMessage] = await db
      .insert(chatMessages)
      .values(withTenantId({
        conversationId,
        role: 'assistant',
        content: aiResponse.reply,
      }, tenantId))
      .returning();

    // 6. If memory extracted, save to memberMemories
    let savedMemory = null;
    if (aiResponse.memory) {
      const [memory] = await db
        .insert(memberMemories)
        .values(withTenantId({
          memberId: member.id,
          type: 'activity',
          date: aiResponse.memory.date,
          location: aiResponse.memory.location,
          category: aiResponse.memory.category,
          summary: aiResponse.memory.summary,
          imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
          sourceMessageId: userMessage.id,
        }, tenantId))
        .returning();
      savedMemory = memory;
    }

    // 7. Update conversation updatedAt
    await db
      .update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, conversationId));

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        memory: savedMemory,
      },
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
