// 자동화: 워크플로우, 실행, 연동, 웹훅, 로그, 템플릿

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// ============================================================
// Epic 22: Workflow Automation & Integrations
// ============================================================

// Workflows Table (워크플로우 정의)
export const workflows = sqliteTable('workflows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  description: text('description'),
  trigger: text('trigger').notNull(), // 'manual', 'schedule', 'event', 'webhook'
  triggerConfig: text('trigger_config').notNull(), // JSON: { event: "distributor_approved", schedule: "0 9 * * *" }
  actions: text('actions').notNull(), // JSON array of action steps
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdBy: text('created_by').notNull(),
  lastExecutedAt: integer('last_executed_at', { mode: 'timestamp' }),
  executionCount: integer('execution_count').default(0).notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_workflows_tenant').on(table.tenantId),
]);

// Workflow Executions Table (워크플로우 실행 이력)
export const workflowExecutions = sqliteTable('workflow_executions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  workflowId: integer('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] }).default('pending').notNull(),
  trigger: text('trigger').notNull(), // 'manual', 'schedule', 'event', 'webhook'
  triggerData: text('trigger_data'), // JSON: original event data
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  duration: integer('duration'), // 실행 시간 (ms)
  steps: text('steps'), // JSON array: [{ step: "send_email", status: "completed", output: {...} }]
  error: text('error'), // 에러 메시지
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_workflow_executions_tenant').on(table.tenantId),
]);

// Integrations Table (외부 서비스 연동)
export const integrations = sqliteTable('integrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(), // 'Slack', 'Discord', 'Google Sheets', 'HubSpot', 'Zapier'
  type: text('type', { enum: ['messaging', 'crm', 'storage', 'analytics', 'automation'] }).notNull(),
  provider: text('provider').notNull(), // 'slack', 'discord', 'google', 'hubspot', 'zapier'
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true).notNull(),
  credentials: text('credentials').notNull(), // JSON (encrypted): { token, api_key, oauth_tokens }
  config: text('config'), // JSON: provider-specific configuration
  scopes: text('scopes'), // JSON array: ['read', 'write', 'admin']
  webhookUrl: text('webhook_url'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  syncStatus: text('sync_status', { enum: ['active', 'error', 'disabled'] }).default('active'),
  errorMessage: text('error_message'),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_integrations_tenant').on(table.tenantId),
]);

// Webhooks Table (웹훅 관리)
export const webhooks = sqliteTable('webhooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  url: text('url').notNull(),
  events: text('events').notNull(), // JSON array: ['distributor.created', 'payment.completed']
  secret: text('secret').notNull(), // HMAC signature secret
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  headers: text('headers'), // JSON: custom headers
  retryConfig: text('retry_config'), // JSON: { max_retries: 3, backoff: "exponential" }
  lastTriggeredAt: integer('last_triggered_at', { mode: 'timestamp' }),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_webhooks_tenant').on(table.tenantId),
]);

// Webhook Logs Table (웹훅 실행 로그)
export const webhookLogs = sqliteTable('webhook_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  webhookId: integer('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: text('payload').notNull(), // JSON
  status: text('status', { enum: ['success', 'failed', 'retrying'] }).notNull(),
  responseCode: integer('response_code'),
  responseBody: text('response_body'),
  attemptNumber: integer('attempt_number').default(1).notNull(),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_webhook_logs_tenant').on(table.tenantId),
]);

// Automation Templates Table (자동화 템플릿)
export const automationTemplates = sqliteTable('automation_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category', { enum: ['onboarding', 'engagement', 'support', 'marketing', 'sales'] }).notNull(),
  icon: text('icon').default('zap'),
  workflowTemplate: text('workflow_template').notNull(), // JSON: workflow definition
  requiredIntegrations: text('required_integrations'), // JSON array: ['slack', 'email']
  difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).default('beginner').notNull(),
  estimatedTime: integer('estimated_time'), // 설정 예상 시간 (분)
  popularity: integer('popularity').default(0).notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true).notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_automation_templates_tenant').on(table.tenantId),
]);

// Export types for Epic 22
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecutions.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type NewWebhookLog = typeof webhookLogs.$inferInsert;

export type AutomationTemplate = typeof automationTemplates.$inferSelect;
export type NewAutomationTemplate = typeof automationTemplates.$inferInsert;
