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
