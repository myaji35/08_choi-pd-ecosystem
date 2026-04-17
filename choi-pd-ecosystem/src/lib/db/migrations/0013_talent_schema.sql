-- 달란트·문서·갭리포트 스키마 (Tier 2 MVP)

CREATE TABLE IF NOT EXISTS `skills` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `canonical_name` text NOT NULL,
  `aliases` text DEFAULT '[]' NOT NULL,
  `category` text NOT NULL,
  `axis` text,
  `description` text,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_skills_tenant_canonical` ON `skills`(`tenant_id`,`canonical_name`);
CREATE INDEX IF NOT EXISTS `idx_skills_axis` ON `skills`(`axis`);

CREATE TABLE IF NOT EXISTS `member_skills` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `skill_id` integer NOT NULL,
  `level` text DEFAULT 'intermediate' NOT NULL,
  `years_experience` integer,
  `weight` integer DEFAULT 50 NOT NULL,
  `source` text DEFAULT 'self' NOT NULL,
  `verified_at` integer,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_member_skills_unique` ON `member_skills`(`member_id`,`skill_id`);
CREATE INDEX IF NOT EXISTS `idx_member_skills_member` ON `member_skills`(`member_id`);
CREATE INDEX IF NOT EXISTS `idx_member_skills_skill` ON `member_skills`(`skill_id`);

CREATE TABLE IF NOT EXISTS `member_documents` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `filename` text NOT NULL,
  `title` text,
  `category` text DEFAULT 'other' NOT NULL,
  `tags` text DEFAULT '[]' NOT NULL,
  `content_md` text NOT NULL,
  `content_hash` text NOT NULL,
  `size_bytes` integer DEFAULT 0,
  `parsed_at` integer,
  `extracted_skills_count` integer DEFAULT 0,
  `extracted_entities` text DEFAULT '{}',
  `uploaded_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_member_documents_member` ON `member_documents`(`member_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_member_documents_hash` ON `member_documents`(`member_id`,`content_hash`);

CREATE TABLE IF NOT EXISTS `member_gap_reports` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `member_id` integer NOT NULL,
  `profession` text NOT NULL,
  `completeness_score` integer DEFAULT 0,
  `radar_self` text NOT NULL,
  `radar_median` text NOT NULL,
  `radar_top10` text NOT NULL,
  `gaps_json` text DEFAULT '[]' NOT NULL,
  `opportunities_json` text DEFAULT '[]' NOT NULL,
  `growth_path_json` text DEFAULT '[]' NOT NULL,
  `peer_sample_size` integer DEFAULT 0,
  `generated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_member_gap_reports_member` ON `member_gap_reports`(`member_id`);
