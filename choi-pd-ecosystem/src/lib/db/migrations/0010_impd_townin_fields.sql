-- IMPD-3: members 테이블에 Townin 연동 및 IMPD 검증 필드 추가
-- Townin 사용자 정보 필드
ALTER TABLE `members` ADD `townin_email` text;--> statement-breakpoint
ALTER TABLE `members` ADD `townin_name` text;--> statement-breakpoint
ALTER TABLE `members` ADD `townin_role` text;--> statement-breakpoint
-- IMPD 검증 프로세스 필드 (의지 필터 — 7일 3단계)
ALTER TABLE `members` ADD `impd_status` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_started_at` integer;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_completed_at` integer;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_verification_id` text;--> statement-breakpoint
ALTER TABLE `members` ADD `impd_steps_data` text DEFAULT '{}';--> statement-breakpoint
CREATE UNIQUE INDEX `members_impd_verification_id_unique` ON `members` (`impd_verification_id`);--> statement-breakpoint
CREATE INDEX `idx_members_impd_status` ON `members` (`impd_status`);--> statement-breakpoint
CREATE INDEX `idx_members_townin_user` ON `members` (`towningraph_user_id`);
