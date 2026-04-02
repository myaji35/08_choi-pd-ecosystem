// 회원: 멤버, 포트폴리오, 서비스, 포스트, 문의, 후기, 예약

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// ============================================================
// 회원 개인비즈니스 페이지 시스템
// ============================================================

// Members Table (회원 - 개인비즈니스 페이지 운영자)
export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  towningraphUserId: text('towningraph_user_id').unique(), // 외부 연동 키
  slug: text('slug').unique().notNull(), // 서브도메인 slug
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  profileImage: text('profile_image'),
  coverImage: text('cover_image'),
  bio: text('bio'), // 소개글
  socialLinks: text('social_links'), // JSON: {instagram, youtube, ...}
  businessType: text('business_type'), // individual | company | organization
  profession: text('profession'), // insurance_agent | realtor | educator | author | shopowner | freelancer | custom
  region: text('region'),
  status: text('status').default('pending_approval'), // pending_approval|approved|rejected|suspended
  subscriptionPlan: text('subscription_plan').default('basic'), // basic|premium|enterprise
  enabledModules: text('enabled_modules').default('[]'), // JSON: ["portfolio","services",...]
  themeConfig: text('theme_config').default('{}'), // JSON: {primaryColor, layout, ...}
  rejectionReason: text('rejection_reason'), // 거부 사유
  isFeatured: integer('is_featured').default(0), // 쇼케이스 노출 여부
  featuredOrder: integer('featured_order').default(0), // 쇼케이스 노출 순서
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_members_tenant').on(table.tenantId),
]);

// Member Portfolio Items Table (포트폴리오)
export const memberPortfolioItems = sqliteTable('member_portfolio_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  mediaUrl: text('media_url').notNull(),
  mediaType: text('media_type'), // image | video
  category: text('category'),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_member_portfolio_items_tenant').on(table.tenantId),
]);

// Member Services Table (서비스/상품)
export const memberServices = sqliteTable('member_services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  price: text('price'),
  priceLabel: text('price_label'), // "50,000원~"
  ctaUrl: text('cta_url'),
  ctaLabel: text('cta_label'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_member_services_tenant').on(table.tenantId),
]);

// Member Posts Table (블로그/소식)
export const memberPosts = sqliteTable('member_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  thumbnailUrl: text('thumbnail_url'),
  isPublished: integer('is_published').default(0),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_member_posts_tenant').on(table.tenantId),
]);

// Member Inquiries Table (문의)
export const memberInquiries = sqliteTable('member_inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_member_inquiries_tenant').on(table.tenantId),
]);

// Member Reviews Table (후기)
export const memberReviews = sqliteTable('member_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  reviewerName: text('reviewer_name').notNull(),
  rating: integer('rating').notNull(), // 1-5
  content: text('content'),
  isApproved: integer('is_approved').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_member_reviews_tenant').on(table.tenantId),
]);

// Member Bookings Table (예약 설정)
export const memberBookings = sqliteTable('member_bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  bookingType: text('booking_type'), // external_link | calendar
  externalUrl: text('external_url'),
  description: text('description')
}, (table) => [
  index('idx_member_bookings_tenant').on(table.tenantId),
]);

// Export types for Member tables
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type MemberPortfolioItem = typeof memberPortfolioItems.$inferSelect;
export type NewMemberPortfolioItem = typeof memberPortfolioItems.$inferInsert;

export type MemberService = typeof memberServices.$inferSelect;
export type NewMemberService = typeof memberServices.$inferInsert;

export type MemberPost = typeof memberPosts.$inferSelect;
export type NewMemberPost = typeof memberPosts.$inferInsert;

export type MemberInquiry = typeof memberInquiries.$inferSelect;
export type NewMemberInquiry = typeof memberInquiries.$inferInsert;

export type MemberReview = typeof memberReviews.$inferSelect;
export type NewMemberReview = typeof memberReviews.$inferInsert;

export type MemberBooking = typeof memberBookings.$inferSelect;
export type NewMemberBooking = typeof memberBookings.$inferInsert;
