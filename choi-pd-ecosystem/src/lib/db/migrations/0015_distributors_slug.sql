-- distributors에 slug 컬럼 추가 — impd.me/<slug> 주소 식별자
ALTER TABLE `distributors` ADD `slug` text;
CREATE UNIQUE INDEX IF NOT EXISTS `idx_distributors_slug` ON `distributors`(`tenant_id`, `slug`);
