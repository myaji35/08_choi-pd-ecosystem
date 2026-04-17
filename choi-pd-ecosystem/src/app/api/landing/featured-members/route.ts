import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  members,
  memberSkills,
  skills,
  memberInquiries,
} from '@/lib/db/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * 랜딩 공개용 — isFeatured 우선, 없으면 approved 회원 최신순 top 12.
 * PII 최소화: id/slug/name/profession/profileImage/coverImage/tagline + 달란트 3개 + 문의수.
 */
export async function GET(_request: NextRequest) {
  try {
    const baseCondition = sql`${members.status} = 'approved'`;

    const featured = await db
      .select()
      .from(members)
      .where(and(baseCondition, eq(members.isFeatured, 1)))
      .orderBy(desc(members.featuredOrder))
      .limit(12)
      .all();

    let pool = featured;
    if (pool.length < 6) {
      const rest = await db
        .select()
        .from(members)
        .where(baseCondition)
        .orderBy(desc(members.createdAt))
        .limit(12 - pool.length)
        .all();
      const poolIds = new Set(pool.map((m) => m.id));
      for (const r of rest) if (!poolIds.has(r.id)) pool.push(r);
    }

    if (pool.length === 0) {
      return NextResponse.json({ success: true, members: [] });
    }

    const d7 = new Date(Date.now() - 7 * 86400000);

    // 회원별 달란트 3개 + 주간 문의수 병렬 조회
    const enriched = await Promise.all(
      pool.map(async (m) => {
        const [topSkills, inq7d] = await Promise.all([
          db
            .select({ name: skills.canonicalName })
            .from(memberSkills)
            .leftJoin(skills, eq(memberSkills.skillId, skills.id))
            .where(eq(memberSkills.memberId, m.id))
            .orderBy(desc(memberSkills.weight))
            .limit(3)
            .all(),
          db
            .select({ c: sql<number>`count(*)` })
            .from(memberInquiries)
            .where(
              and(eq(memberInquiries.memberId, m.id), gte(memberInquiries.createdAt, d7))
            )
            .get(),
        ]);

        return {
          id: m.id,
          slug: m.slug,
          name: m.name,
          profession: m.profession,
          profileImage: m.profileImage,
          coverImage: m.coverImage,
          tagline: m.bio ? m.bio.slice(0, 80) : null,
          skills: topSkills.map((s) => s.name).filter(Boolean),
          inquiries: Number(inq7d?.c || 0),
        };
      })
    );

    return NextResponse.json({ success: true, members: enriched });
  } catch (error) {
    console.error('[featured-members] failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'failed' },
      { status: 500 }
    );
  }
}
