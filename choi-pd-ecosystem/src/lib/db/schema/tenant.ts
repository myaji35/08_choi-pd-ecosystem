// SaaS 멀티테넌시: 테넌트, 멤버, 구독, 인보이스

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tenants = sqliteTable('tenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkUserId: text('clerk_user_id').notNull(),           // 소유자 Clerk ID
  name: text('name').notNull(),                            // 테넌트 이름
  slug: text('slug').notNull().unique(),                   // 서브도메인 slug
  profession: text('profession', {
    enum: ['pd', 'shopowner', 'realtor', 'educator', 'insurance', 'freelancer']
  }).notNull().default('freelancer'),
  businessType: text('business_type', {
    enum: ['individual', 'company', 'organization']
  }).notNull().default('individual'),
  region: text('region'),
  status: text('status', {
    enum: ['active', 'suspended', 'deleted', 'pending']
  }).notNull().default('active'),
  plan: text('plan', {
    enum: ['free', 'pro', 'enterprise']
  }).notNull().default('free'),
  // 브랜딩
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: text('primary_color').default('#3b82f6'),
  secondaryColor: text('secondary_color').default('#8b5cf6'),
  fontFamily: text('font_family').default('Inter'),
  customDomain: text('custom_domain'),                     // Pro+ 전용
  // 스토리지 제한
  maxStorage: integer('max_storage').default(524288000),    // 500MB (Free)
  usedStorage: integer('used_storage').default(0),
  // Stripe 연동
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  // 메타
  settings: text('settings'),                              // JSON: 추가 설정
  metadata: text('metadata'),                              // JSON: 추가 데이터
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // 소프트 딜리트
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_tenants_clerk_user').on(table.clerkUserId),
  index('idx_tenants_status').on(table.status),
  index('idx_tenants_plan').on(table.plan),
  index('idx_tenants_custom_domain').on(table.customDomain),
]);

// Tenant Members Table (테넌트 멤버)
export const tenantMembers = sqliteTable('tenant_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  clerkUserId: text('clerk_user_id').notNull(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role', {
    enum: ['owner', 'admin', 'member', 'guest']
  }).notNull().default('member'),
  status: text('status', {
    enum: ['invited', 'active', 'suspended', 'removed']
  }).notNull().default('invited'),
  invitedBy: text('invited_by'),                           // Clerk user ID
  invitedAt: integer('invited_at', { mode: 'timestamp' }),
  joinedAt: integer('joined_at', { mode: 'timestamp' }),
  lastActiveAt: integer('last_active_at', { mode: 'timestamp' }),
  permissions: text('permissions'),                         // JSON: 세분화된 권한
  metadata: text('metadata'),                               // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  uniqueIndex('idx_tenant_members_unique').on(table.tenantId, table.clerkUserId),
  index('idx_tenant_members_tenant').on(table.tenantId),
  index('idx_tenant_members_user').on(table.clerkUserId),
  index('idx_tenant_members_email').on(table.email),
]);

// SaaS Subscriptions Table (SaaS 구독 — Stripe 연동)
export const saasSubscriptions = sqliteTable('saas_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  plan: text('plan', {
    enum: ['free', 'pro', 'enterprise']
  }).notNull(),
  billingPeriod: text('billing_period', {
    enum: ['monthly', 'yearly']
  }).notNull().default('monthly'),
  status: text('status', {
    enum: ['active', 'past_due', 'canceled', 'trialing', 'unpaid']
  }).notNull().default('active'),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  canceledAt: integer('canceled_at', { mode: 'timestamp' }),
  trialStart: integer('trial_start', { mode: 'timestamp' }),
  trialEnd: integer('trial_end', { mode: 'timestamp' }),
  metadata: text('metadata'),                               // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  uniqueIndex('idx_saas_sub_tenant').on(table.tenantId),
  index('idx_saas_sub_stripe').on(table.stripeSubscriptionId),
  index('idx_saas_sub_status').on(table.status),
]);

// SaaS Invoices Table (SaaS 인보이스 — Stripe 연동)
export const saasInvoices = sqliteTable('saas_invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  subscriptionId: integer('subscription_id').references(() => saasSubscriptions.id),
  stripeInvoiceId: text('stripe_invoice_id').unique(),
  amount: integer('amount').notNull(),                      // 센트 단위
  currency: text('currency').default('krw').notNull(),
  status: text('status', {
    enum: ['draft', 'open', 'paid', 'void', 'uncollectible']
  }).notNull(),
  invoicePdfUrl: text('invoice_pdf_url'),
  hostedInvoiceUrl: text('hosted_invoice_url'),
  periodStart: integer('period_start', { mode: 'timestamp' }),
  periodEnd: integer('period_end', { mode: 'timestamp' }),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_saas_invoices_tenant').on(table.tenantId),
  index('idx_saas_invoices_status').on(table.status),
]);

// ============================================================
// TypeScript Types — SaaS 멀티테넌시
// ============================================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type TenantMember = typeof tenantMembers.$inferSelect;
export type NewTenantMember = typeof tenantMembers.$inferInsert;

export type SaasSubscription = typeof saasSubscriptions.$inferSelect;
export type NewSaasSubscription = typeof saasSubscriptions.$inferInsert;

export type SaasInvoice = typeof saasInvoices.$inferSelect;
export type NewSaasInvoice = typeof saasInvoices.$inferInsert;
