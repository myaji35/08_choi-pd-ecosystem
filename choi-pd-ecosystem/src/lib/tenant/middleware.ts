/**
 * @deprecated 이 파일은 사용되지 않습니다.
 * 실제 미들웨어 로직은 src/middleware.ts에서 직접 구현되어 있습니다.
 * 이 파일의 유틸리티 함수들은 참조용으로만 유지합니다.
 *
 * 테넌트 미들웨어 유틸리티 — 서브도메인에서 tenantId 해석
 *
 * Edge Runtime 호환 (DB 직접 접근 불가 → 헤더 주입만 수행)
 * 실제 테넌트 DB 조회는 API Route 레벨에서 수행
 */

import { NextRequest, NextResponse } from 'next/server';

// SaaS 도메인 설정
const SAAS_DOMAIN = process.env.NEXT_PUBLIC_SAAS_DOMAIN || 'impd.io';
const APP_SUBDOMAIN = 'app';   // 슈퍼어드민용
const DEV_DOMAINS = ['localhost', '127.0.0.1'];

/**
 * hostname에서 테넌트 slug 추출
 *
 * 패턴:
 *   chopd.impd.io       → slug = 'chopd'
 *   kimrealtor.impd.io  → slug = 'kimrealtor'
 *   app.impd.io         → null (슈퍼어드민)
 *   impd.io             → null (랜딩 페이지)
 *   localhost:3011       → null (로컬 개발)
 */
export function extractTenantSlug(hostname: string): string | null {
  // 포트 제거
  const host = hostname.split(':')[0];

  // 로컬 개발 환경 — slug 없음 (기본 테넌트 사용)
  if (DEV_DOMAINS.some(d => host === d)) {
    return null;
  }

  // SaaS 도메인의 서브도메인 추출
  if (host.endsWith(`.${SAAS_DOMAIN}`)) {
    const slug = host.replace(`.${SAAS_DOMAIN}`, '');

    // 슈퍼어드민 서브도메인은 제외
    if (slug === APP_SUBDOMAIN) return null;

    // www 서브도메인은 제외
    if (slug === 'www') return null;

    return slug || null;
  }

  // 메인 도메인 자체 (impd.io) — 랜딩 페이지
  if (host === SAAS_DOMAIN) return null;

  // 커스텀 도메인 — 이 경우 DB 조회 필요 (API 레벨에서 처리)
  // x-custom-domain 헤더로 전달
  return null;
}

/**
 * 슈퍼어드민 서브도메인 여부 확인
 */
export function isSuperAdminDomain(hostname: string): boolean {
  const host = hostname.split(':')[0];
  return host === `${APP_SUBDOMAIN}.${SAAS_DOMAIN}`;
}

/**
 * 커스텀 도메인 여부 확인
 */
export function isCustomDomain(hostname: string): boolean {
  const host = hostname.split(':')[0];

  // 알려진 도메인이 아닌 경우 커스텀 도메인으로 판단
  if (DEV_DOMAINS.some(d => host === d)) return false;
  if (host === SAAS_DOMAIN) return false;
  if (host.endsWith(`.${SAAS_DOMAIN}`)) return false;

  return true;
}

/**
 * 요청에 테넌트 컨텍스트 헤더 주입
 * 미들웨어에서 호출하여 하위 API/페이지에 전달
 */
export function injectTenantHeaders(
  request: NextRequest,
  response: NextResponse,
  slug: string | null,
): NextResponse {
  if (slug) {
    // 테넌트 slug을 헤더로 전달 (API에서 DB 조회하여 tenantId 확인)
    response.headers.set('x-tenant-slug', slug);
  }

  const hostname = request.headers.get('host') || '';
  if (isCustomDomain(hostname)) {
    response.headers.set('x-custom-domain', hostname.split(':')[0]);
  }

  return response;
}
