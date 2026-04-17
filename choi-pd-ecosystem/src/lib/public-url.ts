/**
 * 공개 페이지 URL/호스트 유틸
 * -----------------------------
 * 브랜드 도메인(impd.me)은 최종 프로덕션용.
 * 개발/스테이징/테스트 도메인(nip.io, localhost, vercel 등)에서는
 * 현재 접속 중인 호스트를 그대로 사용해서 링크가 깨지지 않도록 한다.
 *
 * 우선순위:
 *   1) process.env.NEXT_PUBLIC_PUBLIC_HOST (명시 설정, 드물지만 가능)
 *   2) window.location.host (SSR 초기엔 빈 값 → 3으로 fallback)
 *   3) "impd.me" (진짜 프로덕션 기본값)
 *
 * 호스트가 "impd.me" 브랜드 도메인인지 아닌지에 따라 표시 방식도 달라진다:
 *   - impd.me        → "impd.me/<slug>"     (깔끔한 브랜드 URL)
 *   - 기타 호스트     → "<host>/member/<slug>" (실제 접근 가능한 경로 그대로)
 *
 * 모든 함수는 SSR-safe. window 없을 때는 env 혹은 기본값 반환.
 */

const BRAND_HOST = 'impd.me';
const MEMBER_PATH_PREFIX = '/member';

function getRawHost(): string {
  if (typeof window !== 'undefined' && window.location?.host) {
    return window.location.host;
  }
  const envHost = process.env.NEXT_PUBLIC_PUBLIC_HOST?.trim();
  if (envHost) {
    return envHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
  return BRAND_HOST;
}

function isBrandHost(host: string): boolean {
  const clean = host.replace(/:\d+$/, '').toLowerCase();
  return clean === BRAND_HOST || clean.endsWith(`.${BRAND_HOST}`);
}

/** 사용자에게 보여줄 표시용 URL (프로토콜 없음) */
export function memberDisplayUrl(slug: string): string {
  const host = getRawHost();
  if (isBrandHost(host)) {
    return `${host.replace(/:\d+$/, '')}/${slug}`;
  }
  return `${host}${MEMBER_PATH_PREFIX}/${slug}`;
}

/** 호스트만 (라벨용) */
export function memberDisplayHost(): string {
  const host = getRawHost();
  return isBrandHost(host) ? host.replace(/:\d+$/, '') : host;
}

/** 표시용 상대 경로 (host 뒤) — "/byjreporter" 또는 "/member/byjreporter" */
export function memberDisplayPath(slug: string): string {
  return isBrandHost(getRawHost()) ? `/${slug}` : `${MEMBER_PATH_PREFIX}/${slug}`;
}

/** 새 탭으로 열 때 쓰는 href (현 앱 라우트 기준) */
export function memberHref(slug: string): string {
  // 앱 내 라우트는 항상 /member/<slug> 로 존재.
  // 브랜드 도메인이면 rewrites가 /<slug> → /member/<slug> 처리 가능(있을 경우).
  return `${MEMBER_PATH_PREFIX}/${slug}`;
}

/** 클립보드/공유용 절대 URL */
export function memberAbsoluteUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${memberHref(slug)}`;
  }
  const host = getRawHost();
  const proto = host.startsWith('localhost') || host.match(/^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/)
    ? 'http'
    : 'https';
  return `${proto}://${host}${memberHref(slug)}`;
}
