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

  'naver-blog': (text) =>
    `당신은 네이버 블로그 SEO 전문가입니다. 다음 텍스트를 기반으로 네이버 블로그 포스트를 작성하세요.
- 네이버 검색 최적화를 위한 키워드 강조 (볼드, 키워드 반복)
- SEO 친화적인 제목 (검색 키워드 포함)
- 이미지 배치 가이드 포함 ([이미지: 설명] 형태로 위치 표시)
- 소제목에 핵심 키워드 포함
- 1000-1500자 분량
- 마지막에 관련 태그 5-8개 제안

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "네이버 블로그 본문", "hashtags": ["#태그1", "#태그2"] }`,

  wordpress: (text) =>
    `당신은 워드프레스 블로그 전문가입니다. 다음 텍스트를 기반으로 워드프레스 포스트를 마크다운 형태로 작성하세요.
- 마크다운 헤딩(##, ###) 활용
- 카테고리 제안 (1-2개)
- 태그 제안 (5-8개)
- 서론-본론-결론 구조
- SEO 메타 디스크립션 (160자 이내) 포함
- 800-1200자 분량

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "워드프레스 마크다운 본문", "hashtags": ["태그1", "태그2"], "categories": ["카테고리1"] }`,

  tistory: (text) =>
    `당신은 티스토리 블로그 전문가입니다. 다음 텍스트를 기반으로 티스토리 포스트를 작성하세요.
- HTML 태그 지원 (h2, h3, blockquote, strong 등 활용)
- 상단에 목차(Table of Contents) 포함
- 소제목으로 구조화
- 핵심 내용은 blockquote로 강조
- 1000-1500자 분량
- 관련 태그 5-8개 제안

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "티스토리 HTML 본문", "hashtags": ["태그1", "태그2"] }`,

  brunch: (text) =>
    `당신은 브런치 에세이 작가입니다. 다음 텍스트를 기반으로 브런치 스타일의 에세이를 작성하세요.
- 문학적이고 감성적인 문체
- 개인적인 경험과 성찰을 담은 톤
- 짧은 문장, 여백을 활용한 호흡
- 은유와 비유 활용
- 독자의 공감을 이끄는 서두
- 여운을 남기는 마무리
- 800-1200자 분량

원본 텍스트:
${text}

JSON 형식으로 응답:
{ "content": "브런치 에세이 본문" }`,
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
    'naver-blog': {
      channel: 'naver-blog',
      content: `${summary}\n\n[이미지: 대표 이미지 - 주제를 시각적으로 표현]\n\n안녕하세요! 오늘은 많은 분들이 궁금해하시는 주제에 대해 정리해보겠습니다.\n\n## 핵심 키워드로 알아보는 핵심 내용\n\n${text}\n\n## 실전에서 바로 적용하는 방법\n\n**첫 번째**, 현재 상황을 점검합니다.\n**두 번째**, 구체적인 목표를 설정합니다.\n**세 번째**, 작은 것부터 실행에 옮깁니다.\n\n[이미지: 단계별 프로세스 인포그래픽]\n\n## 마무리\n\n지금 바로 시작해보세요. 작은 변화가 큰 차이를 만들어냅니다.\n\n도움이 되셨다면 이웃추가와 공감 부탁드립니다!`,
      hashtags: ['#창업', '#마케팅', '#스마트폰활용', '#1인기업', '#사이드프로젝트', '#네이버블로그'],
    },
    wordpress: {
      channel: 'wordpress',
      content: `## ${summary}\n\n이 주제에 대해 많은 분들이 관심을 가지고 계십니다.\n\n### 핵심 포인트\n\n${text}\n\n### 실전 적용 방법\n\n1. 먼저 현재 상황을 점검합니다\n2. 목표를 구체적으로 설정합니다\n3. 작은 것부터 실행에 옮깁니다\n\n### 마무리\n\n지금 바로 시작해보세요.\n\n---\n*메타 디스크립션: ${summary} - 실전 적용 방법을 단계별로 알아봅니다.*`,
      hashtags: ['창업', '마케팅', '디지털전환', '1인기업', '사이드프로젝트'],
    },
    tistory: {
      channel: 'tistory',
      content: `<h2>목차</h2>\n<ul>\n<li><a href="#intro">들어가며</a></li>\n<li><a href="#main">핵심 내용</a></li>\n<li><a href="#howto">실전 적용</a></li>\n<li><a href="#conclusion">마무리</a></li>\n</ul>\n\n<h2 id="intro">들어가며</h2>\n<p>${summary}</p>\n\n<h2 id="main">핵심 내용</h2>\n<blockquote>${text}</blockquote>\n\n<h2 id="howto">실전 적용 방법</h2>\n<ol>\n<li><strong>현재 상황 점검</strong></li>\n<li><strong>목표 설정</strong></li>\n<li><strong>실행</strong></li>\n</ol>\n\n<h2 id="conclusion">마무리</h2>\n<p>지금 바로 시작해보세요. 작은 변화가 큰 차이를 만들어냅니다.</p>`,
      hashtags: ['창업', '마케팅', '스마트폰활용', '1인기업', '사이드프로젝트'],
    },
    brunch: {
      channel: 'brunch',
      content: `어느 날 문득, 이런 생각이 들었다.\n\n${summary}\n\n우리는 매일 같은 하루를 살아가는 것 같지만, 사실 매 순간이 새로운 시작이다.\n\n${text}\n\n변화는 거창한 것에서 시작되지 않는다. 오늘 아침, 평소와 다른 길로 출근해보는 것. 늘 마시던 커피 대신 차 한 잔을 선택하는 것. 그런 작은 틈에서 새로운 가능성이 피어난다.\n\n결국 우리에게 필요한 건 완벽한 계획이 아니라, 불완전하더라도 시작하는 용기가 아닐까.\n\n오늘도, 한 걸음.`,
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

    const validChannels = ['instagram', 'blog', 'twitter', 'kakao', 'newsletter', 'naver-blog', 'wordpress', 'tistory', 'brunch'];
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
