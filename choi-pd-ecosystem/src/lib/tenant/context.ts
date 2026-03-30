/**
 * 테넌트 컨텍스트 — 현재 요청의 tenantId 추출 유틸리티
 *
 * 미들웨어에서 주입한 x-tenant-id / x-tenant-slug 헤더를 기반으로
 * 현재 요청이 속한 테넌트를 식별한다.
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants, tenantMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// 기본 테넌트 ID (기존 chopd 데이터 호환)
export const DEFAULT_TENANT_ID = 1;

// 플랜별 제한 정의
export const PLAN_LIMITS = {
  free: {
    maxSnsAccounts: 2,
    maxStorage: 524288000,       // 500MB
    maxTeamMembers: 0,
    maxCourses: 10,
    maxDistributors: 5,
    customDomain: false,
  },
  pro: {
    maxSnsAccounts: 10,
    maxStorage: 5368709120,      // 5GB
    maxTeamMembers: 3,
    maxCourses: 100,
    maxDistributors: 50,
    customDomain: true,
  },
  enterprise: {
    maxSnsAccounts: 999999,
    maxStorage: 53687091200,     // 50GB
    maxTeamMembers: 999999,
    maxCourses: 999999,
    maxDistributors: 999999,
    customDomain: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * 요청에서 tenantId 추출
 * 우선순위: x-tenant-id 헤더 > 기본값(1)
 */
export function getTenantIdFromRequest(request: NextRequest): number {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) {
    const parsed = parseInt(headerTenantId, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_TENANT_ID;
}

/**
 * 요청에서 tenantSlug 추출
 */
export function getTenantSlugFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-tenant-slug');
}

/**
 * slug로 테넌트 조회 (캐시 대상)
 */
export async function getTenantBySlug(slug: string) {
  const tenant = await db
    .select()
    .from(tenants)
    .where(and(
      eq(tenants.slug, slug),
      eq(tenants.status, 'active')
    ))
    .get();
  return tenant ?? null;
}

/**
 * id로 테넌트 조회
 */
export async function getTenantById(id: number) {
  const tenant = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .get();
  return tenant ?? null;
}

/**
 * 사용자의 테넌트 멤버십 조회
 */
export async function getTenantMembership(tenantId: number, clerkUserId: string) {
  const membership = await db
    .select()
    .from(tenantMembers)
    .where(and(
      eq(tenantMembers.tenantId, tenantId),
      eq(tenantMembers.clerkUserId, clerkUserId),
      eq(tenantMembers.status, 'active')
    ))
    .get();
  return membership ?? null;
}

/**
 * 플랜 제한 조회
 */
export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanType] ?? PLAN_LIMITS.free;
}
