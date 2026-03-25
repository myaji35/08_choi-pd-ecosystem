/**
 * Obsidian Memory System - Memory Service
 * 기존 ai.ts와 연동하는 메모리 레이어
 */

import { ObsidianClient } from './client';
import type { ConversationEntry, ConversationMessage } from './types';

// 싱글턴 인스턴스
let clientInstance: ObsidianClient | null = null;

function getClient(): ObsidianClient {
  if (!clientInstance) {
    clientInstance = new ObsidianClient();
  }
  return clientInstance;
}

// 세션별 진행 중인 대화 추적
const activeSessions = new Map<
  string,
  {
    memberId: string;
    filePath: string | null;
    messages: ConversationMessage[];
    topic: string;
  }
>();

/**
 * 대화 시작 전 회원 컨텍스트 로드
 * → processChatMessage() 호출 전에 실행
 */
export async function loadMemberContext(userId: string): Promise<string> {
  const client = getClient();
  const ctx = await client.getMemberContext(userId);

  if (!ctx.profile) {
    return '(신규 사용자 - 이전 대화 없음)';
  }

  let contextStr = `## 사용자 컨텍스트: ${ctx.profile.name}\n`;
  contextStr += `- 역할: ${ctx.profile.role}\n`;
  contextStr += `- 프로젝트: ${ctx.profile.projects.join(', ') || '없음'}\n\n`;

  if (ctx.recentConversations.length > 0) {
    contextStr += `### 최근 대화\n`;
    for (const c of ctx.recentConversations) {
      contextStr += `- ${c}\n`;
    }
    contextStr += '\n';
  }

  if (ctx.keyKnowledge.length > 0) {
    contextStr += `### 핵심 지식\n`;
    for (const k of ctx.keyKnowledge) {
      contextStr += `- ${k}\n`;
    }
  }

  return contextStr;
}

/**
 * 대화 메시지 저장
 * → processChatMessage() 응답 후 호출 (fire-and-forget)
 */
export async function saveConversationTurn(params: {
  sessionId: string;
  memberId: string;
  userMessage: string;
  assistantResponse: string;
  intent?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const {
    sessionId,
    memberId,
    userMessage,
    assistantResponse,
    intent,
    metadata,
  } = params;
  const client = getClient();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  if (!activeSessions.has(sessionId)) {
    // 세션 첫 메시지 → 새 대화 파일 생성
    const topic = userMessage.slice(0, 30).replace(/\s+/g, ' ').trim();

    const entry: ConversationEntry = {
      memberId,
      sessionId,
      date: dateStr,
      topic,
      tags: [],
      messages: [
        {
          role: 'user',
          content: userMessage,
          timestamp: now.toISOString(),
          intent,
        },
        {
          role: 'assistant',
          content: assistantResponse,
          timestamp: now.toISOString(),
          metadata,
        },
      ],
      knowledgeExtracted: false,
      relatedKnowledge: [],
    };

    const filePath = await client.writeConversation(entry);
    activeSessions.set(sessionId, {
      memberId,
      filePath,
      messages: entry.messages,
      topic,
    });
  } else {
    // 기존 세션에 메시지 추가
    const session = activeSessions.get(sessionId)!;
    const userMsg: ConversationMessage = {
      role: 'user',
      content: userMessage,
      timestamp: now.toISOString(),
      intent,
    };
    const assistantMsg: ConversationMessage = {
      role: 'assistant',
      content: assistantResponse,
      timestamp: now.toISOString(),
      metadata,
    };

    if (session.filePath) {
      await client.appendToConversation(session.filePath, userMsg);
      await client.appendToConversation(session.filePath, assistantMsg);
    }
    session.messages.push(userMsg, assistantMsg);
  }
}

/**
 * 세션 종료 시 정리
 */
export function endSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}

/**
 * 클라이언트 인스턴스 직접 접근 (관리자 API용)
 */
export function getObsidianClient(): ObsidianClient {
  return getClient();
}
