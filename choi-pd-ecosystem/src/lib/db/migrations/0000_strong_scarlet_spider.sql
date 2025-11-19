CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_username_unique` ON `admin_users` (`username`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`price` integer,
	`thumbnail_url` text,
	`external_link` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`published` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`subscribed_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_email_unique` ON `leads` (`email`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`published` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `sns_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform` text NOT NULL,
	`account_name` text NOT NULL,
	`account_id` text,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`token_expires_at` integer,
	`is_active` integer DEFAULT true,
	`last_synced_at` integer,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sns_post_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scheduled_post_id` integer NOT NULL,
	`platform` text NOT NULL,
	`external_post_id` text,
	`action` text NOT NULL,
	`status` text NOT NULL,
	`response` text,
	`error` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`scheduled_post_id`) REFERENCES `sns_scheduled_posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sns_scheduled_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_type` text NOT NULL,
	`content_id` integer NOT NULL,
	`platform` text NOT NULL,
	`account_id` integer NOT NULL,
	`message` text NOT NULL,
	`image_url` text,
	`link` text,
	`scheduled_at` integer NOT NULL,
	`status` text DEFAULT 'pending',
	`published_at` integer,
	`external_post_id` text,
	`error` text,
	`retry_count` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`account_id`) REFERENCES `sns_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
