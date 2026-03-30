/**
 * 테넌트 모듈 — 통합 export
 *
 * 서버(API Route) + 클라이언트(React) 양쪽 모두 지원.
 * - 서버: context, query-helpers, middleware
 * - 클라이언트: TenantProvider, useTenant
 */

// ---- 서버 사이드 유틸리티 ----
export {
  DEFAULT_TENANT_ID,
  PLAN_LIMITS,
  getTenantIdFromRequest,
  getTenantSlugFromRequest,
  getTenantBySlug,
  getTenantById,
  getTenantMembership,
  getPlanLimits,
} from './context';

export type { PlanType } from './context';

export {
  tenantFilter,
  withTenantCondition,
  withTenantId,
} from './query-helpers';

export {
  extractTenantSlug,
  isSuperAdminDomain,
  isCustomDomain,
  injectTenantHeaders,
} from './middleware';

// ---- 클라이언트 사이드 (React) ----
export { TenantProvider, TenantContext } from './TenantProvider';
export { useTenant } from './useTenant';
export type {
  Tenant,
  TenantBranding,
  TenantContextValue,
  PlanLimits,
  Profession,
  TenantStatus,
} from './types';
