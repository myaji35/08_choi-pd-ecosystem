// 분석: 이벤트, 코호트, AB테스트, 리포트, 퍼널, RFM

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// ============================================
// Epic 17: 고급 분석 및 BI 대시보드
// ============================================

// Analytics Events (분석 이벤트 추적)
export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id'), // null = 익명 사용자
  userType: text('user_type', { enum: ['admin', 'pd', 'distributor', 'lead', 'anonymous'] }),
  sessionId: text('session_id'), // 세션 ID
  eventName: text('event_name').notNull(), // 이벤트 이름 (page_view, button_click, etc.)
  eventCategory: text('event_category').notNull(), // 카테고리 (engagement, conversion, etc.)
  eventAction: text('event_action'), // 액션 (click, submit, download, etc.)
  eventLabel: text('event_label'), // 레이블 (버튼명, 페이지명 등)
  eventValue: integer('event_value'), // 수치 값 (매출액, 시간 등)
  pagePath: text('page_path'), // 페이지 경로
  pageTitle: text('page_title'), // 페이지 제목
  referrer: text('referrer'), // 리퍼러
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceType: text('device_type', { enum: ['desktop', 'mobile', 'tablet'] }),
  browser: text('browser'),
  os: text('os'),
  country: text('country'), // GeoIP
  city: text('city'), // GeoIP
  metadata: text('metadata'), // JSON: 추가 데이터
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_analytics_events_tenant').on(table.tenantId),
]);

// Cohort Analysis (코호트 분석)
export const cohorts = sqliteTable('cohorts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(), // 코호트 이름
  description: text('description'),
  cohortType: text('cohort_type', { enum: ['acquisition', 'behavior', 'demographic', 'custom'] }).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  criteria: text('criteria').notNull(), // JSON: 코호트 조건
  userCount: integer('user_count').default(0).notNull(),
  metrics: text('metrics'), // JSON: 코호트 메트릭 (retention, revenue, etc.)
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_cohorts_tenant').on(table.tenantId),
]);

// Cohort Users (코호트 사용자 매핑)
export const cohortUsers = sqliteTable('cohort_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userEmail: text('user_email'),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  metadata: text('metadata') // JSON
}, (table) => [
  index('idx_cohort_users_tenant').on(table.tenantId),
]);

// A/B Tests (A/B 테스트)
export const abTests = sqliteTable('ab_tests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  description: text('description'),
  hypothesis: text('hypothesis'), // 가설
  status: text('status', { enum: ['draft', 'running', 'paused', 'completed', 'archived'] }).default('draft').notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  targetMetric: text('target_metric').notNull(), // 목표 지표 (conversion_rate, revenue, etc.)
  variants: text('variants').notNull(), // JSON: 변형 목록 (control, variant_a, variant_b)
  trafficAllocation: text('traffic_allocation').notNull(), // JSON: 트래픽 분배 (50/50, 33/33/34, etc.)
  totalParticipants: integer('total_participants').default(0),
  confidenceLevel: integer('confidence_level').default(95), // 신뢰 수준 (%)
  results: text('results'), // JSON: 테스트 결과
  winner: text('winner'), // 승자 변형
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_ab_tests_tenant').on(table.tenantId),
]);

// A/B Test Participants (A/B 테스트 참가자)
export const abTestParticipants = sqliteTable('ab_test_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  testId: integer('test_id').notNull().references(() => abTests.id, { onDelete: 'cascade' }),
  userId: text('user_id'), // null = 익명
  sessionId: text('session_id').notNull(),
  variant: text('variant').notNull(), // control, variant_a, variant_b, etc.
  converted: integer('converted', { mode: 'boolean' }).default(false), // 전환 여부
  conversionValue: integer('conversion_value'), // 전환 가치 (매출액 등)
  assignedAt: integer('assigned_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  convertedAt: integer('converted_at', { mode: 'timestamp' }),
  metadata: text('metadata') // JSON
}, (table) => [
  index('idx_ab_test_participants_tenant').on(table.tenantId),
]);

// Custom Reports (커스텀 리포트)
export const customReports = sqliteTable('custom_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  description: text('description'),
  reportType: text('report_type', { enum: ['table', 'chart', 'dashboard', 'export'] }).notNull(),
  dataSource: text('data_source').notNull(), // 데이터 소스 (distributors, payments, events, etc.)
  columns: text('columns').notNull(), // JSON: 컬럼 목록
  filters: text('filters'), // JSON: 필터 조건
  groupBy: text('group_by'), // JSON: 그룹화 컬럼
  orderBy: text('order_by'), // JSON: 정렬 조건
  chartType: text('chart_type', { enum: ['line', 'bar', 'pie', 'area', 'scatter', 'heatmap'] }), // 차트 타입
  chartConfig: text('chart_config'), // JSON: 차트 설정
  schedule: text('schedule'), // JSON: 자동 생성 스케줄 (daily, weekly, monthly)
  recipients: text('recipients'), // JSON: 리포트 수신자 이메일
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_custom_reports_tenant').on(table.tenantId),
]);

// Funnel Analysis (퍼널 분석)
export const funnels = sqliteTable('funnels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  description: text('description'),
  steps: text('steps').notNull(), // JSON: 퍼널 단계 (page_view → signup → payment)
  conversionWindow: integer('conversion_window').default(7), // 전환 윈도우 (일)
  totalUsers: integer('total_users').default(0),
  conversionData: text('conversion_data'), // JSON: 각 단계별 전환율
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_funnels_tenant').on(table.tenantId),
]);

// RFM Analysis (Recency, Frequency, Monetary 분석)
export const rfmSegments = sqliteTable('rfm_segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id').notNull(),
  userType: text('user_type', { enum: ['distributor', 'lead'] }).notNull(),
  recencyScore: integer('recency_score').notNull(), // 1-5 (최근 활동)
  frequencyScore: integer('frequency_score').notNull(), // 1-5 (활동 빈도)
  monetaryScore: integer('monetary_score').notNull(), // 1-5 (매출 기여)
  rfmSegment: text('rfm_segment').notNull(), // Champions, Loyal, At Risk, etc.
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }),
  totalTransactions: integer('total_transactions').default(0),
  totalRevenue: integer('total_revenue').default(0),
  calculatedAt: integer('calculated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_rfm_segments_tenant').on(table.tenantId),
]);

// Epic 17: Analytics Types
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type Cohort = typeof cohorts.$inferSelect;
export type NewCohort = typeof cohorts.$inferInsert;

export type CohortUser = typeof cohortUsers.$inferSelect;
export type NewCohortUser = typeof cohortUsers.$inferInsert;

export type AbTest = typeof abTests.$inferSelect;
export type NewAbTest = typeof abTests.$inferInsert;

export type AbTestParticipant = typeof abTestParticipants.$inferSelect;
export type NewAbTestParticipant = typeof abTestParticipants.$inferInsert;

export type CustomReport = typeof customReports.$inferSelect;
export type NewCustomReport = typeof customReports.$inferInsert;

export type Funnel = typeof funnels.$inferSelect;
export type NewFunnel = typeof funnels.$inferInsert;

export type RfmSegment = typeof rfmSegments.$inferSelect;
export type NewRfmSegment = typeof rfmSegments.$inferInsert;
