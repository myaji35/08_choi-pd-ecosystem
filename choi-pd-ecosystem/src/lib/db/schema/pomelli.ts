// Pomelli 통합 스키마
// Personal DNA 분석 결과를 저장하고, 공개 프로필 페이지(/p/{slug})의
// 테마/섹션을 자동 구성하는 핵심 테이블.
// 참조: docs/pomelli-master-plan.md §4

import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';
import { members } from './member';

// ============================================================
// 1) Personal DNA — 4축 분석 결과 (컬러·톤·스타일·가치)
// ============================================================
export const personalDna = sqliteTable('personal_dna', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),

  version: integer('version').notNull().default(1),

  // 입력 5개 컬러 (Primary / Navy / Teal / Orange / White)
  colorsJson: text('colors_json').notNull().default('{}'),
  // 파생 14개 시맨틱 토큰 (CSS 변수 바인딩 대상)
  semanticTokensJson: text('semantic_tokens_json').notNull().default('{}'),

  styleKeywords: text('style_keywords').default('[]'),   // ["에너지","친근함",...]
  toneKeywords: text('tone_keywords').default('[]'),     // ["열정적","현장감",...]
  coreValues: text('core_values').default('[]'),         // ["스마트폰으로 세상과 소통",...]
  slogan: text('slogan'),
  identityJson: text('identity_json').default('{}'),     // {channelName, slogan, activity, site, ...}

  // 사용자가 수동 편집한 필드 추적 (재분석 시 override 보존)
  overrideMap: text('override_map').default('{}'),
  syncPolicy: text('sync_policy', { enum: ['auto_all', 'ask_each', 'manual_only'] })
    .notNull().default('auto_all'),

  generatedBy: text('generated_by', { enum: ['self_declared', 'ingestion', 'manual'] })
    .notNull().default('self_declared'),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_personal_dna_member').on(table.memberId),
  index('idx_personal_dna_tenant').on(table.tenantId),
]);

// ============================================================
// 2) Profile Themes — 컬러 테마 버전 관리
// ============================================================
export const profileThemes = sqliteTable('profile_themes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  dnaId: integer('dna_id').references(() => personalDna.id, { onDelete: 'set null' }),

  version: integer('version').notNull().default(1),

  baseColorsJson: text('base_colors_json').notNull().default('{}'),      // 5 input colors
  derivedColorsJson: text('derived_colors_json').notNull().default('{}'), // 9 auto-derived shades
  semanticMappingJson: text('semantic_mapping_json').notNull().default('{}'), // token -> color
  contrastReportJson: text('contrast_report_json').default('{}'),        // WCAG AA/AAA 결과

  themeMode: text('theme_mode', { enum: ['light', 'dark', 'auto'] })
    .notNull().default('light'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
}, (table) => [
  index('idx_profile_themes_member').on(table.memberId),
  index('idx_profile_themes_published').on(table.memberId, table.isPublished),
]);

// ============================================================
// 3) Profile Pages — 공개 프로필 페이지 메타
// ============================================================
export const profilePages = sqliteTable('profile_pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').default(1).references(() => tenants.id),
  memberId: integer('member_id').notNull().unique().references(() => members.id, { onDelete: 'cascade' }),

  usernameSlug: text('username_slug').notNull().unique(),   // impd.me/{slug}
  templateId: text('template_id').notNull().default('pomelli_v1'),
  activeThemeId: integer('active_theme_id').references(() => profileThemes.id, { onDelete: 'set null' }),

  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  shareCount: integer('share_count').notNull().default(0),
  ogImageUrl: text('og_image_url'),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('idx_profile_pages_slug').on(table.usernameSlug),
  index('idx_profile_pages_tenant').on(table.tenantId),
]);

// ============================================================
// 4) Profile Sections — 13섹션 각 항목의 source_mode 관리
// ============================================================
export const profileSections = sqliteTable('profile_sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: integer('profile_id').notNull().references(() => profilePages.id, { onDelete: 'cascade' }),

  sectionType: text('section_type', {
    enum: [
      'hero', 'credentials', 'about', 'services', 'trust',
      'activity', 'channels', 'highlights', 'press',
      'tags', 'positioning', 'cta', 'footer',
    ],
  }).notNull(),

  displayOrder: integer('display_order').notNull().default(0),
  sourceMode: text('source_mode', { enum: ['auto', 'override', 'hybrid'] })
    .notNull().default('auto'),

  contentJson: text('content_json').notNull().default('{}'),
  sourceAnalysisId: integer('source_analysis_id'), // personalDna.id or generated asset id
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),

  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_profile_sections_profile').on(table.profileId),
  uniqueIndex('idx_profile_sections_profile_type').on(table.profileId, table.sectionType),
]);
