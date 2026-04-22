-- ISS-067: member_reviews 테이블 확장
--   - reviewer_email: 선택 이메일 (원문 또는 sha256 해시 — API 선택)
--   - status: 트리아지 상태머신 ('new'|'triaged'|'responded'|'archived')
--   - source: 수집 경로 ('public_form'|'admin_submitted')
--   - updated_at: 상태 변경 추적
--
-- is_approved는 하위 호환 유지(legacy). 신규 로직은 status를 기준으로 판단:
--   - 승인된 리뷰 조건: is_approved = 1 OR status IN ('triaged','responded')
--
-- SQLite ALTER TABLE 제약 회피: 컬럼 추가는 1개씩, 인덱스는 CREATE INDEX IF NOT EXISTS
ALTER TABLE `member_reviews` ADD `reviewer_email` text;--> statement-breakpoint
ALTER TABLE `member_reviews` ADD `status` text NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `member_reviews` ADD `source` text DEFAULT 'public_form';--> statement-breakpoint
ALTER TABLE `member_reviews` ADD `updated_at` integer DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_member_reviews_status` ON `member_reviews`(`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_member_reviews_member` ON `member_reviews`(`member_id`);
