import { db } from '@/lib/db';
import { memberDocuments, memberSkills, type NewMemberSkill } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { extractFromMarkdown } from './extractor';
import { resolveSkill } from './resolver';

export function hashContent(markdown: string): string {
  return crypto.createHash('sha256').update(markdown).digest('hex').slice(0, 24);
}

export async function ingestDocument(
  tenantId: number,
  memberId: number,
  filename: string,
  contentMd: string,
  sizeBytes: number
) {
  const hash = hashContent(contentMd);

  // 중복 체크 (content_hash)
  const existing = await db
    .select()
    .from(memberDocuments)
    .where(eq(memberDocuments.contentHash, hash))
    .get();
  if (existing && existing.memberId === memberId) {
    return { reused: true, documentId: existing.id, extracted: 0 };
  }

  const extraction = await extractFromMarkdown(filename, contentMd);

  const [doc] = await db
    .insert(memberDocuments)
    .values({
      tenantId,
      memberId,
      filename,
      title: extraction.title,
      category: (extraction.category as any) || 'other',
      tags: JSON.stringify(extraction.tags),
      contentMd,
      contentHash: hash,
      sizeBytes,
      parsedAt: new Date(),
      extractedSkillsCount: extraction.skills.length,
      extractedEntities: JSON.stringify(extraction.entities),
    })
    .returning();

  await upsertMemberSkills(tenantId, memberId, extraction.skills);
  return { reused: false, documentId: doc.id, extracted: extraction.skills.length, source: extraction.source };
}

export async function reparseDocument(tenantId: number, documentId: number) {
  const doc = await db
    .select()
    .from(memberDocuments)
    .where(eq(memberDocuments.id, documentId))
    .get();
  if (!doc) throw new Error('document not found');

  const extraction = await extractFromMarkdown(doc.filename, doc.contentMd);

  await db
    .update(memberDocuments)
    .set({
      title: extraction.title,
      category: (extraction.category as any) || doc.category,
      tags: JSON.stringify(extraction.tags),
      parsedAt: new Date(),
      extractedSkillsCount: extraction.skills.length,
      extractedEntities: JSON.stringify(extraction.entities),
    })
    .where(eq(memberDocuments.id, documentId));

  await upsertMemberSkills(tenantId, doc.memberId, extraction.skills);
  return { extracted: extraction.skills.length, source: extraction.source };
}

async function upsertMemberSkills(
  tenantId: number,
  memberId: number,
  items: Array<{ name: string; category: 'hard' | 'meta' | 'context'; level?: string; yearsExperience?: number | null }>
) {
  for (const item of items) {
    try {
      const resolved = await resolveSkill(tenantId, item.name, item.category);

      const existing = await db
        .select()
        .from(memberSkills)
        .where(eq(memberSkills.memberId, memberId))
        .all();
      const already = existing.find((ms) => ms.skillId === resolved.skillId);

      if (already) {
        // weight 증가 + years 업데이트
        const newWeight = Math.min(100, (already.weight || 50) + 5);
        await db
          .update(memberSkills)
          .set({
            weight: newWeight,
            yearsExperience: item.yearsExperience ?? already.yearsExperience,
            level: (item.level as any) || already.level,
            source: already.source === 'verified' ? already.source : 'document',
            updatedAt: new Date(),
          })
          .where(eq(memberSkills.id, already.id));
      } else {
        const insertData: NewMemberSkill = {
          tenantId,
          memberId,
          skillId: resolved.skillId,
          level: (item.level as any) || 'intermediate',
          yearsExperience: item.yearsExperience ?? null,
          weight: 50,
          source: 'document',
        };
        await db.insert(memberSkills).values(insertData);
      }
    } catch (err) {
      console.error('[ingest] upsert skill failed:', item.name, err);
    }
  }
}
