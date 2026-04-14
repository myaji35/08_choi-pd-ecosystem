// Pomelli Channel Activation Score Engine
// 순수 함수 기반 — 외부 의존성 없음

export interface ChannelInput {
  platform: string; // 'instagram'|'youtube'|'facebook'|'twitter'|'linkedin'|'tiktok'|'naver_blog'|'naver_cafe'
  isActive: boolean;
  lastPostAt?: Date | null;   // snsPostHistory 마지막 성공 기록
  postCount30d?: number;      // 최근 30일 포스트 수 (optional)
  followerCount?: number;     // 선택
}

export interface ChannelScore {
  platform: string;
  score: number;              // 0~100
  grade: 'active' | 'warming' | 'dormant' | 'unconnected';
  nextAction: string;         // CTA 텍스트
  label: string;              // 플랫폼 한글 라벨
  color: string;              // 플랫폼 색상
}

// 플랫폼 메타 정보
const PLATFORM_META: Record<string, { label: string; color: string }> = {
  instagram:  { label: 'Instagram',     color: '#E4405F' },
  youtube:    { label: 'YouTube',       color: '#FF0000' },
  facebook:   { label: 'Facebook',      color: '#1877F2' },
  twitter:    { label: 'X (Twitter)',   color: '#000000' },
  linkedin:   { label: 'LinkedIn',      color: '#0A66C2' },
  tiktok:     { label: 'TikTok',        color: '#000000' },
  naver_blog: { label: '네이버 블로그',  color: '#03C75A' },
  naver_cafe: { label: '네이버 카페',   color: '#03C75A' },
};

const DEFAULT_META = { label: '알 수 없음', color: '#9CA3AF' };

/** 두 날짜 사이의 일수 차이 계산 */
function daysSince(date: Date): number {
  const now = Date.now();
  return Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 단일 채널 활성화 점수 계산
 */
export function scoreChannel(input: ChannelInput): ChannelScore {
  const meta = PLATFORM_META[input.platform] ?? DEFAULT_META;

  // 미연결 (isActive === false)
  if (!input.isActive) {
    return {
      platform: input.platform,
      score: 0,
      grade: 'unconnected',
      nextAction: '계정 연결',
      label: meta.label,
      color: meta.color,
    };
  }

  // 연결됐으나 lastPostAt 없음
  if (!input.lastPostAt) {
    return {
      platform: input.platform,
      score: 20,
      grade: 'dormant',
      nextAction: '콘텐츠 게시 필요',
      label: meta.label,
      color: meta.color,
    };
  }

  const days = daysSince(input.lastPostAt);

  // 90일 초과 → dormant
  if (days > 90) {
    return {
      platform: input.platform,
      score: 20,
      grade: 'dormant',
      nextAction: '콘텐츠 게시 필요',
      label: meta.label,
      color: meta.color,
    };
  }

  // 30~90일 → warming
  if (days > 30) {
    return {
      platform: input.platform,
      score: 50,
      grade: 'warming',
      nextAction: '주간 게시 권장',
      label: meta.label,
      color: meta.color,
    };
  }

  // 30일 이내
  const postCount = input.postCount30d ?? 0;

  // 30일 이내 + 8개 이상 → 만점
  if (postCount >= 8) {
    return {
      platform: input.platform,
      score: 100,
      grade: 'active',
      nextAction: '최상의 퍼포먼스!',
      label: meta.label,
      color: meta.color,
    };
  }

  // 30일 이내 + 4개 이상 → active
  if (postCount >= 4) {
    return {
      platform: input.platform,
      score: 85,
      grade: 'active',
      nextAction: '좋아요! 현재 패턴 유지',
      label: meta.label,
      color: meta.color,
    };
  }

  // 30일 이내 + 4개 미만 → 중간값 보간 (50~84)
  // postCount 0 → 55, 1 → 63, 2 → 71, 3 → 79
  const interpolated = Math.round(55 + postCount * 8);

  return {
    platform: input.platform,
    score: interpolated,
    grade: 'warming',
    nextAction: '주간 게시 권장',
    label: meta.label,
    color: meta.color,
  };
}

/**
 * 여러 채널 점수 계산 (점수 내림차순 정렬)
 */
export function scoreAllChannels(inputs: ChannelInput[]): ChannelScore[] {
  return inputs
    .map(scoreChannel)
    .sort((a, b) => b.score - a.score);
}
