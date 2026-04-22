// 통합 연동 관리 허브 — impd가 소유한 프로젝트 생태계(Townin/CertiGraph/InsureGraph 등)를
// 일급 개념으로 등록하고, distributors(회원)와 다대다 연결하여 공개 페이지에 성과를 노출.
// 기존 automation.integrations 테이블(외부 SaaS: Slack/CRM/Storage)과는 별개.

import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';
import { distributors } from './distribution';

// 1. Integration Projects — 프로젝트 마스터
export const integrationProjects = sqliteTable('integration_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id),
  key: text('key').notNull(), // 'townin' | 'certigraph' | 'insuregraph' — URL/adapter 식별자
  name: text('name').notNull(), // 'Townin — 지역 커뮤니티 플랫폼'
  description: text('description'),
  baseUrl: text('base_url').notNull(), // 'https://townin.kr'
  apiBaseUrl: text('api_base_url'), // 'https://api.townin.kr' — 표준 스펙 엔드포인트 호스트
  endpointTemplate: text('endpoint_template'), // '/api/integrations/public/{external_id}'
  authType: text('auth_type', { enum: ['none', 'api_key', 'bearer', 'oauth2'] }).default('none').notNull(),
  authCredential: text('auth_credential'), // encrypted — API key 등
  adapterKey: text('adapter_key'), // 표준 미준수 레거시용 — lib/integrations/adapters/<key>.ts
  brandColor: text('brand_color'), // '#FF6B35' — 공개 페이지 배지/카드 색상
  logoUrl: text('logo_url'),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  uniqueIndex('idx_integration_projects_tenant_key').on(table.tenantId, table.key),
  index('idx_integration_projects_tenant').on(table.tenantId),
]);

// 2. Distributor Integrations — 회원 ↔ 프로젝트 다대다 + 스냅샷 캐시
export const distributorIntegrations = sqliteTable('distributor_integrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id),
  distributorId: integer('distributor_id').notNull().references(() => distributors.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').notNull().references(() => integrationProjects.id, { onDelete: 'cascade' }),
  externalId: text('external_id').notNull(), // 'byjreporter' — 상대 프로젝트의 식별자
  externalUrl: text('external_url'), // 'https://townin.kr/byjreporter' — 프로필 URL
  role: text('role'), // '파트너' | '기자' | '전문가'
  isPublic: integer('is_public', { mode: 'boolean' }).default(false).notNull(), // 공개 페이지 노출 여부
  lastSnapshotJson: text('last_snapshot_json'), // graceful degrade용 캐시
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  syncStatus: text('sync_status', { enum: ['pending', 'ok', 'error'] }).default('pending').notNull(),
  syncError: text('sync_error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  uniqueIndex('idx_distrib_integ_unique').on(table.distributorId, table.projectId),
  index('idx_distrib_integ_tenant').on(table.tenantId),
  index('idx_distrib_integ_project').on(table.projectId),
  index('idx_distrib_integ_distrib').on(table.distributorId),
]);

// 3. Integration Sync Log — 동기화 관측
export const integrationSyncLog = sqliteTable('integration_sync_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id),
  distributorIntegrationId: integer('distributor_integration_id').references(() => distributorIntegrations.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').references(() => integrationProjects.id, { onDelete: 'cascade' }),
  action: text('action', { enum: ['fetch', 'refresh', 'test', 'manual'] }).notNull(),
  status: text('status', { enum: ['ok', 'error', 'timeout'] }).notNull(),
  durationMs: integer('duration_ms'),
  httpStatus: integer('http_status'),
  errorMessage: text('error_message'),
  responseSample: text('response_sample'), // 디버깅용 첫 1KB
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_integration_sync_log_tenant').on(table.tenantId),
  index('idx_integration_sync_log_project').on(table.projectId),
  index('idx_integration_sync_log_created').on(table.createdAt),
]);

export type IntegrationProject = typeof integrationProjects.$inferSelect;
export type NewIntegrationProject = typeof integrationProjects.$inferInsert;
export type DistributorIntegration = typeof distributorIntegrations.$inferSelect;
export type NewDistributorIntegration = typeof distributorIntegrations.$inferInsert;
export type IntegrationSyncLog = typeof integrationSyncLog.$inferSelect;
export type NewIntegrationSyncLog = typeof integrationSyncLog.$inferInsert;
