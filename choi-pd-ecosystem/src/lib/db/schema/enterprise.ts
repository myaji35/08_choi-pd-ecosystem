// 엔터프라이즈: 조직, 브랜딩, 팀, SSO, 지원티켓, SLA, 대량임포트

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// ============================================
// Epic 25: 엔터프라이즈 기능 및 화이트라벨
// ============================================

// Organizations (조직/기업)
export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  name: text('name').notNull(),
  displayName: text('display_name').notNull(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  type: text('type', { enum: ['enterprise', 'business', 'education', 'nonprofit'] }).notNull(),
  industry: text('industry'), // 산업 분야
  size: text('size', { enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] }),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  billingEmail: text('billing_email'),
  address: text('address'), // JSON: street, city, state, zip, country
  website: text('website'),
  taxId: text('tax_id'), // 사업자 등록번호
  subscriptionPlan: text('subscription_plan', { enum: ['basic', 'premium', 'enterprise', 'custom'] }).default('enterprise').notNull(),
  subscriptionStatus: text('subscription_status', { enum: ['trial', 'active', 'suspended', 'cancelled'] }).default('trial').notNull(),
  subscriptionStartDate: integer('subscription_start_date', { mode: 'timestamp' }),
  subscriptionEndDate: integer('subscription_end_date', { mode: 'timestamp' }),
  trialEndsAt: integer('trial_ends_at', { mode: 'timestamp' }),
  maxUsers: integer('max_users').default(10), // 최대 사용자 수
  maxStorage: integer('max_storage').default(10737418240), // 10GB in bytes
  usedStorage: integer('used_storage').default(0),
  settings: text('settings'), // JSON: custom settings
  metadata: text('metadata'), // JSON: additional data
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_organizations_tenant').on(table.tenantId),
]);

// Organization Branding (화이트라벨 브랜딩)
export const organizationBranding = sqliteTable('organization_branding', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  organizationId: integer('organization_id').notNull().unique().references(() => organizations.id, { onDelete: 'cascade' }),
  logoUrl: text('logo_url'), // 로고 이미지 URL
  faviconUrl: text('favicon_url'), // 파비콘 URL
  primaryColor: text('primary_color').default('#3b82f6'), // Tailwind blue-500
  secondaryColor: text('secondary_color').default('#8b5cf6'), // Tailwind violet-500
  accentColor: text('accent_color').default('#10b981'), // Tailwind green-500
  fontFamily: text('font_family').default('Inter'), // 폰트
  customCss: text('custom_css'), // 커스텀 CSS
  customDomain: text('custom_domain'), // 커스텀 도메인 (예: client.example.com)
  sslCertificateStatus: text('ssl_certificate_status', { enum: ['pending', 'active', 'expired', 'failed'] }),
  emailTemplateHeader: text('email_template_header'), // 이메일 헤더 HTML
  emailTemplateFooter: text('email_template_footer'), // 이메일 푸터 HTML
  footerText: text('footer_text'), // Footer 커스텀 텍스트
  loginPageMessage: text('login_page_message'), // 로그인 페이지 메시지
  dashboardWelcomeMessage: text('dashboard_welcome_message'), // 대시보드 환영 메시지
  metadata: text('metadata'), // JSON: 추가 브랜딩 설정
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_organization_branding_tenant').on(table.tenantId),
]);

// Teams (팀/부서)
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  parentTeamId: integer('parent_team_id').references((): AnySQLiteColumn => teams.id, { onDelete: 'set null' }), // 상위 팀 (계층 구조)
  teamLead: text('team_lead'), // 팀 리더 user ID
  color: text('color').default('#3b82f6'), // 팀 색상
  icon: text('icon').default('users'), // Lucide 아이콘
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_teams_tenant').on(table.tenantId),
]);

// Organization Members (조직 구성원)
export const organizationMembers = sqliteTable('organization_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(), // Clerk user ID
  userEmail: text('user_email').notNull(),
  userName: text('user_name'),
  role: text('role', { enum: ['owner', 'admin', 'manager', 'member', 'guest'] }).default('member').notNull(),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'set null' }), // 소속 팀
  jobTitle: text('job_title'), // 직책
  department: text('department'), // 부서
  permissions: text('permissions'), // JSON: 세분화된 권한
  invitedBy: text('invited_by'), // 초대한 사람 user ID
  invitedAt: integer('invited_at', { mode: 'timestamp' }),
  joinedAt: integer('joined_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['invited', 'active', 'suspended', 'removed'] }).default('invited').notNull(),
  lastActiveAt: integer('last_active_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_organization_members_tenant').on(table.tenantId),
]);

// SSO Configurations (Single Sign-On 설정)
export const ssoConfigurations = sqliteTable('sso_configurations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  organizationId: integer('organization_id').notNull().unique().references(() => organizations.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['saml', 'oauth', 'ldap', 'oidc'] }).notNull(),
  providerName: text('provider_name'), // Okta, Azure AD, Google, etc.
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(false).notNull(),

  // SAML settings
  samlEntityId: text('saml_entity_id'),
  samlSsoUrl: text('saml_sso_url'), // Identity Provider SSO URL
  samlX509Certificate: text('saml_x509_certificate'), // Public certificate
  samlSignRequests: integer('saml_sign_requests', { mode: 'boolean' }).default(false),

  // OAuth/OIDC settings
  oauthClientId: text('oauth_client_id'),
  oauthClientSecret: text('oauth_client_secret'), // Encrypted
  oauthAuthorizationUrl: text('oauth_authorization_url'),
  oauthTokenUrl: text('oauth_token_url'),
  oauthUserInfoUrl: text('oauth_user_info_url'),
  oauthScopes: text('oauth_scopes'), // JSON array

  // LDAP settings
  ldapServerUrl: text('ldap_server_url'),
  ldapBindDn: text('ldap_bind_dn'),
  ldapBindPassword: text('ldap_bind_password'), // Encrypted
  ldapBaseDn: text('ldap_base_dn'),
  ldapUserFilter: text('ldap_user_filter'),

  // Common settings
  attributeMapping: text('attribute_mapping'), // JSON: email, name, etc.
  defaultRole: text('default_role', { enum: ['owner', 'admin', 'manager', 'member', 'guest'] }).default('member'),
  autoProvision: integer('auto_provision', { mode: 'boolean' }).default(true), // 자동 계정 생성

  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_sso_configurations_tenant').on(table.tenantId),
]);

// Support Tickets (지원 티켓)
export const supportTickets = sqliteTable('support_tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').notNull(), // User ID
  createdByEmail: text('created_by_email').notNull(),
  createdByName: text('created_by_name'),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  category: text('category', { enum: ['technical', 'billing', 'feature_request', 'bug', 'other'] }).notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium').notNull(),
  status: text('status', { enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'] }).default('open').notNull(),
  assignedTo: text('assigned_to'), // Admin/Support user ID
  assignedAt: integer('assigned_at', { mode: 'timestamp' }),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
  resolution: text('resolution'), // 해결 내용
  attachments: text('attachments'), // JSON array of file URLs
  tags: text('tags'), // JSON array of tags
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_support_tickets_tenant').on(table.tenantId),
]);

// Support Ticket Comments (티켓 댓글)
export const supportTicketComments = sqliteTable('support_ticket_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  ticketId: integer('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(), // User ID
  authorEmail: text('author_email').notNull(),
  authorName: text('author_name'),
  authorType: text('author_type', { enum: ['customer', 'support', 'system'] }).notNull(),
  comment: text('comment').notNull(),
  isInternal: integer('is_internal', { mode: 'boolean' }).default(false), // 내부 메모 (고객에게 비공개)
  attachments: text('attachments'), // JSON array
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_support_ticket_comments_tenant').on(table.tenantId),
]);

// SLA Metrics (Service Level Agreement 메트릭)
export const slaMetrics = sqliteTable('sla_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  metricType: text('metric_type', { enum: ['uptime', 'response_time', 'resolution_time', 'availability'] }).notNull(),
  targetValue: integer('target_value').notNull(), // 목표 값 (예: 99.9% = 999)
  actualValue: integer('actual_value').notNull(), // 실제 값
  unit: text('unit', { enum: ['percentage', 'seconds', 'minutes', 'hours'] }).notNull(),
  period: text('period', { enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] }).notNull(),
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),
  isViolation: integer('is_violation', { mode: 'boolean' }).default(false).notNull(),
  violationDetails: text('violation_details'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_sla_metrics_tenant').on(table.tenantId),
]);

// User Bulk Import Logs (대량 사용자 임포트 로그)
export const userBulkImportLogs = sqliteTable('user_bulk_import_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  importedBy: text('imported_by').notNull(), // Admin user ID
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url'), // S3/GCS URL
  totalRows: integer('total_rows').notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).default('pending').notNull(),
  errors: text('errors'), // JSON array of error messages
  results: text('results'), // JSON: detailed results
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_user_bulk_import_logs_tenant').on(table.tenantId),
]);

// Epic 25: Enterprise Types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type OrganizationBranding = typeof organizationBranding.$inferSelect;
export type NewOrganizationBranding = typeof organizationBranding.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;

export type SsoConfiguration = typeof ssoConfigurations.$inferSelect;
export type NewSsoConfiguration = typeof ssoConfigurations.$inferInsert;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;

export type SupportTicketComment = typeof supportTicketComments.$inferSelect;
export type NewSupportTicketComment = typeof supportTicketComments.$inferInsert;

export type SlaMetric = typeof slaMetrics.$inferSelect;
export type NewSlaMetric = typeof slaMetrics.$inferInsert;

export type UserBulkImportLog = typeof userBulkImportLogs.$inferSelect;
export type NewUserBulkImportLog = typeof userBulkImportLogs.$inferInsert;
