// 챗봇: 대화, 메시지, 메모리, 업로드

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

import { members } from './member';

// ============================================================
// 챗봇 & 회원 메모리 시스템
// ============================================================

// Chat Conversations Table (채팅 대화)
export const chatConversations = sqliteTable('chat_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id),
  title: text('title'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_chat_conversations_tenant').on(table.tenantId),
]);

// Chat Messages Table (채팅 메시지)
export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  conversationId: integer('conversation_id').notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  imageUrls: text('image_urls'), // JSON array
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_chat_messages_tenant').on(table.tenantId),
]);

// Member Memories Table (회원 기억/메모)
export const memberMemories = sqliteTable('member_memories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  type: text('type').default('activity'), // 'activity' | 'note' | 'preference'
  date: text('date'), // YYYY-MM-DD format
  location: text('location'),
  category: text('category').default('other'), // 'education' | 'media' | 'meeting' | 'event' | 'other'
  summary: text('summary').notNull(),
  detail: text('detail'),
  imageUrls: text('image_urls'), // JSON array
  sourceMessageId: integer('source_message_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_member_memories_tenant').on(table.tenantId),
]);

// Member Uploads Table (회원 파일 업로드)
export const memberUploads = sqliteTable('member_uploads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  storagePath: text('storage_path').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_member_uploads_tenant').on(table.tenantId),
]);

// Export types for Chat & Memory tables
export type ChatConversation = typeof chatConversations.$inferSelect;
export type NewChatConversation = typeof chatConversations.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type MemberMemory = typeof memberMemories.$inferSelect;
export type NewMemberMemory = typeof memberMemories.$inferInsert;

export type MemberUpload = typeof memberUploads.$inferSelect;
export type NewMemberUpload = typeof memberUploads.$inferInsert;
