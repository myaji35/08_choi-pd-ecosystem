import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { members, memberDocuments, memberSkills, memberGapReports, skills } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import MemberDetailClient from './MemberDetailClient';

export const dynamic = 'force-dynamic';

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const member = await db.select().from(members).where(eq(members.slug, slug)).get();
  if (!member) notFound();

  const documents = await db
    .select()
    .from(memberDocuments)
    .where(eq(memberDocuments.memberId, member.id))
    .orderBy(desc(memberDocuments.uploadedAt))
    .all();

  const rawSkills = await db
    .select({ ms: memberSkills, s: skills })
    .from(memberSkills)
    .leftJoin(skills, eq(memberSkills.skillId, skills.id))
    .where(eq(memberSkills.memberId, member.id))
    .all();

  const memberSkillList = rawSkills.map((r) => ({
    ...r.ms,
    canonicalName: r.s?.canonicalName || '',
    category: r.s?.category || 'hard',
    axis: r.s?.axis || null,
  }));

  const latestReport = await db
    .select()
    .from(memberGapReports)
    .where(eq(memberGapReports.memberId, member.id))
    .orderBy(desc(memberGapReports.generatedAt))
    .limit(1)
    .get();

  return (
    <MemberDetailClient
      initialTab={tab || 'monitor'}
      member={member}
      documents={documents}
      skills={memberSkillList}
      gapReport={latestReport || null}
    />
  );
}
