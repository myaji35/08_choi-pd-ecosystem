import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  members,
  memberAwards,
  memberChannels,
  memberActivityTimeline,
  memberProfileMedia,
  memberFollowers,
  memberSkills,
  skills,
} from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const member = await db.select().from(members).where(eq(members.slug, slug)).get();
  if (!member) {
    return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
  }

  const [awards, channels, timeline, media, followerStats, topSkills] = await Promise.all([
    db.select().from(memberAwards).where(eq(memberAwards.memberId, member.id))
      .orderBy(memberAwards.displayOrder).all(),
    db.select().from(memberChannels).where(eq(memberChannels.memberId, member.id))
      .orderBy(memberChannels.displayOrder).all(),
    db.select().from(memberActivityTimeline)
      .where(eq(memberActivityTimeline.memberId, member.id))
      .orderBy(desc(memberActivityTimeline.occurredAt))
      .limit(12).all(),
    db.select().from(memberProfileMedia).where(eq(memberProfileMedia.memberId, member.id))
      .orderBy(memberProfileMedia.displayOrder).all(),
    db.select({ c: sql<number>`count(*)` }).from(memberFollowers)
      .where(and(eq(memberFollowers.memberId, member.id), eq(memberFollowers.status, 'active'))).get(),
    db.select({ name: skills.canonicalName })
      .from(memberSkills).leftJoin(skills, eq(memberSkills.skillId, skills.id))
      .where(eq(memberSkills.memberId, member.id))
      .orderBy(desc(memberSkills.weight)).limit(6).all(),
  ]);

  // 마지막 활동 (14일 이내면 "활동 중" 표시)
  const lastActivity = timeline[0]?.occurredAt || null;
  const now = Date.now();
  const isLive = lastActivity ? (now - new Date(lastActivity).getTime()) < 14 * 86400000 : false;

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      slug: member.slug,
      name: member.name,
      profession: member.profession,
      profileImage: member.profileImage,
      coverImage: member.coverImage,
      bio: member.bio,
      status: member.status,
      themeConfig: member.themeConfig ? JSON.parse(member.themeConfig) : null,
      createdAt: member.createdAt,
    },
    awards,
    channels,
    timeline,
    media,
    skills: topSkills.map((s) => s.name).filter(Boolean),
    followerCount: Number(followerStats?.c || 0),
    isLive,
  });
}
