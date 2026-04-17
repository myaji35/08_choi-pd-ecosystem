/**
 * Twitter Card 이미지 — opengraph-image 와 동일 렌더를 재사용.
 * tenants/distributors fallback 로직이 한 곳에서만 관리되도록 통합.
 */

export { default } from './opengraph-image';
export { runtime, alt, contentType } from './opengraph-image';
export const size = { width: 1200, height: 600 };
