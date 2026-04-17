/**
 * 공개 페이지 URL/호스트 유틸
 * -----------------------------
 * middleware.ts 에서 vanity URL /<slug> → /p/<slug> 로 rewrite 하므로
 * 모든 호스트에서 "슬러그만 루트에" 붙이는 방식으로 통일한다.
 *   - impd.me               → impd.me/byjreporter
 *   - localhost:3008        → localhost:3008/byjreporter
 *   - *.nip.io:3030         → <host>/byjreporter
 * /member 프리픽스는 사용하지 않는다(동일 페이지지만 직접 노출 안 함).
 *
 * 우선순위:
 *   1) process.env.NEXT_PUBLIC_PUBLIC_HOST (명시 override, 드묾)
 *   2) window.location.host (SSR 초기엔 빈 값 → 3으로 fallback)
 *   3) "impd.me" (프로덕션 기본값)
 */

const BRAND_HOST = 'impd.me';
// vanity URL 경로 프리픽스 — "" 이면 루트(/byjreporter). 운영 정책상 루트 고정.
const VANITY_PATH_PREFIX = '';

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

/** 사용자에게 보여줄 표시용 URL (프로토콜 없음) — 모든 호스트에서 /<slug> */
export function memberDisplayUrl(slug: string): string {
  const host = getRawHost();
  const displayHost = isBrandHost(host) ? host.replace(/:\d+$/, '') : host;
  return `${displayHost}${VANITY_PATH_PREFIX}/${slug}`;
}

/** 호스트만 (라벨용) */
export function memberDisplayHost(): string {
  const host = getRawHost();
  return isBrandHost(host) ? host.replace(/:\d+$/, '') : host;
}

/** 표시용 상대 경로 (host 뒤) — 항상 "/<slug>" */
export function memberDisplayPath(slug: string): string {
  return `${VANITY_PATH_PREFIX}/${slug}`;
}

/**
 * 새 탭으로 열 때 쓰는 href.
 * middleware 가 /<slug> → /p/<slug> rewrite 해주므로 루트 경로로 연다.
 */
export function memberHref(slug: string): string {
  return `${VANITY_PATH_PREFIX}/${slug}`;
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
