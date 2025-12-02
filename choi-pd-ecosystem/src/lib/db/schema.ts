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
