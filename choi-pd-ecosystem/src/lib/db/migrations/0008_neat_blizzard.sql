CREATE TABLE `automation_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`icon` text DEFAULT 'zap',
	`workflow_template` text NOT NULL,
	`required_integrations` text,
	`difficulty` text DEFAULT 'beginner' NOT NULL,
	`estimated_time` integer,
	`popularity` integer DEFAULT 0 NOT NULL,
	`is_public` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`credentials` text NOT NULL,
	`config` text,
	`scopes` text,
	`webhook_url` text,
	`last_synced_at` integer,
	`sync_status` text DEFAULT 'active',
	`error_message` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `live_streams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`scheduled_start_time` integer NOT NULL,
	`scheduled_end_time` integer,
	`actual_start_time` integer,
	`actual_end_time` integer,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`stream_key` text NOT NULL,
	`rtmp_url` text NOT NULL,
	`hls_playback_url` text,
	`max_viewers` integer DEFAULT 1000,
	`current_viewers` integer DEFAULT 0,
	`peak_viewers` integer DEFAULT 0,
	`total_views` integer DEFAULT 0,
	`enable_chat` integer DEFAULT true,
	`enable_recording` integer DEFAULT true,
	`recording_url` text,
	`thumbnail_url` text,
	`tags` text,
	`category` text,
	`visibility` text DEFAULT 'public' NOT NULL,
	`hosted_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlist_videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer NOT NULL,
	`video_id` integer NOT NULL,
	`order` integer NOT NULL,
	`added_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `video_playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer NOT NULL,
	`title` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`thumbnail_url` text,
	`order` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`comment` text NOT NULL,
	`timestamp` integer,
	`parent_comment_id` integer,
	`like_count` integer DEFAULT 0 NOT NULL,
	`is_edited` integer DEFAULT false,
	`is_pinned` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_comment_id`) REFERENCES `video_comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`visibility` text DEFAULT 'public' NOT NULL,
	`created_by` text NOT NULL,
	`video_count` integer DEFAULT 0 NOT NULL,
	`total_duration` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `video_subtitles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer NOT NULL,
	`language` text NOT NULL,
	`label` text NOT NULL,
	`format` text DEFAULT 'vtt' NOT NULL,
	`file_url` text NOT NULL,
	`is_default` integer DEFAULT false,
	`is_auto_generated` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`course_id` integer,
	`original_file_name` text,
	`file_size` integer,
	`duration` integer NOT NULL,
	`thumbnail_url` text,
	`status` text DEFAULT 'uploading' NOT NULL,
	`processing_progress` integer DEFAULT 0,
	`hls_url` text,
	`dash_url` text,
	`mp4_url` text,
	`resolutions` text,
	`drm_enabled` integer DEFAULT false,
	`drm_provider` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`average_watch_time` integer,
	`completion_rate` integer,
	`visibility` text DEFAULT 'public' NOT NULL,
	`allow_download` integer DEFAULT false,
	`tags` text,
	`category` text,
	`language` text DEFAULT 'ko',
	`uploaded_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `watch_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_type` text NOT NULL,
	`video_id` integer NOT NULL,
	`watched_duration` integer NOT NULL,
	`last_position` integer NOT NULL,
	`completed` integer DEFAULT false,
	`completed_at` integer,
	`device` text,
	`quality` text,
	`last_watched_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`webhook_id` integer NOT NULL,
	`event` text NOT NULL,
	`payload` text NOT NULL,
	`status` text NOT NULL,
	`response_code` integer,
	`response_body` text,
	`attempt_number` integer DEFAULT 1 NOT NULL,
	`error` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`events` text NOT NULL,
	`secret` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`headers` text,
	`retry_config` text,
	`last_triggered_at` integer,
	`success_count` integer DEFAULT 0 NOT NULL,
	`failure_count` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workflow_executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workflow_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`trigger` text NOT NULL,
	`trigger_data` text,
	`started_at` integer,
	`completed_at` integer,
	`duration` integer,
	`steps` text,
	`error` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`trigger` text NOT NULL,
	`trigger_config` text NOT NULL,
	`actions` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`last_executed_at` integer,
	`execution_count` integer DEFAULT 0 NOT NULL,
	`success_count` integer DEFAULT 0 NOT NULL,
	`failure_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
