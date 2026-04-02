// AI: 추천, 임베딩, 챗봇, 생성콘텐츠, 품질점수, 태깅, FAQ, 활동패턴

import { sqliteTable, text, integer, uniqueIndex, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';

// Epic 16: AI-Based Content Recommendation & Automation
// ============================================================

// AI Recommendations Table (AI 추천 결과)
export const aiRecommendations = sqliteTable('ai_recommendations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_ai_recommendations_tenant').on(table.tenantId),
]);

// Content Embeddings Table (벡터 임베딩 저장)
export const contentEmbeddings = sqliteTable('content_embeddings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  contentType: text('content_type', { enum: ['resource', 'course', 'post', 'work'] }).notNull(),
  contentId: integer('content_id').notNull(),
  embeddingModel: text('embedding_model').notNull(), // "text-embedding-ada-002", "all-MiniLM-L6-v2"
  embedding: text('embedding').notNull(), // JSON array of floats (vector)
  textContent: text('text_content').notNull(), // 원본 텍스트 (검색용)
  metadata: text('metadata'), // JSON: { "title": "...", "category": "..." }
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_content_embeddings_tenant').on(table.tenantId),
]);

// Chatbot Conversations Table (챗봇 대화 이력)
export const chatbotConversations = sqliteTable('chatbot_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
  sessionId: text('session_id').notNull(), // 세션별 대화 그룹
  userId: text('user_id'), // 로그인 사용자 (null = 비로그인)
  userType: text('user_type', { enum: ['distributor', 'pd', 'customer', 'anonymous'] }).notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  message: text('message').notNull(),
  intent: text('intent'), // "faq", "resource_search", "course_inquiry", "general"
  metadata: text('metadata'), // JSON: { "confidence": 0.95, "matched_faq_id": 123 }
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => [
  index('idx_chatbot_conversations_tenant').on(table.tenantId),
]);

// AI Generated Content Table (AI 생성 콘텐츠)
export const aiGeneratedContent = sqliteTable('ai_generated_content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_ai_generated_content_tenant').on(table.tenantId),
]);

// Content Quality Scores Table (콘텐츠 품질 점수)
export const contentQualityScores = sqliteTable('content_quality_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_content_quality_scores_tenant').on(table.tenantId),
]);

// Image Auto-Tagging Table (이미지 자동 태깅)
export const imageAutoTags = sqliteTable('image_auto_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_image_auto_tags_tenant').on(table.tenantId),
]);

// FAQ Knowledge Base (FAQ 지식 베이스)
export const faqKnowledgeBase = sqliteTable('faq_knowledge_base', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_faq_knowledge_base_tenant').on(table.tenantId),
]);

// User Activity Patterns (사용자 활동 패턴 분석)
export const userActivityPatterns = sqliteTable('user_activity_patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id), // SaaS 멀티테넌시
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
}, (table) => [
  index('idx_user_activity_patterns_tenant').on(table.tenantId),
]);

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
