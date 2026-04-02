// 칸반: 프로젝트, 컬럼, 태스크, 알림

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

export const kanbanProjects = sqliteTable('kanban_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  title: text('title').notNull(),
  description: text('description'),
  color: text('color').default('#3b82f6'), // 프로젝트 색상 (tailwind color)
  icon: text('icon').default('folder'), // lucide 아이콘 이름
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_kanban_projects_tenant').on(table.tenantId),
]);

// Kanban Columns (칸반 컬럼/상태)
export const kanbanColumns = sqliteTable('kanban_columns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  projectId: integer('project_id').notNull().references(() => kanbanProjects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // 예: "To Do", "In Progress", "Done"
  color: text('color').default('#6b7280'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_kanban_columns_tenant').on(table.tenantId),
]);

// Kanban Tasks (칸반 태스크/카드)
export const kanbanTasks = sqliteTable('kanban_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_kanban_tasks_tenant').on(table.tenantId),
]);

// Notifications (인앱 알림)
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_notifications_tenant').on(table.tenantId),
]);

// TypeScript Types
export type KanbanProject = typeof kanbanProjects.$inferSelect;
export type NewKanbanProject = typeof kanbanProjects.$inferInsert;

export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type NewKanbanColumn = typeof kanbanColumns.$inferInsert;

export type KanbanTask = typeof kanbanTasks.$inferSelect;
export type NewKanbanTask = typeof kanbanTasks.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
