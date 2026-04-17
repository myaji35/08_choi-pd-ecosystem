// 유통: 수요자, 활동로그, 리소스, 구독플랜, 결제, 영수증

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// Distributors/Resellers Table (분양 수요자 관리)
export const distributors = sqliteTable('distributors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  slug: text('slug'), // impd.me/<slug> URL 식별자 — tenant당 unique
  name: text('name').notNull(), // 수요자 이름/기업명
  email: text('email').notNull(), // unique 제약 → (tenant_id, email) 복합 유니크로 변경
  phone: text('phone'),
  businessType: text('business_type', { enum: ['individual', 'company', 'organization'] }).notNull(),
  region: text('region'), // 지역
  status: text('status', { enum: ['pending', 'approved', 'active', 'suspended', 'rejected'] }).default('pending').notNull(),
  subscriptionPlan: text('subscription_plan', { enum: ['basic', 'premium', 'enterprise'] }),
  subscriptionStartDate: integer('subscription_start_date', { mode: 'timestamp' }),
  subscriptionEndDate: integer('subscription_end_date', { mode: 'timestamp' }),
  contractDocument: text('contract_document'), // 계약서 파일 경로
  identityMd: text('identity_md'), // 회원 아이덴티티(.md) 본문 — 브랜드/톤/아젠다 정의
  identityFilename: text('identity_filename'), // 업로드된 파일명
  identityUpdatedAt: integer('identity_updated_at', { mode: 'timestamp' }),
  identityJson: text('identity_json'), // 파싱 캐시 (JSON) — agenda/tone/keywords 등
  identityParsedAt: integer('identity_parsed_at', { mode: 'timestamp' }),
  notes: text('notes'), // 관리자 메모
  totalRevenue: integer('total_revenue').default(0), // 총 매출액 (원)
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  uniqueIndex('idx_distributors_tenant_email').on(table.tenantId, table.email),
  uniqueIndex('idx_distributors_slug').on(table.tenantId, table.slug),
  index('idx_distributors_tenant').on(table.tenantId),
]);

// Distributor Activity Log (분양자 활동 로그)
export const distributorActivityLog = sqliteTable('distributor_activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  distributorId: integer('distributor_id').notNull().references(() => distributors.id, { onDelete: 'cascade' }),
  activityType: text('activity_type', { enum: ['login', 'content_access', 'download', 'payment', 'support_request'] }).notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'), // JSON 형태로 추가 정보 저장
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_distributor_activity_log_tenant').on(table.tenantId),
]);

// Distributor Resources (분양자용 리소스)
export const distributorResources = sqliteTable('distributor_resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_distributor_resources_tenant').on(table.tenantId),
]);

// Subscription Plans (구독 플랜 정의)
export const subscriptionPlans = sqliteTable('subscription_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_subscription_plans_tenant').on(table.tenantId),
]);

// Payments (결제 내역)
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_payments_tenant').on(table.tenantId),
]);

// Invoices (영수증)
export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_invoices_tenant').on(table.tenantId),
]);

// TypeScript Types
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
