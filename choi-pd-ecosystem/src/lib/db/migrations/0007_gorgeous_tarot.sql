CREATE TABLE `ai_generated_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_type` text NOT NULL,
	`prompt` text NOT NULL,
	`generated_text` text NOT NULL,
	`model` text NOT NULL,
	`temperature` integer,
	`max_tokens` integer,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`used_in_content_id` integer,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`recommendation_type` text NOT NULL,
	`target_id` integer NOT NULL,
	`score` integer NOT NULL,
	`reason` text,
	`metadata` text,
	`clicked` integer DEFAULT false,
	`clicked_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chatbot_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text,
	`user_type` text NOT NULL,
	`role` text NOT NULL,
	`message` text NOT NULL,
	`intent` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_embeddings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_type` text NOT NULL,
	`content_id` integer NOT NULL,
	`embedding_model` text NOT NULL,
	`embedding` text NOT NULL,
	`text_content` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_quality_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_type` text NOT NULL,
	`content_id` integer NOT NULL,
	`overall_score` integer NOT NULL,
	`readability_score` integer,
	`seo_score` integer,
	`engagement_score` integer,
	`sentiment_score` integer,
	`keyword_density` text,
	`suggestions` text,
	`analyzed_by` text NOT NULL,
	`analyzed_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `faq_knowledge_base` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`keywords` text NOT NULL,
	`match_count` integer DEFAULT 0 NOT NULL,
	`helpful_count` integer DEFAULT 0 NOT NULL,
	`not_helpful_count` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `image_auto_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_url` text NOT NULL,
	`content_type` text NOT NULL,
	`content_id` integer NOT NULL,
	`tags` text NOT NULL,
	`categories` text NOT NULL,
	`objects` text,
	`colors` text,
	`ocr_text` text,
	`adult_content` integer DEFAULT false,
	`confidence` integer NOT NULL,
	`model` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_activity_patterns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`preferred_categories` text,
	`active_hours` text,
	`active_days_of_week` text,
	`average_session_duration` integer,
	`total_sessions` integer DEFAULT 0 NOT NULL,
	`last_activity_type` text,
	`engagement_score` integer DEFAULT 0 NOT NULL,
	`churn_risk` text DEFAULT 'low',
	`last_analyzed_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_activity_patterns_user_id_unique` ON `user_activity_patterns` (`user_id`);