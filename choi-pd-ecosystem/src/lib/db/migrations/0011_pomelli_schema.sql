CREATE TABLE `personal_dna` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`colors_json` text DEFAULT '{}' NOT NULL,
	`semantic_tokens_json` text DEFAULT '{}' NOT NULL,
	`style_keywords` text DEFAULT '[]',
	`tone_keywords` text DEFAULT '[]',
	`core_values` text DEFAULT '[]',
	`slogan` text,
	`identity_json` text DEFAULT '{}',
	`override_map` text DEFAULT '{}',
	`sync_policy` text DEFAULT 'auto_all' NOT NULL,
	`generated_by` text DEFAULT 'self_declared' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_personal_dna_member` ON `personal_dna` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_personal_dna_tenant` ON `personal_dna` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `profile_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`username_slug` text NOT NULL,
	`template_id` text DEFAULT 'pomelli_v1' NOT NULL,
	`active_theme_id` integer,
	`is_published` integer DEFAULT false NOT NULL,
	`share_count` integer DEFAULT 0 NOT NULL,
	`og_image_url` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`active_theme_id`) REFERENCES `profile_themes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_pages_member_id_unique` ON `profile_pages` (`member_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `profile_pages_username_slug_unique` ON `profile_pages` (`username_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_profile_pages_slug` ON `profile_pages` (`username_slug`);--> statement-breakpoint
CREATE INDEX `idx_profile_pages_tenant` ON `profile_pages` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `profile_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` integer NOT NULL,
	`section_type` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`source_mode` text DEFAULT 'auto' NOT NULL,
	`content_json` text DEFAULT '{}' NOT NULL,
	`source_analysis_id` integer,
	`is_enabled` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`profile_id`) REFERENCES `profile_pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_profile_sections_profile` ON `profile_sections` (`profile_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_profile_sections_profile_type` ON `profile_sections` (`profile_id`,`section_type`);--> statement-breakpoint
CREATE TABLE `profile_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`dna_id` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`base_colors_json` text DEFAULT '{}' NOT NULL,
	`derived_colors_json` text DEFAULT '{}' NOT NULL,
	`semantic_mapping_json` text DEFAULT '{}' NOT NULL,
	`contrast_report_json` text DEFAULT '{}',
	`theme_mode` text DEFAULT 'light' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`published_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dna_id`) REFERENCES `personal_dna`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_profile_themes_member` ON `profile_themes` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_profile_themes_published` ON `profile_themes` (`member_id`,`is_published`);