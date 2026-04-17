import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateGapReport } from '@/lib/skills/gap-report';

export const dynamic = 'force-dynamic';

async function getMember(idOrSlug: string) {
  const asInt = parseInt(idOrSlug);
  if (!isNaN(asInt) && String(asInt) === idOrSlug) {
    return db.select().from(members).where(eq(members.id, asInt)).get();
  }
  return db.select().from(members).where(eq(members.slug, idOrSlug)).get();
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await getMember(id);
    if (!member) {
      return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
    }
    const report = await generateGapReport(member.id);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('[gap-report/generate] failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'generation failed' },
      { status: 500 }
    );
  }
}
