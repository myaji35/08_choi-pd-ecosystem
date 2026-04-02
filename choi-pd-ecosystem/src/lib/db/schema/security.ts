// 보안: 감사로그, 보안이벤트, GDPR, IP제어, 2FA, 로그인, 세션, 비밀번호

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// ============================================
// Epic 21: 고급 보안 및 컴플라이언스 테이블
// ============================================

// Audit Logs (감사 로그 - 모든 중요 작업 기록)
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id').notNull(), // Clerk user ID or admin ID
  userType: text('user_type', { enum: ['admin', 'pd', 'distributor', 'system'] }).notNull(),
  userEmail: text('user_email'),
  action: text('action').notNull(), // 예: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  resource: text('resource').notNull(), // 예: 'distributor', 'payment', 'settings'
  resourceId: text('resource_id'), // 리소스의 ID
  changes: text('changes'), // JSON: 변경 전후 데이터
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  status: text('status', { enum: ['success', 'failed', 'pending'] }).default('success').notNull(),
  errorMessage: text('error_message'), // 실패 시 에러 메시지
  metadata: text('metadata'), // JSON: 추가 정보
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_audit_logs_tenant').on(table.tenantId),
]);

// Security Events (보안 이벤트 - 의심스러운 활동 추적)
export const securityEvents = sqliteTable('security_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id'), // null 가능 (로그인 실패 시 등)
  eventType: text('event_type', {
    enum: ['login_failed', 'login_success', 'suspicious_activity', 'brute_force', 'ip_blocked', 'password_change', '2fa_enabled', '2fa_disabled']
  }).notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).default('medium').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  location: text('location'), // GeoIP 기반 위치
  description: text('description').notNull(),
  isResolved: integer('is_resolved', { mode: 'boolean' }).default(false),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  resolvedBy: text('resolved_by'), // Admin user ID
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_security_events_tenant').on(table.tenantId),
]);

// Data Deletion Requests (GDPR 개인정보 삭제 요청)
export const dataDeletionRequests = sqliteTable('data_deletion_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id').notNull(),
  userEmail: text('user_email').notNull(),
  userType: text('user_type', { enum: ['distributor', 'lead', 'inquiry'] }).notNull(),
  reason: text('reason'),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'completed'] }).default('pending').notNull(),
  requestedAt: integer('requested_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  reviewedBy: text('reviewed_by'), // Admin user ID
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  notes: text('notes'), // Admin 메모
  metadata: text('metadata') // JSON: 삭제된 데이터 백업 정보
}, (table) => [
  index('idx_data_deletion_requests_tenant').on(table.tenantId),
]);

// IP Whitelist/Blacklist (IP 접근 제어)
export const ipAccessControl = sqliteTable('ip_access_control', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  ipAddress: text('ip_address').notNull().unique(),
  type: text('type', { enum: ['whitelist', 'blacklist'] }).notNull(),
  reason: text('reason').notNull(),
  appliesTo: text('applies_to', { enum: ['all', 'admin', 'distributor'] }).default('all').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }), // null = 영구
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdBy: text('created_by').notNull(), // Admin user ID
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_ip_access_control_tenant').on(table.tenantId),
]);

// Two-Factor Authentication (2FA 설정)
export const twoFactorAuth = sqliteTable('two_factor_auth', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id').notNull().unique(),
  userType: text('user_type', { enum: ['admin', 'pd', 'distributor'] }).notNull(),
  method: text('method', { enum: ['totp', 'sms', 'email'] }).notNull(),
  secret: text('secret').notNull(), // TOTP secret (encrypted)
  backupCodes: text('backup_codes'), // JSON array of encrypted backup codes
  phoneNumber: text('phone_number'), // For SMS 2FA
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(false).notNull(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_two_factor_auth_tenant').on(table.tenantId),
]);

// Login Attempts (로그인 시도 추적 - Brute Force 방지)
export const loginAttempts = sqliteTable('login_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  identifier: text('identifier').notNull(), // email or username
  ipAddress: text('ip_address').notNull(),
  success: integer('success', { mode: 'boolean' }).notNull(),
  userAgent: text('user_agent'),
  failureReason: text('failure_reason'), // 'wrong_password', 'user_not_found', '2fa_failed', etc.
  attemptedAt: integer('attempted_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_login_attempts_tenant').on(table.tenantId),
]);

// Sessions (세션 관리 - 동시 로그인 제어)
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id').notNull(),
  userType: text('user_type', { enum: ['admin', 'pd', 'distributor'] }).notNull(),
  sessionToken: text('session_token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceInfo: text('device_info'), // JSON: browser, OS, device type
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  revokedAt: integer('revoked_at', { mode: 'timestamp' }),
  revokedReason: text('revoked_reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_sessions_tenant').on(table.tenantId),
]);

// Password History (비밀번호 재사용 방지)
export const passwordHistory = sqliteTable('password_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  userId: text('user_id').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_password_history_tenant').on(table.tenantId),
]);

// Epic 21: Security Types
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type NewSecurityEvent = typeof securityEvents.$inferInsert;

export type DataDeletionRequest = typeof dataDeletionRequests.$inferSelect;
export type NewDataDeletionRequest = typeof dataDeletionRequests.$inferInsert;

export type IpAccessControl = typeof ipAccessControl.$inferSelect;
export type NewIpAccessControl = typeof ipAccessControl.$inferInsert;

export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type NewTwoFactorAuth = typeof twoFactorAuth.$inferInsert;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type NewLoginAttempt = typeof loginAttempts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type PasswordHistory = typeof passwordHistory.$inferSelect;
export type NewPasswordHistory = typeof passwordHistory.$inferInsert;
