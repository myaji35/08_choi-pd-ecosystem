import { NextRequest, NextResponse } from 'next/server';

// ── 채널별 프롬프트 템플릿 ──────────────────────────────────
const CHANNEL_PROMPTS: Record<string, (text: string) => string> = {
  instagram: (text) =>
    `당신은 인스타그램 마케팅 전문가입니다. 다음 텍스트를 기반으로 인스타그램 캡션을 작성하세요.
- 감성적이고 눈길을 끄는 첫 줄
- 이모지 적절히 활용
- 핵심 메시지를 3-4문장으로 전달
- 해시태그 5-8개 제안 (별도 배열로)
- CTA(행동 유도) 포함

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "캡션 텍스트", "hashtags": ["#태그1", "#태그2"] }`,

  blog: (text) =>
    `당신은 블로그 콘텐츠 전문가입니다. 다음 텍스트를 기반으로 블로그 포스트를 작성하세요.
- SEO 친화적인 제목
- 서론-본론-결론 구조
- 소제목 활용
- 800-1200자 분량

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "블로그 본문" }`,

  twitter: (text) =>
    `당신은 X(트위터) 전문가입니다. 다음 텍스트를 기반으로 트윗을 작성하세요.
- 280자 이내
- 임팩트 있는 한 줄
- 해시태그 2-3개

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "트윗 텍스트", "hashtags": ["#태그1"] }`,

  kakao: (text) =>
    `당신은 카카오 채널 메시지 전문가입니다. 다음 텍스트를 기반으로 카카오톡 채널 메시지를 작성하세요.
- 친근한 어투
- 핵심 정보 3줄 이내
- 링크 유도 문구

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "카카오 메시지" }`,

  newsletter: (text) =>
    `당신은 뉴스레터 전문가입니다. 다음 텍스트를 기반으로 이메일 뉴스레터 콘텐츠를 작성하세요.
- 클릭을 유도하는 제목줄
- 개인적인 인사
- 핵심 내용 요약
- CTA 버튼 문구 포함

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "뉴스레터 본문" }`,
};

// ── Mock 응답 (OPENAI_API_KEY 없을 때) ─────────────────────
function generateMockResponse(text: string, channels: string[]) {
  const summary = text.length > 50 ? text.substring(0, 50) + '...' : text;

  const mockMap: Record<string, any> = {
    instagram: {
      channel: 'instagram',
      content: `✨ ${summary}\n\n오늘도 한 걸음 더 성장하는 하루!\n작은 시작이 큰 변화를 만듭니다.\n\n👉 프로필 링크에서 자세한 내용을 확인하세요!`,
      hashtags: ['#창업', '#마케팅', '#스마트폰활용', '#1인기업', '#사이드프로젝트'],
    },
    blog: {
      channel: 'blog',
      content: `# ${summary}\n\n## 들어가며\n\n이 주제에 대해 많은 분들이 관심을 가지고 계십니다. 오늘은 핵심 내용을 정리해보겠습니다.\n\n## 핵심 포인트\n\n${text}\n\n## 실전 적용 방법\n\n1. 먼저 현재 상황을 점검합니다\n2. 목표를 구체적으로 설정합니다\n3. 작은 것부터 실행에 옮깁니다\n\n## 마무리\n\n지금 바로 시작해보세요. 작은 변화가 큰 차이를 만들어냅니다.`,
    },
    twitter: {
      channel: 'twitter',
      content: `💡 ${summary}\n\n지금 바로 시작하세요! 👇`,
      hashtags: ['#창업팁', '#마케팅'],
    },
    kakao: {
      channel: 'kakao',
      content: `안녕하세요! 😊\n\n${summary}\n\n▶ 자세한 내용이 궁금하시다면\n아래 링크를 확인해주세요!`,
    },
    newsletter: {
      channel: 'newsletter',
      content: `[이번 주 핵심 인사이트]\n\n안녕하세요, 구독자님!\n\n${text}\n\n이 내용이 도움이 되셨다면 주변 분들께도 공유해주세요.\n\n감사합니다.\n\n[더 알아보기 →]`,
    },
  };

  return channels
    .filter((ch) => mockMap[ch])
    .map((ch) => mockMap[ch]);
}

// ── OpenAI API 호출 ─────────────────────────────────────────
async function callOpenAI(prompt: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('NO_API_KEY');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '한국어로 응답하세요. 반드시 유효한 JSON만 출력하세요.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || '{}';

  // JSON 파싱 (```json ... ``` 래핑 제거)
  const cleaned = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(cleaned);
}

// ── 월별 사용량 체크 (간단 in-memory, 프로덕션에서는 DB) ────
const usageMap = new Map<string, { count: number; month: string }>();

function checkUsageLimit(tenantId: string, plan: string): { allowed: boolean; remaining: number } {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const key = `${tenantId}:${currentMonth}`;
  const usage = usageMap.get(key) || { count: 0, month: currentMonth };

  if (plan === 'free') {
    const limit = 5;
    return { allowed: usage.count < limit, remaining: Math.max(0, limit - usage.count) };
  }

  // Pro: 무제한
  return { allowed: true, remaining: -1 };
}

function incrementUsage(tenantId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const key = `${tenantId}:${currentMonth}`;
  const usage = usageMap.get(key) || { count: 0, month: currentMonth };
  usage.count += 1;
  usageMap.set(key, usage);
}

// ── POST /api/ai/content ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, channels } = body;

    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    const validChannels = ['instagram', 'blog', 'twitter', 'kakao', 'newsletter'];
    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json(
        { success: false, error: '최소 1개 이상의 채널을 선택해주세요.' },
        { status: 400 }
      );
    }

    const filteredChannels = channels.filter((ch: string) => validChannels.includes(ch));
    if (filteredChannels.length === 0) {
      return NextResponse.json(
        { success: false, error: '유효한 채널을 선택해주세요.' },
        { status: 400 }
      );
    }

    // tenantId (헤더 또는 기본값)
    const tenantId = request.headers.get('x-tenant-slug') || 'default';
    const plan = request.headers.get('x-tenant-plan') || 'free';

    // 사용량 체크
    const { allowed, remaining } = checkUsageLimit(tenantId, plan);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: '이번 달 무료 생성 횟수를 모두 사용했습니다. Pro 플랜으로 업그레이드해주세요.',
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // OpenAI API 키 존재 여부로 mock/real 분기
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    let results: any[];

    if (!hasApiKey) {
      // Mock 모드
      results = generateMockResponse(text, filteredChannels);
    } else {
      // 실제 OpenAI API 호출
      results = [];
      for (const channel of filteredChannels) {
        const promptFn = CHANNEL_PROMPTS[channel];
        if (!promptFn) continue;

        try {
          const parsed = await callOpenAI(promptFn(text));
          results.push({
            channel,
            content: parsed.content || '',
            hashtags: parsed.hashtags || undefined,
          });
        } catch (err: any) {
          // 개별 채널 실패 시 mock fallback
          console.error(`OpenAI error for ${channel}:`, err.message);
          const mockResults = generateMockResponse(text, [channel]);
          if (mockResults.length > 0) results.push(mockResults[0]);
        }
      }
    }

    // 사용량 증가
    incrementUsage(tenantId);

    // 업데이트된 remaining 계산
    const updatedUsage = checkUsageLimit(tenantId, plan);

    return NextResponse.json({
      success: true,
      results,
      meta: {
        mode: hasApiKey ? 'live' : 'mock',
        remaining: updatedUsage.remaining,
        plan,
      },
    });
  } catch (error: any) {
    console.error('AI content generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '콘텐츠 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// ── GET /api/ai/content (사용량 조회) ───────────────────────
export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-slug') || 'default';
  const plan = request.headers.get('x-tenant-plan') || 'free';

  const { remaining } = checkUsageLimit(tenantId, plan);

  return NextResponse.json({
    success: true,
    remaining,
    plan,
    limit: plan === 'free' ? 5 : -1,
  });
}
