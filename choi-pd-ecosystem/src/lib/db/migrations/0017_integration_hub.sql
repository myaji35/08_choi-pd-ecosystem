-- Migration 0017: 통합 연동 관리 허브 (ISS-072 HUB-P0)
-- 설계 근거: memory/project_pending_integrations_hub.md (2026-04-17 확정)
-- 기존 integrations 테이블(automation: Slack/CRM)과는 별개 도메인.

-- 1. Integration Projects — 프로젝트 마스터
CREATE TABLE IF NOT EXISTS `integration_projects` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `key` text NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `base_url` text NOT NULL,
  `api_base_url` text,
  `endpoint_template` text,
  `auth_type` text DEFAULT 'none' NOT NULL,
  `auth_credential` text,
  `adapter_key` text,
  `brand_color` text,
  `logo_url` text,
  `is_enabled` integer DEFAULT true NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_integration_projects_tenant_key` ON `integration_projects` (`tenant_id`,`key`);
CREATE INDEX IF NOT EXISTS `idx_integration_projects_tenant` ON `integration_projects` (`tenant_id`);

-- 2. Distributor Integrations — 회원 ↔ 프로젝트 다대다
CREATE TABLE IF NOT EXISTS `distributor_integrations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `distributor_id` integer NOT NULL,
  `project_id` integer NOT NULL,
  `external_id` text NOT NULL,
  `external_url` text,
  `role` text,
  `is_public` integer DEFAULT false NOT NULL,
  `last_snapshot_json` text,
  `last_synced_at` integer,
  `sync_status` text DEFAULT 'pending' NOT NULL,
  `sync_error` text,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`distributor_id`) REFERENCES `distributors`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`project_id`) REFERENCES `integration_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_distrib_integ_unique` ON `distributor_integrations` (`distributor_id`,`project_id`);
CREATE INDEX IF NOT EXISTS `idx_distrib_integ_tenant` ON `distributor_integrations` (`tenant_id`);
CREATE INDEX IF NOT EXISTS `idx_distrib_integ_project` ON `distributor_integrations` (`project_id`);
CREATE INDEX IF NOT EXISTS `idx_distrib_integ_distrib` ON `distributor_integrations` (`distributor_id`);

-- 3. Integration Sync Log — 동기화 관측
CREATE TABLE IF NOT EXISTS `integration_sync_log` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tenant_id` integer DEFAULT 1,
  `distributor_integration_id` integer,
  `project_id` integer,
  `action` text NOT NULL,
  `status` text NOT NULL,
  `duration_ms` integer,
  `http_status` integer,
  `error_message` text,
  `response_sample` text,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`distributor_integration_id`) REFERENCES `distributor_integrations`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`project_id`) REFERENCES `integration_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `idx_integration_sync_log_tenant` ON `integration_sync_log` (`tenant_id`);
CREATE INDEX IF NOT EXISTS `idx_integration_sync_log_project` ON `integration_sync_log` (`project_id`);
CREATE INDEX IF NOT EXISTS `idx_integration_sync_log_created` ON `integration_sync_log` (`created_at`);
