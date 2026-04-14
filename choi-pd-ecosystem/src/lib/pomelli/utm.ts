export interface UtmConfig {
  source: string;   // 'kakao' | 'facebook' | 'twitter' | 'link' | 'qr' | 'sms' | 'native_share'
  medium?: string;  // 'social' | 'direct' | 'qr'
  campaign?: string;// 'profile_share'
  content?: string; // 'share_panel'
}

/** 주어진 URL에 UTM 파라미터를 추가한다. 기존 쿼리스트링을 보존한다. */
export function appendUtm(url: string, utm: UtmConfig): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', utm.source);
    if (utm.medium) u.searchParams.set('utm_medium', utm.medium);
    if (utm.campaign) u.searchParams.set('utm_campaign', utm.campaign);
    if (utm.content) u.searchParams.set('utm_content', utm.content);
    return u.toString();
  } catch {
    // URL 파싱 실패 시 원본 반환 (SSR 환경 등)
    const sep = url.includes('?') ? '&' : '?';
    const params = new URLSearchParams();
    params.set('utm_source', utm.source);
    if (utm.medium) params.set('utm_medium', utm.medium);
    if (utm.campaign) params.set('utm_campaign', utm.campaign);
    if (utm.content) params.set('utm_content', utm.content);
    return `${url}${sep}${params.toString()}`;
  }
}

/** 플랫폼 이름으로부터 표준 UTM 설정을 생성한다. */
export function profileShareUtm(platform: string): UtmConfig {
  const platformLower = platform.toLowerCase();

  const mediumMap: Record<string, string> = {
    kakao: 'social',
    facebook: 'social',
    twitter: 'social',
    instagram: 'social',
    sms: 'direct',
    qr: 'qr',
    link: 'direct',
    native_share: 'direct',
    copy: 'direct',
  };

  return {
    source: platformLower,
    medium: mediumMap[platformLower] ?? 'direct',
    campaign: 'profile_share',
    content: 'share_panel',
  };
}
