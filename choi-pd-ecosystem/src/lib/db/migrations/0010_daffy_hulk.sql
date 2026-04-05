CREATE TABLE `enrichment_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`source` text NOT NULL,
	`data_type` text NOT NULL,
	`value` text NOT NULL,
	`confidence` real DEFAULT 0.5,
	`is_approved` integer DEFAULT 0,
	`collected_at` text NOT NULL,
	`expires_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_enrichment_cache_member` ON `enrichment_cache` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_enrichment_cache_approved` ON `enrichment_cache` (`is_approved`);--> statement-breakpoint
CREATE TABLE `enrichment_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`action` text NOT NULL,
	`source` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `idx_enrichment_log_member` ON `enrichment_log` (`member_id`);--> statement-breakpoint
ALTER TABLE `members` ADD `townin_email` text;--> statement-breakpoint
ALTER TABLE `members` ADD `townin_name` text;--> statement-breakpoint
ALTER TABLE `members` ADD `townin_role` text;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_status` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_started_at` integer;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_completed_at` integer;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_verification_id` text;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_steps_data` text DEFAULT '{}';--> statement-breakpoint
CREATE UNIQUE INDEX `members_impd_verification_id_unique` ON `members` (`impd_verification_id`);--> statement-breakpoint
CREATE INDEX `idx_members_impd_status` ON `members` (`impd_status`);--> statement-breakpoint
CREATE INDEX `idx_members_townin_user` ON `members` (`towningraph_user_id`);