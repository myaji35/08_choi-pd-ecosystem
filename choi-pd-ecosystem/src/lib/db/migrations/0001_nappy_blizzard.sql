CREATE TABLE `hero_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`url` text NOT NULL,
	`alt_text` text NOT NULL,
	`file_size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`upload_status` text DEFAULT 'pending' NOT NULL,
	`uploaded_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`is_active` integer DEFAULT false NOT NULL
);
