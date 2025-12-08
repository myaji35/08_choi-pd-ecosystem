CREATE TABLE `ab_test_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_id` integer NOT NULL,
	`user_id` text,
	`session_id` text NOT NULL,
	`variant` text NOT NULL,
	`converted` integer DEFAULT false,
	`conversion_value` integer,
	`assigned_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`converted_at` integer,
	`metadata` text,
	FOREIGN KEY (`test_id`) REFERENCES `ab_tests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ab_tests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`hypothesis` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`target_metric` text NOT NULL,
	`variants` text NOT NULL,
	`traffic_allocation` text NOT NULL,
	`total_participants` integer DEFAULT 0,
	`confidence_level` integer DEFAULT 95,
	`results` text,
	`winner` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`user_type` text,
	`session_id` text,
	`event_name` text NOT NULL,
	`event_category` text NOT NULL,
	`event_action` text,
	`event_label` text,
	`event_value` integer,
	`page_path` text,
	`page_title` text,
	`referrer` text,
	`ip_address` text,
	`user_agent` text,
	`device_type` text,
	`browser` text,
	`os` text,
	`country` text,
	`city` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cohort_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cohort_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`user_email` text,
	`joined_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`metadata` text,
	FOREIGN KEY (`cohort_id`) REFERENCES `cohorts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cohorts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cohort_type` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`criteria` text NOT NULL,
	`user_count` integer DEFAULT 0 NOT NULL,
	`metrics` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `custom_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`report_type` text NOT NULL,
	`data_source` text NOT NULL,
	`columns` text NOT NULL,
	`filters` text,
	`group_by` text,
	`order_by` text,
	`chart_type` text,
	`chart_config` text,
	`schedule` text,
	`recipients` text,
	`is_public` integer DEFAULT false,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `funnels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`steps` text NOT NULL,
	`conversion_window` integer DEFAULT 7,
	`total_users` integer DEFAULT 0,
	`conversion_data` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rfm_segments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`recency_score` integer NOT NULL,
	`frequency_score` integer NOT NULL,
	`monetary_score` integer NOT NULL,
	`rfm_segment` text NOT NULL,
	`last_activity_at` integer,
	`total_transactions` integer DEFAULT 0,
	`total_revenue` integer DEFAULT 0,
	`calculated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
