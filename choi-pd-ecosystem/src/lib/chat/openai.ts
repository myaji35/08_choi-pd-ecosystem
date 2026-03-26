import OpenAI from 'openai';
import { MemberMemory } from '@/lib/db/schema';

const SYSTEM_PROMPT = `당신은 "최PD 에코시스템"의 활동 기록 도우미입니다.
회원이 자신의 활동(교육, 미팅, 이벤트 등)을 편하게 말하면, 대화하면서 핵심 정보를 정리해 기억합니다.

## 역할
- 친근하고 자연스러운 한국어로 대화합니다.
- 회원이 활동을 설명하면, 날짜/장소/카테고리/요약을 추출합니다.
- 일상 대화(인사, 잡담)에는 기억을 저장하지 않습니다.

## 카테고리
- education: 교육, 강의, 세미나, 워크숍
- media: 미디어, 방송, 촬영, 인터뷰
- meeting: 미팅, 회의, 상담
- event: 행사, 전시, 축제
- other: 위에 해당하지 않는 활동

## 날짜 처리
- "오늘" → 오늘 날짜(YYYY-MM-DD)
- "어제" → 어제 날짜
- "지난주 월요일" 등 상대적 표현 → 계산하여 YYYY-MM-DD
- 날짜 언급이 없으면 null

## 응답 형식 (JSON)
반드시 다음 JSON 형식으로 응답하세요:
{
  "reply": "회원에게 보여줄 대화 메시지",
  "memory": {
    "date": "YYYY-MM-DD 또는 null",
    "location": "장소명 또는 null",
    "category": "education|media|meeting|event|other",
    "summary": "활동 요약 (1~2문장)"
  }
}

활동 정보가 없는 일상 대화라면:
{
  "reply": "대화 메시지",
  "memory": null
}`;

export interface AIChatResponse {
  reply: string;
  memory: {
    date: string | null;
    location: string | null;
    category: 'education' | 'media' | 'meeting' | 'event' | 'other';
    summary: string;
  } | null;
}

function buildMemoryContext(memories: MemberMemory[]): string {
  if (memories.length === 0) return '';

  const memoryLines = memories.map((m) => {
    const parts = [];
    if (m.date) parts.push(m.date);
    if (m.category) parts.push(`[${m.category}]`);
    if (m.location) parts.push(`@${m.location}`);
    parts.push(m.summary);
    return `- ${parts.join(' ')}`;
  });

  return `\n\n## 이 회원의 최근 활동 기록\n${memoryLines.join('\n')}`;
}

export async function chatWithAI(
  userMessage: string,
  recentMemories: MemberMemory[],
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  imageUrls?: string[]
): Promise<AIChatResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const today = new Date().toISOString().split('T')[0];
  const systemContent = `${SYSTEM_PROMPT}${buildMemoryContext(recentMemories)}\n\n오늘 날짜: ${today}`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  // Build user message with optional images
  if (imageUrls && imageUrls.length > 0) {
    const content: OpenAI.ChatCompletionContentPart[] = [
      { type: 'text', text: userMessage },
      ...imageUrls.map((url) => ({
        type: 'image_url' as const,
        image_url: { url },
      })),
    ];
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: userMessage });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(raw) as AIChatResponse;
    return {
      reply: parsed.reply || '죄송합니다, 응답을 처리하지 못했습니다.',
      memory: parsed.memory || null,
    };
  } catch {
    return {
      reply: raw,
      memory: null,
    };
  }
}
