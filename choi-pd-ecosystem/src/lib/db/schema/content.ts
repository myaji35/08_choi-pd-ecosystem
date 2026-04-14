// 콘텐츠: 코스, 포스트, 작품, 문의, 리드, 설정, 어드민, 히어로이미지

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// Courses Table (교육 과정)
export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: ['online', 'offline', 'b2b'] }).notNull(),
  price: integer('price'), // nullable (무료 과정 가능)
  thumbnailUrl: text('thumbnail_url'),
  externalLink: text('external_link'), // VOD 플랫폼 링크
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  published: integer('published', { mode: 'boolean' }).default(true)
}, (table) => [
  index('idx_courses_tenant').on(table.tenantId),
]);

// Enrollments Table (수강권/구매 기록) — 외부 결제 webhook이 쓰는 대장
// VOD는 외부 플랫폼(Toss/Stripe)으로 결제되지만, 자체 사이트에서 "내 강의" 접근 제어를 위해 필요
export const enrollments = sqliteTable('enrollments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id),
  userId: text('user_id').notNull(), // session.userId (Clerk or dev)
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['toss', 'stripe', 'manual'] }).notNull(),
  externalOrderId: text('external_order_id'), // provider 측 order/session id (멱등키)
  amount: integer('amount'), // KRW 단위
  status: text('status', { enum: ['pending', 'paid', 'refunded', 'canceled'] }).default('pending').notNull(),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  refundedAt: integer('refunded_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // webhook payload snapshot (JSON)
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index('idx_enrollments_user').on(table.userId),
  index('idx_enrollments_course').on(table.courseId),
  uniqueIndex('uq_enrollments_provider_order').on(table.provider, table.externalOrderId),
]);

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

// Posts Table (공지사항/소식)
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category', { enum: ['notice', 'review', 'media'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  published: integer('published', { mode: 'boolean' }).default(true)
}, (table) => [
  index('idx_posts_tenant').on(table.tenantId),
]);

// Works Table (갤러리 & 언론 보도)
export const works = sqliteTable('works', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  category: text('category', { enum: ['gallery', 'press'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_works_tenant').on(table.tenantId),
]);

// Inquiries Table (문의 사항)
export const inquiries = sqliteTable('inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  type: text('type', { enum: ['b2b', 'contact'] }).notNull(),
  status: text('status', { enum: ['pending', 'contacted', 'closed'] }).default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_inquiries_tenant').on(table.tenantId),
]);

// Leads Table (뉴스레터 구독)
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  email: text('email').notNull(), // unique 제약 → (tenant_id, email) 복합 유니크로 변경
  subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  uniqueIndex('idx_leads_tenant_email').on(table.tenantId, table.email),
]);

// Settings Table (사이트 설정)
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  key: text('key').notNull(), // unique 제약 → (tenant_id, key) 복합 유니크로 변경
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  uniqueIndex('idx_settings_tenant_key').on(table.tenantId, table.key),
]);

// Admin Users Table (관리자 계정)
export const adminUsers = sqliteTable('admin_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // hashed password
  role: text('role', { enum: ['admin', 'superadmin'] }).notNull().default('admin'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Hero Images Table (히어로 섹션 이미지)
export const heroImages = sqliteTable('hero_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text').notNull(),
  fileSize: integer('file_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadStatus: text('upload_status', { enum: ['pending', 'completed', 'failed'] }).default('pending').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false).notNull()
}, (table) => [
  index('idx_hero_images_tenant').on(table.tenantId),
]);

// TypeScript Types
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Work = typeof works.$inferSelect;
export type NewWork = typeof works.$inferInsert;

export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type HeroImage = typeof heroImages.$inferSelect;
export type NewHeroImage = typeof heroImages.$inferInsert;
