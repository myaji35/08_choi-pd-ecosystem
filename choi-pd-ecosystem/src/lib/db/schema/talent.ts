// 달란트(skills) · 문서(documents) · 갭 리포트(gap_reports) — GraphRAG 연료

import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { tenants } from './tenant';
import { members } from './member';

// ── Skills (달란트 canonical 사전) ───────────────────────────────
// Entity Resolution 규칙: canonical_name 으로 통합, aliases[]에 표면형 저장
export const skills = sqliteTable(
  'skills',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    canonicalName: text('canonical_name').notNull(), // "영상 편집"
    aliases: text('aliases').default('[]').notNull(), // JSON: ["비디오 편집","영상편집","video editing"]
    category: text('category', {
      enum: ['hard', 'meta', 'context'],
    }).notNull(), // hard=전문기술 / meta=소프트역량 / context=경험자산
    axis: text('axis', {
      enum: ['expertise', 'communication', 'marketing', 'operations', 'data', 'network'],
    }), // 레이더 차트 6축 중 어디에 속하는가
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_skills_tenant_canonical').on(table.tenantId, table.canonicalName),
    index('idx_skills_axis').on(table.axis),
  ]
);

// ── Member → Skill 엣지 ──────────────────────────────────────────
export const memberSkills = sqliteTable(
  'member_skills',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    skillId: integer('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    level: text('level', { enum: ['novice', 'intermediate', 'expert'] })
      .default('intermediate')
      .notNull(),
    yearsExperience: integer('years_experience'),
    weight: integer('weight').default(50).notNull(), // 0~100 그래프 엣지 가중치
    source: text('source', {
      enum: ['self', 'document', 'review', 'verified'],
    })
      .default('self')
      .notNull(),
    verifiedAt: integer('verified_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_member_skills_unique').on(table.memberId, table.skillId),
    index('idx_member_skills_member').on(table.memberId),
    index('idx_member_skills_skill').on(table.skillId),
  ]
);

// ── Member 문서 자료실 (MD 업로드) ───────────────────────────────
export const memberDocuments = sqliteTable(
  'member_documents',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    title: text('title'),
    category: text('category', {
      enum: ['bio', 'portfolio', 'curriculum', 'awards', 'interview', 'other'],
    })
      .default('other')
      .notNull(),
    tags: text('tags').default('[]').notNull(), // JSON array
    contentMd: text('content_md').notNull(), // raw markdown
    contentHash: text('content_hash').notNull(), // SHA256, 증분 재파싱용
    sizeBytes: integer('size_bytes').default(0),
    parsedAt: integer('parsed_at', { mode: 'timestamp' }),
    extractedSkillsCount: integer('extracted_skills_count').default(0),
    extractedEntities: text('extracted_entities').default('{}'), // JSON
    uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_member_documents_member').on(table.memberId),
    uniqueIndex('idx_member_documents_hash').on(table.memberId, table.contentHash),
  ]
);

// ── 갭 리포트 스냅샷 ─────────────────────────────────────────────
export const memberGapReports = sqliteTable(
  'member_gap_reports',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: integer('tenant_id').default(1).references(() => tenants.id),
    memberId: integer('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    profession: text('profession').notNull(), // 동일 직종 벤치마크 기준
    completenessScore: integer('completeness_score').default(0), // 0~100
    radarSelf: text('radar_self').notNull(), // JSON: {expertise:7, communication:8, ...}
    radarMedian: text('radar_median').notNull(), // 같은 직종 중앙값
    radarTop10: text('radar_top10').notNull(), // 상위 10% 평균
    gapsJson: text('gaps_json').default('[]').notNull(), // [{severity, skill, reason, expectedRevenueLoss, recommendation}]
    opportunitiesJson: text('opportunities_json').default('[]').notNull(),
    growthPathJson: text('growth_path_json').default('[]').notNull(),
    peerSampleSize: integer('peer_sample_size').default(0),
    generatedAt: integer('generated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_member_gap_reports_member').on(table.memberId)]
);

// Types
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

export type MemberSkill = typeof memberSkills.$inferSelect;
export type NewMemberSkill = typeof memberSkills.$inferInsert;

export type MemberDocument = typeof memberDocuments.$inferSelect;
export type NewMemberDocument = typeof memberDocuments.$inferInsert;

export type MemberGapReport = typeof memberGapReports.$inferSelect;
export type NewMemberGapReport = typeof memberGapReports.$inferInsert;
