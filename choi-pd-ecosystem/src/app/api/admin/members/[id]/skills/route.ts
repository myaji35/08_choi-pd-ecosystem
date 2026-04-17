import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members, memberSkills, skills } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { resolveSkill } from '@/lib/skills/resolver';

async function getMember(idOrSlug: string) {
  const asInt = parseInt(idOrSlug);
  if (!isNaN(asInt) && String(asInt) === idOrSlug) {
    return db.select().from(members).where(eq(members.id, asInt)).get();
  }
  return db.select().from(members).where(eq(members.slug, idOrSlug)).get();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
  }
  const rows = await db
    .select({ ms: memberSkills, s: skills })
    .from(memberSkills)
    .leftJoin(skills, eq(memberSkills.skillId, skills.id))
    .where(eq(memberSkills.memberId, member.id))
    .all();
  return NextResponse.json({
    success: true,
    skills: rows.map((r) => ({
      ...r.ms,
      canonicalName: r.s?.canonicalName,
      category: r.s?.category,
      axis: r.s?.axis,
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await getMember(id);
    if (!member) {
      return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, category, level, yearsExperience } = body as {
      name?: string;
      category?: 'hard' | 'meta' | 'context';
      level?: 'novice' | 'intermediate' | 'expert';
      yearsExperience?: number | null;
    };
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'name required' }, { status: 400 });
    }

    const resolved = await resolveSkill(member.tenantId || 1, name.trim(), category || 'hard');

    const existing = await db
      .select()
      .from(memberSkills)
      .where(eq(memberSkills.memberId, member.id))
      .all();
    const already = existing.find((ms) => ms.skillId === resolved.skillId);

    if (already) {
      await db
        .update(memberSkills)
        .set({
          level: (level as any) || already.level,
          yearsExperience: yearsExperience ?? already.yearsExperience,
          source: 'self',
          weight: Math.max(already.weight || 50, 70),
          updatedAt: new Date(),
        })
        .where(eq(memberSkills.id, already.id));
      return NextResponse.json({ success: true, resolved, updated: true });
    }

    await db.insert(memberSkills).values({
      tenantId: member.tenantId || 1,
      memberId: member.id,
      skillId: resolved.skillId,
      level: (level as any) || 'intermediate',
      yearsExperience: yearsExperience ?? null,
      weight: 70,
      source: 'self',
    });

    return NextResponse.json({ success: true, resolved, created: true });
  } catch (error) {
    console.error('[skills POST] failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'add failed' },
      { status: 500 }
    );
  }
}
