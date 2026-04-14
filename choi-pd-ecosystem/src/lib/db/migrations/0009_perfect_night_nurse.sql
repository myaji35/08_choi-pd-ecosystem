CREATE TABLE `chat_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`title` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_chat_conversations_tenant` ON `chat_conversations` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`conversation_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`image_urls` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chat_messages_tenant` ON `chat_messages` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`booking_type` text,
	`external_url` text,
	`description` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_bookings_tenant` ON `member_bookings` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`sender_name` text NOT NULL,
	`sender_email` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_inquiries_tenant` ON `member_inquiries` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_memories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`type` text DEFAULT 'activity',
	`date` text,
	`location` text,
	`category` text DEFAULT 'other',
	`summary` text NOT NULL,
	`detail` text,
	`image_urls` text,
	`source_message_id` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_memories_tenant` ON `member_memories` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_portfolio_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`media_url` text NOT NULL,
	`media_type` text,
	`category` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_portfolio_items_tenant` ON `member_portfolio_items` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text,
	`thumbnail_url` text,
	`is_published` integer DEFAULT 0,
	`published_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_posts_tenant` ON `member_posts` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`reviewer_name` text NOT NULL,
	`rating` integer NOT NULL,
	`content` text,
	`is_approved` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_reviews_tenant` ON `member_reviews` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`price` text,
	`price_label` text,
	`cta_url` text,
	`cta_label` text,
	`image_url` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT 1,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_services_tenant` ON `member_services` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `member_uploads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`member_id` integer NOT NULL,
	`filename` text NOT NULL,
	`storage_path` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_uploads_tenant` ON `member_uploads` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer DEFAULT 1,
	`towningraph_user_id` text,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`profile_image` text,
	`cover_image` text,
	`bio` text,
	`social_links` text,
	`business_type` text,
	`profession` text,
	`region` text,
	`status` text DEFAULT 'pending_approval',
	`subscription_plan` text DEFAULT 'basic',
	`enabled_modules` text DEFAULT '[]',
	`theme_config` text DEFAULT '{}',
	`rejection_reason` text,
	`is_featured` integer DEFAULT 0,
	`featured_order` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_towningraph_user_id_unique` ON `members` (`towningraph_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_slug_unique` ON `members` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_members_tenant` ON `members` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `saas_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer NOT NULL,
	`subscription_id` integer,
	`stripe_invoice_id` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'krw' NOT NULL,
	`status` text NOT NULL,
	`invoice_pdf_url` text,
	`hosted_invoice_url` text,
	`period_start` integer,
	`period_end` integer,
	`paid_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subscription_id`) REFERENCES `saas_subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saas_invoices_stripe_invoice_id_unique` ON `saas_invoices` (`stripe_invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_saas_invoices_tenant` ON `saas_invoices` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_saas_invoices_status` ON `saas_invoices` (`status`);--> statement-breakpoint
CREATE TABLE `saas_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer NOT NULL,
	`stripe_subscription_id` text,
	`stripe_customer_id` text NOT NULL,
	`stripe_price_id` text NOT NULL,
	`plan` text NOT NULL,
	`billing_period` text DEFAULT 'monthly' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`current_period_start` integer,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false,
	`canceled_at` integer,
	`trial_start` integer,
	`trial_end` integer,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saas_subscriptions_stripe_subscription_id_unique` ON `saas_subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_saas_sub_tenant` ON `saas_subscriptions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_saas_sub_stripe` ON `saas_subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE INDEX `idx_saas_sub_status` ON `saas_subscriptions` (`status`);--> statement-breakpoint
CREATE TABLE `tenant_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer NOT NULL,
	`clerk_user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'invited' NOT NULL,
	`invited_by` text,
	`invited_at` integer,
	`joined_at` integer,
	`last_active_at` integer,
	`permissions` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tenant_members_unique` ON `tenant_members` (`tenant_id`,`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant_members_tenant` ON `tenant_members` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant_members_user` ON `tenant_members` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant_members_email` ON `tenant_members` (`email`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clerk_user_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`profession` text DEFAULT 'freelancer' NOT NULL,
	`business_type` text DEFAULT 'individual' NOT NULL,
	`region` text,
	`status` text DEFAULT 'active' NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`logo_url` text,
	`favicon_url` text,
	`primary_color` text DEFAULT '#3b82f6',
	`secondary_color` text DEFAULT '#8b5cf6',
	`font_family` text DEFAULT 'Inter',
	`custom_domain` text,
	`max_storage` integer DEFAULT 524288000,
	`used_storage` integer DEFAULT 0,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`settings` text,
	`metadata` text,
	`deleted_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_tenants_clerk_user` ON `tenants` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `idx_tenants_status` ON `tenants` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tenants_plan` ON `tenants` (`plan`);--> statement-breakpoint
CREATE INDEX `idx_tenants_custom_domain` ON `tenants` (`custom_domain`);--> statement-breakpoint
DROP INDEX `distributors_email_unique`;--> statement-breakpoint
ALTER TABLE `distributors` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_distributors_tenant_email` ON `distributors` (`tenant_id`,`email`);--> statement-breakpoint
CREATE INDEX `idx_distributors_tenant` ON `distributors` (`tenant_id`);--> statement-breakpoint
DROP INDEX `leads_email_unique`;--> statement-breakpoint
ALTER TABLE `leads` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_leads_tenant_email` ON `leads` (`tenant_id`,`email`);--> statement-breakpoint
DROP INDEX `settings_key_unique`;--> statement-breakpoint
ALTER TABLE `settings` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_settings_tenant_key` ON `settings` (`tenant_id`,`key`);--> statement-breakpoint
ALTER TABLE `ab_test_participants` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_ab_test_participants_tenant` ON `ab_test_participants` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `ab_tests` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_ab_tests_tenant` ON `ab_tests` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `ai_generated_content` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_ai_generated_content_tenant` ON `ai_generated_content` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `ai_recommendations` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_ai_recommendations_tenant` ON `ai_recommendations` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `analytics_events` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_analytics_events_tenant` ON `analytics_events` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_tenant` ON `audit_logs` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `automation_templates` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_automation_templates_tenant` ON `automation_templates` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `chatbot_conversations` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_chatbot_conversations_tenant` ON `chatbot_conversations` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `cohort_users` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_cohort_users_tenant` ON `cohort_users` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `cohorts` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_cohorts_tenant` ON `cohorts` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `content_embeddings` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_content_embeddings_tenant` ON `content_embeddings` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `content_quality_scores` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_content_quality_scores_tenant` ON `content_quality_scores` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `courses` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_courses_tenant` ON `courses` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `custom_reports` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_custom_reports_tenant` ON `custom_reports` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `data_deletion_requests` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_data_deletion_requests_tenant` ON `data_deletion_requests` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `distributor_activity_log` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_distributor_activity_log_tenant` ON `distributor_activity_log` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `distributor_resources` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_distributor_resources_tenant` ON `distributor_resources` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `faq_knowledge_base` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_faq_knowledge_base_tenant` ON `faq_knowledge_base` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `funnels` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_funnels_tenant` ON `funnels` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `hero_images` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_hero_images_tenant` ON `hero_images` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `image_auto_tags` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_image_auto_tags_tenant` ON `image_auto_tags` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `inquiries` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_inquiries_tenant` ON `inquiries` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `integrations` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_integrations_tenant` ON `integrations` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `invoices` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_invoices_tenant` ON `invoices` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `ip_access_control` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_ip_access_control_tenant` ON `ip_access_control` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `kanban_columns` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_kanban_columns_tenant` ON `kanban_columns` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `kanban_projects` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_kanban_projects_tenant` ON `kanban_projects` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `kanban_tasks` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_kanban_tasks_tenant` ON `kanban_tasks` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `live_streams` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_live_streams_tenant` ON `live_streams` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `login_attempts` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_login_attempts_tenant` ON `login_attempts` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `notifications` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_notifications_tenant` ON `notifications` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `organization_branding` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_organization_branding_tenant` ON `organization_branding` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `organization_members` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_organization_members_tenant` ON `organization_members` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `organizations` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_organizations_tenant` ON `organizations` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `password_history` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_password_history_tenant` ON `password_history` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `payments` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_payments_tenant` ON `payments` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `playlist_videos` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_playlist_videos_tenant` ON `playlist_videos` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `posts` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_posts_tenant` ON `posts` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `rfm_segments` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_rfm_segments_tenant` ON `rfm_segments` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `security_events` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_security_events_tenant` ON `security_events` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `sessions` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_sessions_tenant` ON `sessions` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `sla_metrics` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_sla_metrics_tenant` ON `sla_metrics` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `sns_accounts` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_sns_accounts_tenant` ON `sns_accounts` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `sns_post_history` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_sns_post_history_tenant` ON `sns_post_history` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `sns_scheduled_posts` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_sns_scheduled_posts_tenant` ON `sns_scheduled_posts` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `sso_configurations` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_sso_configurations_tenant` ON `sso_configurations` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `subscription_plans` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_subscription_plans_tenant` ON `subscription_plans` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `support_ticket_comments` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_support_ticket_comments_tenant` ON `support_ticket_comments` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `support_tickets` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_support_tickets_tenant` ON `support_tickets` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `teams` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_teams_tenant` ON `teams` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `two_factor_auth` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_two_factor_auth_tenant` ON `two_factor_auth` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `user_activity_patterns` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_user_activity_patterns_tenant` ON `user_activity_patterns` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `user_bulk_import_logs` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_user_bulk_import_logs_tenant` ON `user_bulk_import_logs` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `video_chapters` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_video_chapters_tenant` ON `video_chapters` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `video_comments` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_video_comments_tenant` ON `video_comments` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `video_playlists` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_video_playlists_tenant` ON `video_playlists` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `video_subtitles` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_video_subtitles_tenant` ON `video_subtitles` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `videos` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_videos_tenant` ON `videos` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `watch_history` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_watch_history_tenant` ON `watch_history` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_webhook_logs_tenant` ON `webhook_logs` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `webhooks` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_webhooks_tenant` ON `webhooks` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `workflow_executions` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_workflow_executions_tenant` ON `workflow_executions` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `workflows` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_workflows_tenant` ON `workflows` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `works` ADD `tenant_id` integer DEFAULT 1 REFERENCES tenants(id);--> statement-breakpoint
CREATE INDEX `idx_works_tenant` ON `works` (`tenant_id`);