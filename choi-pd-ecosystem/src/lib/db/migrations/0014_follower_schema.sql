-- 팔로워·수상·채널·타임라인·프로필 미디어 5테이블

CREATE TABLE IF NOT EXISTS `member_followers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `follower_user_id` text,
  `follower_email` text,
  `follower_name` text,
  `subscribe_newsletter` integer DEFAULT 1,
  `subscribe_live_alert` integer DEFAULT 1,
  `status` text DEFAULT 'active' NOT NULL,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_member_followers_member` ON `member_followers`(`member_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_member_followers_unique_user` ON `member_followers`(`member_id`,`follower_user_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_member_followers_unique_email` ON `member_followers`(`member_id`,`follower_email`);

CREATE TABLE IF NOT EXISTS `member_awards` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `title` text NOT NULL,
  `organization` text NOT NULL,
  `awarded_year` integer,
  `category` text DEFAULT 'award' NOT NULL,
  `logo_url` text,
  `detail_url` text,
  `description` text,
  `accent_color` text,
  `display_order` integer DEFAULT 0,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_member_awards_member` ON `member_awards`(`member_id`);

CREATE TABLE IF NOT EXISTS `member_channels` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `platform` text NOT NULL,
  `display_name` text NOT NULL,
  `url` text NOT NULL,
  `handle` text,
  `follower_count` integer DEFAULT 0,
  `activity_score` integer DEFAULT 0,
  `is_active` integer DEFAULT 1,
  `display_order` integer DEFAULT 0,
  `last_synced_at` integer,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_member_channels_member` ON `member_channels`(`member_id`);

CREATE TABLE IF NOT EXISTS `member_activity_timeline` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `kind` text NOT NULL,
  `title` text NOT NULL,
  `summary` text,
  `thumbnail_url` text,
  `link_url` text,
  `occurred_at` integer NOT NULL,
  `is_pinned` integer DEFAULT 0,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_member_activity_timeline_member` ON `member_activity_timeline`(`member_id`);
CREATE INDEX IF NOT EXISTS `idx_member_activity_timeline_occurred` ON `member_activity_timeline`(`occurred_at`);

CREATE TABLE IF NOT EXISTS `member_profile_media` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `role` text NOT NULL,
  `media_url` text NOT NULL,
  `poster_url` text,
  `media_type` text DEFAULT 'image' NOT NULL,
  `caption` text,
  `display_order` integer DEFAULT 0,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_member_profile_media_member` ON `member_profile_media`(`member_id`);
