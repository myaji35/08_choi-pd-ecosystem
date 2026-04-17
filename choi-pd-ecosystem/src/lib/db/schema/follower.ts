// 회원 공개 페이지: 팔로워·수상·채널·타임라인·프로필 미디어

import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';
import { members } from './member';

// ── 팔로워 ──────────────────────────────────────────────
export const memberFollowers = sqliteTable(
  'member_followers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }), // 팔로우 대상
    followerUserId: text('follower_user_id'),   // 로그인 사용자 ID (session.userId)
    followerEmail: text('follower_email'),      // 비회원·이메일 구독
    followerName: text('follower_name'),
    subscribeNewsletter: integer('subscribe_newsletter', { mode: 'boolean' }).default(true),
    subscribeLiveAlert: integer('subscribe_live_alert', { mode: 'boolean' }).default(true),
    status: text('status', { enum: ['active', 'unsubscribed', 'blocked'] }).default('active').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    index('idx_member_followers_member').on(table.memberId),
    uniqueIndex('idx_member_followers_unique_user').on(table.memberId, table.followerUserId),
    uniqueIndex('idx_member_followers_unique_email').on(table.memberId, table.followerEmail),
  ]
);

// ── 수상·인증 기록 ──────────────────────────────────────
export const memberAwards = sqliteTable(
  'member_awards',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    organization: text('organization').notNull(),
    awardedYear: integer('awarded_year'),
    category: text('category', { enum: ['award', 'certification', 'public_trust', 'media'] }).default('award').notNull(),
    logoUrl: text('logo_url'),
    detailUrl: text('detail_url'),
    description: text('description'),
    accentColor: text('accent_color'),
    displayOrder: integer('display_order').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [index('idx_member_awards_member').on(table.memberId)]
);

// ── 운영 중인 채널 허브 ─────────────────────────────────
export const memberChannels = sqliteTable(
  'member_channels',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(), // youtube / instagram / naver_cafe / facebook / kakao_channel / blog / tiktok
    displayName: text('display_name').notNull(),
    url: text('url').notNull(),
    handle: text('handle'),
    followerCount: integer('follower_count').default(0),
    activityScore: integer('activity_score').default(0), // 0~100
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    displayOrder: integer('display_order').default(0),
    lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [index('idx_member_channels_member').on(table.memberId)]
);

// ── 최근 활동 타임라인 ──────────────────────────────────
export const memberActivityTimeline = sqliteTable(
  'member_activity_timeline',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
    kind: text('kind', {
      enum: ['post', 'live', 'award', 'campaign', 'video', 'press', 'milestone', 'community'],
    }).notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    thumbnailUrl: text('thumbnail_url'),
    linkUrl: text('link_url'),
    occurredAt: integer('occurred_at', { mode: 'timestamp' }).notNull(),
    isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    index('idx_member_activity_timeline_member').on(table.memberId),
    index('idx_member_activity_timeline_occurred').on(table.occurredAt),
  ]
);

// ── 프로필 미디어 (히어로 콜라주/동영상) ────────────────
export const memberProfileMedia = sqliteTable(
  'member_profile_media',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
    role: text('role', {
      enum: ['hero_cover', 'hero_collage', 'intro_video', 'gallery'],
    }).notNull(),
    mediaUrl: text('media_url').notNull(),
    posterUrl: text('poster_url'),
    mediaType: text('media_type', { enum: ['image', 'video'] }).default('image').notNull(),
    caption: text('caption'),
    displayOrder: integer('display_order').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [index('idx_member_profile_media_member').on(table.memberId)]
);

// Types
export type MemberFollower = typeof memberFollowers.$inferSelect;
export type NewMemberFollower = typeof memberFollowers.$inferInsert;
export type MemberAward = typeof memberAwards.$inferSelect;
export type NewMemberAward = typeof memberAwards.$inferInsert;
export type MemberChannel = typeof memberChannels.$inferSelect;
export type NewMemberChannel = typeof memberChannels.$inferInsert;
export type MemberActivityTimelineEntry = typeof memberActivityTimeline.$inferSelect;
export type NewMemberActivityTimelineEntry = typeof memberActivityTimeline.$inferInsert;
export type MemberProfileMedia = typeof memberProfileMedia.$inferSelect;
export type NewMemberProfileMedia = typeof memberProfileMedia.$inferInsert;
