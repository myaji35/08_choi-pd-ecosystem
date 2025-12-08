CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`user_email` text,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`resource_id` text,
	`changes` text,
	`ip_address` text,
	`user_agent` text,
	`status` text DEFAULT 'success' NOT NULL,
	`error_message` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `data_deletion_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_email` text NOT NULL,
	`user_type` text NOT NULL,
	`reason` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	`deleted_at` integer,
	`notes` text,
	`metadata` text
);
--> statement-breakpoint
CREATE TABLE `ip_access_control` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_address` text NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`applies_to` text DEFAULT 'all' NOT NULL,
	`expires_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ip_access_control_ip_address_unique` ON `ip_access_control` (`ip_address`);--> statement-breakpoint
CREATE TABLE `kanban_columns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`color` text DEFAULT '#6b7280',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `kanban_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kanban_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#3b82f6',
	`icon` text DEFAULT 'folder',
	`is_archived` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kanban_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`column_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium',
	`due_date` integer,
	`labels` text,
	`assignee` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_completed` integer DEFAULT false,
	`completed_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `kanban_projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`column_id`) REFERENCES `kanban_columns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`ip_address` text NOT NULL,
	`success` integer NOT NULL,
	`user_agent` text,
	`failure_reason` text,
	`attempted_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`user_type` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`is_read` integer DEFAULT false,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `password_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`event_type` text NOT NULL,
	`severity` text DEFAULT 'medium' NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`location` text,
	`description` text NOT NULL,
	`is_resolved` integer DEFAULT false,
	`resolved_at` integer,
	`resolved_by` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`session_token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`device_info` text,
	`last_activity_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`revoked_at` integer,
	`revoked_reason` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_token_unique` ON `sessions` (`session_token`);--> statement-breakpoint
CREATE TABLE `two_factor_auth` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`method` text NOT NULL,
	`secret` text NOT NULL,
	`backup_codes` text,
	`phone_number` text,
	`is_enabled` integer DEFAULT false NOT NULL,
	`last_used_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `two_factor_auth_user_id_unique` ON `two_factor_auth` (`user_id`);