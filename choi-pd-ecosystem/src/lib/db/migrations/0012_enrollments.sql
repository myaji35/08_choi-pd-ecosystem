-- BIZ-CHECK Phase 3: 수강권(enrollments) 테이블 신설
-- 외부 결제 webhook이 쓰고, /dashboard/my-courses가 읽는 접근 제어 대장.

CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `user_id` text NOT NULL,
  `course_id` integer NOT NULL,
  `provider` text NOT NULL,
  `external_order_id` text,
  `amount` integer,
  `status` text DEFAULT 'pending' NOT NULL,
  `paid_at` integer,
  `refunded_at` integer,
  `metadata` text,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `idx_enrollments_user` ON `enrollments` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_enrollments_course` ON `enrollments` (`course_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `uq_enrollments_provider_order` ON `enrollments` (`provider`, `external_order_id`);
