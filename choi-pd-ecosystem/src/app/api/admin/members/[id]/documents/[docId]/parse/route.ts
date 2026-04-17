import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memberDocuments, members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { reparseDocument } from '@/lib/skills/ingest';

async function getMember(idOrSlug: string) {
  const asInt = parseInt(idOrSlug);
  if (!isNaN(asInt) && String(asInt) === idOrSlug) {
    return db.select().from(members).where(eq(members.id, asInt)).get();
  }
  return db.select().from(members).where(eq(members.slug, idOrSlug)).get();
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id: idOrSlug, docId } = await params;
    const numericDocId = parseInt(docId);
    if (isNaN(numericDocId)) {
      return NextResponse.json({ success: false, error: 'invalid doc id' }, { status: 400 });
    }

    const member = await getMember(idOrSlug);
    if (!member) {
      return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
    }

    const doc = await db
      .select()
      .from(memberDocuments)
      .where(eq(memberDocuments.id, numericDocId))
      .get();
    if (!doc || doc.memberId !== member.id) {
      return NextResponse.json({ success: false, error: 'document not found' }, { status: 404 });
    }

    const result = await reparseDocument(member.tenantId || 1, numericDocId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[reparse] failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'reparse failed' },
      { status: 500 }
    );
  }
}
