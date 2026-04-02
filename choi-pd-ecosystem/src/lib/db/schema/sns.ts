// SNS: 계정, 예약 포스팅, 이력

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

export const snsAccounts = sqliteTable('sns_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  platform: text('platform', { enum: ['facebook', 'instagram', 'twitter', 'linkedin'] }).notNull(),
  accountName: text('account_name').notNull(),
  accountId: text('account_id'), // 플랫폼별 계정 ID
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON 형태로 추가 정보 저장
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_sns_accounts_tenant').on(table.tenantId),
]);

// SNS Scheduled Posts Table (예약된 SNS 포스팅)
export const snsScheduledPosts = sqliteTable('sns_scheduled_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  contentType: text('content_type', { enum: ['posts', 'courses', 'works'] }).notNull(),
  contentId: integer('content_id').notNull(),
  platform: text('platform', { enum: ['facebook', 'instagram', 'twitter', 'linkedin'] }).notNull(),
  accountId: integer('account_id').notNull().references(() => snsAccounts.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  imageUrl: text('image_url'), // 포스팅에 첨부할 이미지
  link: text('link'), // 포스팅에 첨부할 링크
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'publishing', 'published', 'failed', 'cancelled'] }).default('pending'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  externalPostId: text('external_post_id'), // SNS 플랫폼에서 반환된 포스트 ID
  error: text('error'), // 에러 메시지 (실패 시)
  retryCount: integer('retry_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_sns_scheduled_posts_tenant').on(table.tenantId),
]);

// SNS Post History Table (SNS 포스팅 이력)
export const snsPostHistory = sqliteTable('sns_post_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  scheduledPostId: integer('scheduled_post_id').notNull().references(() => snsScheduledPosts.id, { onDelete: 'cascade' }),
  platform: text('platform', { enum: ['facebook', 'instagram', 'twitter', 'linkedin'] }).notNull(),
  externalPostId: text('external_post_id'),
  action: text('action', { enum: ['created', 'updated', 'deleted', 'failed'] }).notNull(),
  status: text('status').notNull(),
  response: text('response'), // API 응답 (JSON 형태)
  error: text('error'),
  metadata: text('metadata'), // 추가 정보 (JSON 형태)
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_sns_post_history_tenant').on(table.tenantId),
]);

// TypeScript Types
export type SnsAccount = typeof snsAccounts.$inferSelect;
export type NewSnsAccount = typeof snsAccounts.$inferInsert;

export type SnsScheduledPost = typeof snsScheduledPosts.$inferSelect;
export type NewSnsScheduledPost = typeof snsScheduledPosts.$inferInsert;

export type SnsPostHistory = typeof snsPostHistory.$inferSelect;
export type NewSnsPostHistory = typeof snsPostHistory.$inferInsert;
