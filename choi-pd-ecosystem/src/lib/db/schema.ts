import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Courses Table (교육 과정)
export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: ['online', 'offline', 'b2b'] }).notNull(),
  price: integer('price'), // nullable (무료 과정 가능)
  thumbnailUrl: text('thumbnail_url'),
  externalLink: text('external_link'), // VOD 플랫폼 링크
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  published: integer('published', { mode: 'boolean' }).default(true)
});

// Posts Table (공지사항/소식)
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category', { enum: ['notice', 'review', 'media'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  published: integer('published', { mode: 'boolean' }).default(true)
});

// Works Table (갤러리 & 언론 보도)
export const works = sqliteTable('works', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  category: text('category', { enum: ['gallery', 'press'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Inquiries Table (문의 사항)
export const inquiries = sqliteTable('inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  type: text('type', { enum: ['b2b', 'contact'] }).notNull(),
  status: text('status', { enum: ['pending', 'contacted', 'closed'] }).default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Leads Table (뉴스레터 구독)
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Settings Table (사이트 설정)
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Admin Users Table (관리자 계정)
export const adminUsers = sqliteTable('admin_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // hashed password
  role: text('role', { enum: ['admin', 'superadmin'] }).notNull().default('admin'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// SNS Accounts Table (SNS 계정 관리)
export const snsAccounts = sqliteTable('sns_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  platform: text('platform', { enum: ['facebook', 'instagram', 'twitter', 'linkedin'] }).notNull(),
  accountName: text('account_name').notNull(),
  accountId: text('account_id'), // 플랫폼별 계정 ID
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON 형태로 추가 정보 저장
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// SNS Scheduled Posts Table (예약된 SNS 포스팅)
export const snsScheduledPosts = sqliteTable('sns_scheduled_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contentType: text('content_type', { enum: ['posts', 'courses', 'works'] }).notNull(),
  contentId: integer('content_id').notNull(),
  platform: text('platform', { enum: ['facebook', 'instagram', 'twitter', 'linkedin'] }).notNull(),
  accountId: integer('account_id').notNull().references(() => snsAccounts.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  imageUrl: text('image_url'), // 포스팅에 첨부할 이미지
  link: text('link'), // 포스팅에 첨부할 링크
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'publishing', 'published', 'failed', 'cancelled'] }).default('pending'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  externalPostId: text('external_post_id'), // SNS 플랫폼에서 반환된 포스트 ID
  error: text('error'), // 에러 메시지 (실패 시)
  retryCount: integer('retry_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// SNS Post History Table (SNS 포스팅 이력)
export const snsPostHistory = sqliteTable('sns_post_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scheduledPostId: integer('scheduled_post_id').notNull().references(() => snsScheduledPosts.id, { onDelete: 'cascade' }),
  platform: text('platform', { enum: ['facebook', 'instagram', 'twitter', 'linkedin'] }).notNull(),
  externalPostId: text('external_post_id'),
  action: text('action', { enum: ['created', 'updated', 'deleted', 'failed'] }).notNull(),
  status: text('status').notNull(),
  response: text('response'), // API 응답 (JSON 형태)
  error: text('error'),
  metadata: text('metadata'), // 추가 정보 (JSON 형태)
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Hero Images Table (히어로 섹션 이미지)
export const heroImages = sqliteTable('hero_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text').notNull(),
  fileSize: integer('file_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadStatus: text('upload_status', { enum: ['pending', 'completed', 'failed'] }).default('pending').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false).notNull()
});

// Distributors/Resellers Table (분양 수요자 관리)
export const distributors = sqliteTable('distributors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // 수요자 이름/기업명
  email: text('email').notNull().unique(),
  phone: text('phone'),
  businessType: text('business_type', { enum: ['individual', 'company', 'organization'] }).notNull(),
  region: text('region'), // 지역
  status: text('status', { enum: ['pending', 'approved', 'active', 'suspended', 'rejected'] }).default('pending').notNull(),
  subscriptionPlan: text('subscription_plan', { enum: ['basic', 'premium', 'enterprise'] }),
  subscriptionStartDate: integer('subscription_start_date', { mode: 'timestamp' }),
  subscriptionEndDate: integer('subscription_end_date', { mode: 'timestamp' }),
  contractDocument: text('contract_document'), // 계약서 파일 경로
  notes: text('notes'), // 관리자 메모
  totalRevenue: integer('total_revenue').default(0), // 총 매출액 (원)
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Distributor Activity Log (분양자 활동 로그)
export const distributorActivityLog = sqliteTable('distributor_activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  distributorId: integer('distributor_id').notNull().references(() => distributors.id, { onDelete: 'cascade' }),
  activityType: text('activity_type', { enum: ['login', 'content_access', 'download', 'payment', 'support_request'] }).notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'), // JSON 형태로 추가 정보 저장
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Distributor Resources (분양자용 리소스)
export const distributorResources = sqliteTable('distributor_resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type', { enum: ['pdf', 'video', 'image', 'document', 'template'] }).notNull(),
  fileSize: integer('file_size'), // bytes
  category: text('category', { enum: ['marketing', 'training', 'contract', 'promotional', 'technical'] }).notNull(),
  requiredPlan: text('required_plan', { enum: ['basic', 'premium', 'enterprise', 'all'] }).default('all').notNull(),
  downloadCount: integer('download_count').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Subscription Plans (구독 플랜 정의)
export const subscriptionPlans = sqliteTable('subscription_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // Basic, Premium, Enterprise
  displayName: text('display_name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // 월 가격 (원)
  features: text('features'), // JSON 배열
  maxDistributors: integer('max_distributors'), // null = unlimited
  maxResources: integer('max_resources'), // null = unlimited
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Payments (결제 내역)
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  distributorId: integer('distributor_id').notNull().references(() => distributors.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => subscriptionPlans.id),
  amount: integer('amount').notNull(),
  currency: text('currency').default('KRW').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).default('pending').notNull(),
  paymentMethod: text('payment_method', { enum: ['card', 'bank_transfer', 'toss', 'stripe'] }),
  transactionId: text('transaction_id'), // 결제 게이트웨이 트랜잭션 ID
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Invoices (영수증)
export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  paymentId: integer('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  distributorId: integer('distributor_id').notNull().references(() => distributors.id),
  invoiceNumber: text('invoice_number').notNull().unique(),
  amount: integer('amount').notNull(),
  taxAmount: integer('tax_amount').default(0),
  totalAmount: integer('total_amount').notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }).default('draft').notNull(),
  pdfUrl: text('pdf_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Kanban Projects (칸반 프로젝트)
export const kanbanProjects = sqliteTable('kanban_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  color: text('color').default('#3b82f6'), // 프로젝트 색상 (tailwind color)
  icon: text('icon').default('folder'), // lucide 아이콘 이름
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Kanban Columns (칸반 컬럼/상태)
export const kanbanColumns = sqliteTable('kanban_columns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => kanbanProjects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // 예: "To Do", "In Progress", "Done"
  color: text('color').default('#6b7280'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Kanban Tasks (칸반 태스크/카드)
export const kanbanTasks = sqliteTable('kanban_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => kanbanProjects.id, { onDelete: 'cascade' }),
  columnId: integer('column_id').notNull().references(() => kanbanColumns.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  labels: text('labels'), // JSON array of label strings
  assignee: text('assignee'), // 담당자 이름 또는 이메일
  sortOrder: integer('sort_order').notNull().default(0),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Notifications (인앱 알림)
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'), // Admin or PD user ID (optional - can use Clerk ID in metadata)
  userType: text('user_type', { enum: ['admin', 'pd', 'distributor'] }).notNull(),
  type: text('type', { enum: ['info', 'success', 'warning', 'error'] }).default('info').notNull(),
  category: text('category', { enum: ['distributor', 'payment', 'inquiry', 'resource', 'system'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'), // Optional link to related page
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  metadata: text('metadata'), // JSON for additional data
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ============================================
// Epic 21: 고급 보안 및 컴플라이언스 테이블
// ============================================

// Audit Logs (감사 로그 - 모든 중요 작업 기록)
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Security Events (보안 이벤트 - 의심스러운 활동 추적)
export const securityEvents = sqliteTable('security_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Data Deletion Requests (GDPR 개인정보 삭제 요청)
export const dataDeletionRequests = sqliteTable('data_deletion_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// IP Whitelist/Blacklist (IP 접근 제어)
export const ipAccessControl = sqliteTable('ip_access_control', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ipAddress: text('ip_address').notNull().unique(),
  type: text('type', { enum: ['whitelist', 'blacklist'] }).notNull(),
  reason: text('reason').notNull(),
  appliesTo: text('applies_to', { enum: ['all', 'admin', 'distributor'] }).default('all').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }), // null = 영구
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdBy: text('created_by').notNull(), // Admin user ID
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Two-Factor Authentication (2FA 설정)
export const twoFactorAuth = sqliteTable('two_factor_auth', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Login Attempts (로그인 시도 추적 - Brute Force 방지)
export const loginAttempts = sqliteTable('login_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  identifier: text('identifier').notNull(), // email or username
  ipAddress: text('ip_address').notNull(),
  success: integer('success', { mode: 'boolean' }).notNull(),
  userAgent: text('user_agent'),
  failureReason: text('failure_reason'), // 'wrong_password', 'user_not_found', '2fa_failed', etc.
  attemptedAt: integer('attempted_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Sessions (세션 관리 - 동시 로그인 제어)
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Password History (비밀번호 재사용 방지)
export const passwordHistory = sqliteTable('password_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ============================================
// Epic 25: 엔터프라이즈 기능 및 화이트라벨
// ============================================

// Organizations (조직/기업)
export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Organization Branding (화이트라벨 브랜딩)
export const organizationBranding = sqliteTable('organization_branding', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Teams (팀/부서)
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  parentTeamId: integer('parent_team_id').references(() => teams.id, { onDelete: 'set null' }), // 상위 팀 (계층 구조)
  teamLead: text('team_lead'), // 팀 리더 user ID
  color: text('color').default('#3b82f6'), // 팀 색상
  icon: text('icon').default('users'), // Lucide 아이콘
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Organization Members (조직 구성원)
export const organizationMembers = sqliteTable('organization_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// SSO Configurations (Single Sign-On 설정)
export const ssoConfigurations = sqliteTable('sso_configurations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Support Tickets (지원 티켓)
export const supportTickets = sqliteTable('support_tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Support Ticket Comments (티켓 댓글)
export const supportTicketComments = sqliteTable('support_ticket_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticketId: integer('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(), // User ID
  authorEmail: text('author_email').notNull(),
  authorName: text('author_name'),
  authorType: text('author_type', { enum: ['customer', 'support', 'system'] }).notNull(),
  comment: text('comment').notNull(),
  isInternal: integer('is_internal', { mode: 'boolean' }).default(false), // 내부 메모 (고객에게 비공개)
  attachments: text('attachments'), // JSON array
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// SLA Metrics (Service Level Agreement 메트릭)
export const slaMetrics = sqliteTable('sla_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// User Bulk Import Logs (대량 사용자 임포트 로그)
export const userBulkImportLogs = sqliteTable('user_bulk_import_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// ============================================
// Epic 17: 고급 분석 및 BI 대시보드
// ============================================

// Analytics Events (분석 이벤트 추적)
export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id'), // null = 익명 사용자
  userType: text('user_type', { enum: ['admin', 'pd', 'distributor', 'lead', 'anonymous'] }),
  sessionId: text('session_id'), // 세션 ID
  eventName: text('event_name').notNull(), // 이벤트 이름 (page_view, button_click, etc.)
  eventCategory: text('event_category').notNull(), // 카테고리 (engagement, conversion, etc.)
  eventAction: text('event_action'), // 액션 (click, submit, download, etc.)
  eventLabel: text('event_label'), // 레이블 (버튼명, 페이지명 등)
  eventValue: integer('event_value'), // 수치 값 (매출액, 시간 등)
  pagePath: text('page_path'), // 페이지 경로
  pageTitle: text('page_title'), // 페이지 제목
  referrer: text('referrer'), // 리퍼러
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceType: text('device_type', { enum: ['desktop', 'mobile', 'tablet'] }),
  browser: text('browser'),
  os: text('os'),
  country: text('country'), // GeoIP
  city: text('city'), // GeoIP
  metadata: text('metadata'), // JSON: 추가 데이터
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Cohort Analysis (코호트 분석)
export const cohorts = sqliteTable('cohorts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // 코호트 이름
  description: text('description'),
  cohortType: text('cohort_type', { enum: ['acquisition', 'behavior', 'demographic', 'custom'] }).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  criteria: text('criteria').notNull(), // JSON: 코호트 조건
  userCount: integer('user_count').default(0).notNull(),
  metrics: text('metrics'), // JSON: 코호트 메트릭 (retention, revenue, etc.)
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Cohort Users (코호트 사용자 매핑)
export const cohortUsers = sqliteTable('cohort_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userEmail: text('user_email'),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  metadata: text('metadata') // JSON
});

// A/B Tests (A/B 테스트)
export const abTests = sqliteTable('ab_tests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  hypothesis: text('hypothesis'), // 가설
  status: text('status', { enum: ['draft', 'running', 'paused', 'completed', 'archived'] }).default('draft').notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  targetMetric: text('target_metric').notNull(), // 목표 지표 (conversion_rate, revenue, etc.)
  variants: text('variants').notNull(), // JSON: 변형 목록 (control, variant_a, variant_b)
  trafficAllocation: text('traffic_allocation').notNull(), // JSON: 트래픽 분배 (50/50, 33/33/34, etc.)
  totalParticipants: integer('total_participants').default(0),
  confidenceLevel: integer('confidence_level').default(95), // 신뢰 수준 (%)
  results: text('results'), // JSON: 테스트 결과
  winner: text('winner'), // 승자 변형
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// A/B Test Participants (A/B 테스트 참가자)
export const abTestParticipants = sqliteTable('ab_test_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  testId: integer('test_id').notNull().references(() => abTests.id, { onDelete: 'cascade' }),
  userId: text('user_id'), // null = 익명
  sessionId: text('session_id').notNull(),
  variant: text('variant').notNull(), // control, variant_a, variant_b, etc.
  converted: integer('converted', { mode: 'boolean' }).default(false), // 전환 여부
  conversionValue: integer('conversion_value'), // 전환 가치 (매출액 등)
  assignedAt: integer('assigned_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  convertedAt: integer('converted_at', { mode: 'timestamp' }),
  metadata: text('metadata') // JSON
});

// Custom Reports (커스텀 리포트)
export const customReports = sqliteTable('custom_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  reportType: text('report_type', { enum: ['table', 'chart', 'dashboard', 'export'] }).notNull(),
  dataSource: text('data_source').notNull(), // 데이터 소스 (distributors, payments, events, etc.)
  columns: text('columns').notNull(), // JSON: 컬럼 목록
  filters: text('filters'), // JSON: 필터 조건
  groupBy: text('group_by'), // JSON: 그룹화 컬럼
  orderBy: text('order_by'), // JSON: 정렬 조건
  chartType: text('chart_type', { enum: ['line', 'bar', 'pie', 'area', 'scatter', 'heatmap'] }), // 차트 타입
  chartConfig: text('chart_config'), // JSON: 차트 설정
  schedule: text('schedule'), // JSON: 자동 생성 스케줄 (daily, weekly, monthly)
  recipients: text('recipients'), // JSON: 리포트 수신자 이메일
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Funnel Analysis (퍼널 분석)
export const funnels = sqliteTable('funnels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  steps: text('steps').notNull(), // JSON: 퍼널 단계 (page_view → signup → payment)
  conversionWindow: integer('conversion_window').default(7), // 전환 윈도우 (일)
  totalUsers: integer('total_users').default(0),
  conversionData: text('conversion_data'), // JSON: 각 단계별 전환율
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// RFM Analysis (Recency, Frequency, Monetary 분석)
export const rfmSegments = sqliteTable('rfm_segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  userType: text('user_type', { enum: ['distributor', 'lead'] }).notNull(),
  recencyScore: integer('recency_score').notNull(), // 1-5 (최근 활동)
  frequencyScore: integer('frequency_score').notNull(), // 1-5 (활동 빈도)
  monetaryScore: integer('monetary_score').notNull(), // 1-5 (매출 기여)
  rfmSegment: text('rfm_segment').notNull(), // Champions, Loyal, At Risk, etc.
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }),
  totalTransactions: integer('total_transactions').default(0),
  totalRevenue: integer('total_revenue').default(0),
  calculatedAt: integer('calculated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// TypeScript Types
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Work = typeof works.$inferSelect;
export type NewWork = typeof works.$inferInsert;

export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type SnsAccount = typeof snsAccounts.$inferSelect;
export type NewSnsAccount = typeof snsAccounts.$inferInsert;

export type SnsScheduledPost = typeof snsScheduledPosts.$inferSelect;
export type NewSnsScheduledPost = typeof snsScheduledPosts.$inferInsert;

export type SnsPostHistory = typeof snsPostHistory.$inferSelect;
export type NewSnsPostHistory = typeof snsPostHistory.$inferInsert;

export type HeroImage = typeof heroImages.$inferSelect;
export type NewHeroImage = typeof heroImages.$inferInsert;

export type Distributor = typeof distributors.$inferSelect;
export type NewDistributor = typeof distributors.$inferInsert;

export type DistributorActivityLog = typeof distributorActivityLog.$inferSelect;
export type NewDistributorActivityLog = typeof distributorActivityLog.$inferInsert;

export type DistributorResource = typeof distributorResources.$inferSelect;
export type NewDistributorResource = typeof distributorResources.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type KanbanProject = typeof kanbanProjects.$inferSelect;
export type NewKanbanProject = typeof kanbanProjects.$inferInsert;

export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type NewKanbanColumn = typeof kanbanColumns.$inferInsert;

export type KanbanTask = typeof kanbanTasks.$inferSelect;
export type NewKanbanTask = typeof kanbanTasks.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

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

// Epic 17: Analytics Types
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type Cohort = typeof cohorts.$inferSelect;
export type NewCohort = typeof cohorts.$inferInsert;

export type CohortUser = typeof cohortUsers.$inferSelect;
export type NewCohortUser = typeof cohortUsers.$inferInsert;

export type AbTest = typeof abTests.$inferSelect;
export type NewAbTest = typeof abTests.$inferInsert;

export type AbTestParticipant = typeof abTestParticipants.$inferSelect;
export type NewAbTestParticipant = typeof abTestParticipants.$inferInsert;

export type CustomReport = typeof customReports.$inferSelect;
export type NewCustomReport = typeof customReports.$inferInsert;

export type Funnel = typeof funnels.$inferSelect;
export type NewFunnel = typeof funnels.$inferInsert;

export type RfmSegment = typeof rfmSegments.$inferSelect;
export type NewRfmSegment = typeof rfmSegments.$inferInsert;

// ============================================================
// Epic 16: AI-Based Content Recommendation & Automation
// ============================================================

// AI Recommendations Table (AI 추천 결과)
export const aiRecommendations = sqliteTable('ai_recommendations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // 분양자 또는 사용자 ID
  userType: text('user_type', { enum: ['distributor', 'pd', 'customer'] }).notNull(),
  recommendationType: text('recommendation_type', { enum: ['resource', 'course', 'post', 'distributor'] }).notNull(),
  targetId: integer('target_id').notNull(), // 추천 대상 리소스/과정/포스트 ID
  score: integer('score').notNull(), // 추천 점수 (0-100)
  reason: text('reason'), // 추천 이유 (JSON: ["활동 패턴 일치", "유사 사용자 선호"])
  metadata: text('metadata'), // JSON: { "embedding_similarity": 0.85, "activity_score": 92 }
  clicked: integer('clicked', { mode: 'boolean' }).default(false),
  clickedAt: integer('clicked_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Content Embeddings Table (벡터 임베딩 저장)
export const contentEmbeddings = sqliteTable('content_embeddings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contentType: text('content_type', { enum: ['resource', 'course', 'post', 'work'] }).notNull(),
  contentId: integer('content_id').notNull(),
  embeddingModel: text('embedding_model').notNull(), // "text-embedding-ada-002", "all-MiniLM-L6-v2"
  embedding: text('embedding').notNull(), // JSON array of floats (vector)
  textContent: text('text_content').notNull(), // 원본 텍스트 (검색용)
  metadata: text('metadata'), // JSON: { "title": "...", "category": "..." }
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Chatbot Conversations Table (챗봇 대화 이력)
export const chatbotConversations = sqliteTable('chatbot_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(), // 세션별 대화 그룹
  userId: text('user_id'), // 로그인 사용자 (null = 비로그인)
  userType: text('user_type', { enum: ['distributor', 'pd', 'customer', 'anonymous'] }).notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  message: text('message').notNull(),
  intent: text('intent'), // "faq", "resource_search", "course_inquiry", "general"
  metadata: text('metadata'), // JSON: { "confidence": 0.95, "matched_faq_id": 123 }
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// AI Generated Content Table (AI 생성 콘텐츠)
export const aiGeneratedContent = sqliteTable('ai_generated_content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contentType: text('content_type', { enum: ['sns_post', 'email', 'description', 'summary', 'tag'] }).notNull(),
  prompt: text('prompt').notNull(), // 사용자가 입력한 프롬프트
  generatedText: text('generated_text').notNull(), // AI가 생성한 텍스트
  model: text('model').notNull(), // "gpt-4", "claude-3-sonnet", "gpt-3.5-turbo"
  temperature: integer('temperature'), // 0-100 (실제 0.0-1.0을 100배)
  maxTokens: integer('max_tokens'),
  userId: text('user_id').notNull(),
  userType: text('user_type', { enum: ['distributor', 'pd', 'admin'] }).notNull(),
  status: text('status', { enum: ['draft', 'approved', 'rejected', 'published'] }).default('draft').notNull(),
  usedInContentId: integer('used_in_content_id'), // 실제 게시물/이메일 ID (사용된 경우)
  metadata: text('metadata'), // JSON: { "platform": "instagram", "hashtags": [...] }
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Content Quality Scores Table (콘텐츠 품질 점수)
export const contentQualityScores = sqliteTable('content_quality_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contentType: text('content_type', { enum: ['resource', 'course', 'post', 'work'] }).notNull(),
  contentId: integer('content_id').notNull(),
  overallScore: integer('overall_score').notNull(), // 0-100
  readabilityScore: integer('readability_score'), // 0-100 (가독성)
  seoScore: integer('seo_score'), // 0-100 (SEO 최적화)
  engagementScore: integer('engagement_score'), // 0-100 (참여도 예측)
  sentimentScore: integer('sentiment_score'), // -100 to 100 (감성 분석)
  keywordDensity: text('keyword_density'), // JSON: { "스마트폰": 0.05, "창업": 0.03 }
  suggestions: text('suggestions'), // JSON array: ["제목에 숫자 추가", "메타 설명 개선"]
  analyzedBy: text('analyzed_by').notNull(), // "gpt-4", "claude-3-sonnet"
  analyzedAt: integer('analyzed_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Image Auto-Tagging Table (이미지 자동 태깅)
export const imageAutoTags = sqliteTable('image_auto_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imageUrl: text('image_url').notNull(),
  contentType: text('content_type', { enum: ['work', 'resource', 'hero_image', 'profile'] }).notNull(),
  contentId: integer('content_id').notNull(),
  tags: text('tags').notNull(), // JSON array: ["smartphone", "education", "office"]
  categories: text('categories').notNull(), // JSON array: ["technology", "business"]
  objects: text('objects'), // JSON: [{ "object": "laptop", "confidence": 0.95 }]
  colors: text('colors'), // JSON: { "dominant": "#3B82F6", "palette": [...] }
  ocrText: text('ocr_text'), // 이미지 내 텍스트 추출
  adultContent: integer('adult_content', { mode: 'boolean' }).default(false),
  confidence: integer('confidence').notNull(), // 0-100
  model: text('model').notNull(), // "gpt-4-vision", "claude-3-opus"
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// FAQ Knowledge Base (FAQ 지식 베이스)
export const faqKnowledgeBase = sqliteTable('faq_knowledge_base', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category', { enum: ['general', 'distributor', 'payment', 'resource', 'technical'] }).notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  keywords: text('keywords').notNull(), // JSON array: ["결제", "환불", "구독"]
  matchCount: integer('match_count').default(0).notNull(), // 매칭된 횟수
  helpfulCount: integer('helpful_count').default(0).notNull(), // 도움이 된 횟수
  notHelpfulCount: integer('not_helpful_count').default(0).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  priority: integer('priority').default(0).notNull(), // 우선순위 (높을수록 먼저 표시)
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// User Activity Patterns (사용자 활동 패턴 분석)
export const userActivityPatterns = sqliteTable('user_activity_patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  userType: text('user_type', { enum: ['distributor', 'pd', 'customer'] }).notNull(),
  preferredCategories: text('preferred_categories'), // JSON: ["marketing", "education"]
  activeHours: text('active_hours'), // JSON: [9, 10, 14, 15] (시간대)
  activeDaysOfWeek: text('active_days_of_week'), // JSON: [1, 2, 3, 4, 5] (월-금)
  averageSessionDuration: integer('average_session_duration'), // 초 단위
  totalSessions: integer('total_sessions').default(0).notNull(),
  lastActivityType: text('last_activity_type'), // "resource_download", "course_view"
  engagementScore: integer('engagement_score').default(0).notNull(), // 0-100
  churnRisk: text('churn_risk', { enum: ['low', 'medium', 'high'] }).default('low'),
  lastAnalyzedAt: integer('last_analyzed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Export types for Epic 16
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type NewAiRecommendation = typeof aiRecommendations.$inferInsert;

export type ContentEmbedding = typeof contentEmbeddings.$inferSelect;
export type NewContentEmbedding = typeof contentEmbeddings.$inferInsert;

export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
export type NewChatbotConversation = typeof chatbotConversations.$inferInsert;

export type AiGeneratedContent = typeof aiGeneratedContent.$inferSelect;
export type NewAiGeneratedContent = typeof aiGeneratedContent.$inferInsert;

export type ContentQualityScore = typeof contentQualityScores.$inferSelect;
export type NewContentQualityScore = typeof contentQualityScores.$inferInsert;

export type ImageAutoTag = typeof imageAutoTags.$inferSelect;
export type NewImageAutoTag = typeof imageAutoTags.$inferInsert;

export type FaqKnowledgeBase = typeof faqKnowledgeBase.$inferSelect;
export type NewFaqKnowledgeBase = typeof faqKnowledgeBase.$inferInsert;

export type UserActivityPattern = typeof userActivityPatterns.$inferSelect;
export type NewUserActivityPattern = typeof userActivityPatterns.$inferInsert;

// ============================================================
// Epic 22: Workflow Automation & Integrations
// ============================================================

// Workflows Table (워크플로우 정의)
export const workflows = sqliteTable('workflows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Workflow Executions Table (워크플로우 실행 이력)
export const workflowExecutions = sqliteTable('workflow_executions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Integrations Table (외부 서비스 연동)
export const integrations = sqliteTable('integrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Webhooks Table (웹훅 관리)
export const webhooks = sqliteTable('webhooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

// Webhook Logs Table (웹훅 실행 로그)
export const webhookLogs = sqliteTable('webhook_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  webhookId: integer('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: text('payload').notNull(), // JSON
  status: text('status', { enum: ['success', 'failed', 'retrying'] }).notNull(),
  responseCode: integer('response_code'),
  responseBody: text('response_body'),
  attemptNumber: integer('attempt_number').default(1).notNull(),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Automation Templates Table (자동화 템플릿)
export const automationTemplates = sqliteTable('automation_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
});

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

// ============================================================
// Epic 23: Video Streaming & Live Features
// ============================================================

// Videos Table (비디오 콘텐츠)
export const videos = sqliteTable('videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  originalFileName: text('original_file_name'),
  fileSize: integer('file_size'), // bytes
  duration: integer('duration').notNull(), // 초 단위
  thumbnailUrl: text('thumbnail_url'),
  status: text('status', { enum: ['uploading', 'processing', 'ready', 'failed', 'archived'] }).default('uploading').notNull(),
  processingProgress: integer('processing_progress').default(0), // 0-100
  // Streaming URLs
  hlsUrl: text('hls_url'), // HLS master playlist URL
  dashUrl: text('dash_url'), // DASH manifest URL
  mp4Url: text('mp4_url'), // Direct MP4 URL (fallback)
  // Resolutions
  resolutions: text('resolutions'), // JSON array: ["360p", "720p", "1080p"]
  // DRM
  drmEnabled: integer('drm_enabled', { mode: 'boolean' }).default(false),
  drmProvider: text('drm_provider'), // 'widevine', 'fairplay', 'playready'
  // Analytics
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  averageWatchTime: integer('average_watch_time'), // 초 단위
  completionRate: integer('completion_rate'), // 0-100
  // Access Control
  visibility: text('visibility', { enum: ['public', 'unlisted', 'private', 'members_only'] }).default('public').notNull(),
  allowDownload: integer('allow_download', { mode: 'boolean' }).default(false),
  // Metadata
  tags: text('tags'), // JSON array
  category: text('category'),
  language: text('language').default('ko'),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Video Chapters Table (비디오 챕터)
export const videoChapters = sqliteTable('video_chapters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  startTime: integer('start_time').notNull(), // 초 단위
  endTime: integer('end_time').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Video Subtitles Table (자막)
export const videoSubtitles = sqliteTable('video_subtitles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  language: text('language').notNull(), // 'ko', 'en', 'ja'
  label: text('label').notNull(), // '한국어', 'English', '日本語'
  format: text('format', { enum: ['srt', 'vtt', 'ass'] }).default('vtt').notNull(),
  fileUrl: text('file_url').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  isAutoGenerated: integer('is_auto_generated', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Watch History Table (시청 기록)
export const watchHistory = sqliteTable('watch_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  userType: text('user_type', { enum: ['distributor', 'pd', 'customer'] }).notNull(),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  watchedDuration: integer('watched_duration').notNull(), // 초 단위
  lastPosition: integer('last_position').notNull(), // 마지막 재생 위치 (초)
  completed: integer('completed', { mode: 'boolean' }).default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  device: text('device'), // 'desktop', 'mobile', 'tablet'
  quality: text('quality'), // '360p', '720p', '1080p'
  lastWatchedAt: integer('last_watched_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Live Streams Table (라이브 스트리밍)
export const liveStreams = sqliteTable('live_streams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  scheduledStartTime: integer('scheduled_start_time', { mode: 'timestamp' }).notNull(),
  scheduledEndTime: integer('scheduled_end_time', { mode: 'timestamp' }),
  actualStartTime: integer('actual_start_time', { mode: 'timestamp' }),
  actualEndTime: integer('actual_end_time', { mode: 'timestamp' }),
  status: text('status', { enum: ['scheduled', 'live', 'ended', 'cancelled'] }).default('scheduled').notNull(),
  // Streaming
  streamKey: text('stream_key').notNull(),
  rtmpUrl: text('rtmp_url').notNull(),
  hlsPlaybackUrl: text('hls_playback_url'),
  // Settings
  maxViewers: integer('max_viewers').default(1000),
  currentViewers: integer('current_viewers').default(0),
  peakViewers: integer('peak_viewers').default(0),
  totalViews: integer('total_views').default(0),
  enableChat: integer('enable_chat', { mode: 'boolean' }).default(true),
  enableRecording: integer('enable_recording', { mode: 'boolean' }).default(true),
  recordingUrl: text('recording_url'), // VOD URL after stream ends
  // Metadata
  thumbnailUrl: text('thumbnail_url'),
  tags: text('tags'), // JSON array
  category: text('category'),
  visibility: text('visibility', { enum: ['public', 'unlisted', 'private'] }).default('public').notNull(),
  hostedBy: text('hosted_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Video Comments Table (비디오 댓글)
export const videoComments = sqliteTable('video_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  comment: text('comment').notNull(),
  timestamp: integer('timestamp'), // 댓글이 달린 비디오 시간 (초)
  parentCommentId: integer('parent_comment_id').references(() => videoComments.id, { onDelete: 'cascade' }),
  likeCount: integer('like_count').default(0).notNull(),
  isEdited: integer('is_edited', { mode: 'boolean' }).default(false),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Video Playlists Table (재생목록)
export const videoPlaylists = sqliteTable('video_playlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  visibility: text('visibility', { enum: ['public', 'unlisted', 'private'] }).default('public').notNull(),
  createdBy: text('created_by').notNull(),
  videoCount: integer('video_count').default(0).notNull(),
  totalDuration: integer('total_duration').default(0), // 초 단위
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Playlist Videos Table (재생목록 비디오 매핑)
export const playlistVideos = sqliteTable('playlist_videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: integer('playlist_id').notNull().references(() => videoPlaylists.id, { onDelete: 'cascade' }),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  addedAt: integer('added_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Export types for Epic 23
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type VideoChapter = typeof videoChapters.$inferSelect;
export type NewVideoChapter = typeof videoChapters.$inferInsert;

export type VideoSubtitle = typeof videoSubtitles.$inferSelect;
export type NewVideoSubtitle = typeof videoSubtitles.$inferInsert;

export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;

export type LiveStream = typeof liveStreams.$inferSelect;
export type NewLiveStream = typeof liveStreams.$inferInsert;

export type VideoComment = typeof videoComments.$inferSelect;
export type NewVideoComment = typeof videoComments.$inferInsert;

export type VideoPlaylist = typeof videoPlaylists.$inferSelect;
export type NewVideoPlaylist = typeof videoPlaylists.$inferInsert;

export type PlaylistVideo = typeof playlistVideos.$inferSelect;
export type NewPlaylistVideo = typeof playlistVideos.$inferInsert;
