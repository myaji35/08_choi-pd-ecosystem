CREATE TABLE `distributor_activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`distributor_id` integer NOT NULL,
	`activity_type` text NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `distributor_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`file_url` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer,
	`category` text NOT NULL,
	`required_plan` text DEFAULT 'all' NOT NULL,
	`download_count` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `distributors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`business_type` text NOT NULL,
	`region` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`subscription_plan` text,
	`subscription_start_date` integer,
	`subscription_end_date` integer,
	`contract_document` text,
	`notes` text,
	`total_revenue` integer DEFAULT 0,
	`last_activity_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `distributors_email_unique` ON `distributors` (`email`);