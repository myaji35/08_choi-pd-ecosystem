/**
 * SocialDoctors social-pulse API 클라이언트
 *
 * choi-pd는 자체 SNS API 키를 관리하는 대신,
 * SocialDoctors의 social-pulse를 SNS 허브로 사용합니다.
 *
 * 채널 등록은 SocialDoctors 어드민에서 clientSlug='choi-pd'로 한 번만 하면 됩니다.
 */

const SOCIAL_PULSE_BASE_URL = process.env.SOCIAL_PULSE_API_URL ?? 'https://socialdoctors.co.kr';
const SOCIAL_PULSE_API_KEY = process.env.SOCIAL_PULSE_API_KEY ?? '';
const CLIENT_SLUG = 'choi-pd';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': SOCIAL_PULSE_API_KEY,
    'X-Caller-App': '0008_choi-pd',
  };
}

export interface PublishOptions {
  platform?: string;       // 'FACEBOOK' | 'INSTAGRAM' | 'X' | 'THREADS' | 'TIKTOK' | 'YOUTUBE'
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  scheduledAt?: string;    // ISO 8601
  mockMode?: boolean;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  externalPostId?: string;
  publishedAt?: string;
  scheduledAt?: string;
  platform?: string;
  channelName?: string;
  mockMode?: boolean;
  error?: string;
}

export interface Channel {
  id: string;
  clientName: string;
  clientSlug: string;
  platform: string;
  channelName: string;
  pageId: string;
  status: string;
  tokenExpiresAt: string | null;
  createdAt: string;
}

/**
 * SNS에 콘텐츠 발행 (즉시 또는 예약)
 */
export async function publishToSocialPulse(options: PublishOptions): Promise<PublishResult> {
  if (!SOCIAL_PULSE_API_KEY) {
    console.warn('[SocialPulse] API 키가 설정되지 않았습니다. mockMode로 동작합니다.');
    return {
      success: true,
      mockMode: true,
      postId: `mock-${Date.now()}`,
      platform: options.platform ?? 'FACEBOOK',
      channelName: 'Mock Channel',
    };
  }

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/social-pulse/publish`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      clientSlug: CLIENT_SLUG,
      platform: options.platform,
      content: options.content,
      imageUrl: options.imageUrl,
      videoUrl: options.videoUrl,
      link: options.link,
      scheduledAt: options.scheduledAt,
      mockMode: options.mockMode,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data.error ?? `HTTP ${res.status}` };
  }

  return data as PublishResult;
}

/**
 * choi-pd 등록된 SNS 채널 목록 조회
 */
export async function getChannels(platform?: string): Promise<Channel[]> {
  if (!SOCIAL_PULSE_API_KEY) {
    return [];
  }

  const params = new URLSearchParams({ clientSlug: CLIENT_SLUG });
  if (platform) params.set('platform', platform);

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/social-pulse/channels?${params}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.channels ?? []) as Channel[];
}

/**
 * AI 카피 생성 (SocialDoctors Gemini 활용)
 */
export async function generateCopy(prompt: string, platform?: string): Promise<string> {
  if (!SOCIAL_PULSE_API_KEY) {
    return `${prompt}에 대한 마케팅 카피를 작성해주세요.`;
  }

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/social-pulse/generate-copy`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ prompt, platform }),
  });

  if (!res.ok) return '';

  const data = await res.json();
  return (data.copy as string) ?? '';
}

// ── 카드뉴스 생성 ──

export interface CardNewsOptions {
  topic: string;
  templateType?: string;     // 'BUSINESS' | 'EDUCATION' | 'MARKETING' | 'GENERAL'
  brandColor?: string;       // HEX 색상 코드 (예: '#00A1E0')
  slideCount?: number;       // 기본 5
  autoPublish?: boolean;     // true이면 생성 후 자동 발행
  publishTo?: string[];      // 발행 대상 플랫폼 ['FACEBOOK', 'INSTAGRAM', ...]
}

export interface CardNewsResult {
  success: boolean;
  cardNewsId?: string;
  slides?: Array<{
    index: number;
    imageUrl: string;
    text: string;
  }>;
  publishedTo?: string[];
  mockMode?: boolean;
  error?: string;
}

/**
 * AI 카드뉴스 자동 생성
 * SocialDoctors의 카드뉴스 생성 API를 호출합니다.
 */
export async function createCardNews(options: CardNewsOptions): Promise<CardNewsResult> {
  if (!SOCIAL_PULSE_API_KEY) {
    console.warn('[SocialPulse] API 키가 설정되지 않았습니다. mockMode로 동작합니다.');
    return {
      success: true,
      mockMode: true,
      cardNewsId: `mock-cardnews-${Date.now()}`,
      slides: Array.from({ length: options.slideCount ?? 5 }, (_, i) => ({
        index: i + 1,
        imageUrl: `https://placeholder.co/1080x1080?text=Slide+${i + 1}`,
        text: `${options.topic} - 슬라이드 ${i + 1}`,
      })),
    };
  }

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/card-news`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      clientSlug: CLIENT_SLUG,
      topic: options.topic,
      templateType: options.templateType,
      brandColor: options.brandColor,
      slideCount: options.slideCount,
      autoPublish: options.autoPublish,
      publishTo: options.publishTo,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data.error ?? `HTTP ${res.status}` };
  }

  return data as CardNewsResult;
}

// ── 발행 상태 조회 ──

export interface PublishStatusItem {
  postId: string;
  platform: string;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'SCHEDULED';
  publishedAt?: string;
  scheduledAt?: string;
  externalUrl?: string;
  error?: string;
}

export interface PublishStatusResponse {
  posts: PublishStatusItem[];
  total: number;
}

/**
 * 발행 상태 조회
 * postId를 지정하면 해당 포스트만, 생략하면 최근 발행 목록을 반환합니다.
 */
export async function getPublishStatus(postId?: string): Promise<PublishStatusResponse> {
  if (!SOCIAL_PULSE_API_KEY) {
    return { posts: [], total: 0 };
  }

  const params = new URLSearchParams({ clientSlug: CLIENT_SLUG });
  if (postId) params.set('postId', postId);

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/social-pulse/publish/status?${params}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) return { posts: [], total: 0 };

  const data = await res.json();
  return data as PublishStatusResponse;
}
