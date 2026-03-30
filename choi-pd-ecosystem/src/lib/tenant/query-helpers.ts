/**
 * 테넌트 쿼리 헬퍼 — 모든 DB 쿼리에 tenantId 필터를 간편하게 적용
 *
 * 사용 예시:
 *   const tenantId = getTenantIdFromRequest(request);
 *   const results = await withTenantFilter(db.select().from(courses), courses.tenantId, tenantId);
 */

import { eq, and, SQL } from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';
import { DEFAULT_TENANT_ID } from './context';

/**
 * 쿼리에 tenantId WHERE 조건 추가
 *
 * @param tenantIdColumn - 테이블의 tenantId 컬럼 (예: courses.tenantId)
 * @param tenantId - 필터할 테넌트 ID
 * @returns SQL 조건 (eq 표현식)
 *
 * 사용 예시:
 *   const condition = tenantFilter(courses.tenantId, tenantId);
 *   const results = await db.select().from(courses).where(condition);
 */
export function tenantFilter(
  tenantIdColumn: SQLiteColumn,
  tenantId: number = DEFAULT_TENANT_ID,
): SQL {
  return eq(tenantIdColumn, tenantId);
}

/**
 * 기존 WHERE 조건에 tenantId 조건을 AND로 결합
 *
 * @param tenantIdColumn - 테이블의 tenantId 컬럼
 * @param tenantId - 필터할 테넌트 ID
 * @param existingCondition - 기존 WHERE 조건 (optional)
 * @returns 결합된 SQL 조건
 *
 * 사용 예시:
 *   const condition = withTenantCondition(
 *     courses.tenantId,
 *     tenantId,
 *     eq(courses.published, true)
 *   );
 *   const results = await db.select().from(courses).where(condition);
 */
export function withTenantCondition(
  tenantIdColumn: SQLiteColumn,
  tenantId: number = DEFAULT_TENANT_ID,
  existingCondition?: SQL,
): SQL {
  const tenantCond = eq(tenantIdColumn, tenantId);
  if (existingCondition) {
    return and(tenantCond, existingCondition)!;
  }
  return tenantCond;
}

/**
 * INSERT 시 tenantId를 자동으로 주입하는 헬퍼
 *
 * @param values - INSERT할 데이터 객체
 * @param tenantId - 주입할 테넌트 ID
 * @returns tenantId가 포함된 데이터 객체
 *
 * 사용 예시:
 *   const data = withTenantId({ title: '...', description: '...' }, tenantId);
 *   await db.insert(courses).values(data);
 */
export function withTenantId<T extends Record<string, unknown>>(
  values: T,
  tenantId: number = DEFAULT_TENANT_ID,
): T & { tenantId: number } {
  return { ...values, tenantId } as T & { tenantId: number };
}
