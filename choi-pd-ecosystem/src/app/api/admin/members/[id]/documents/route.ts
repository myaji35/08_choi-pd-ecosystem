import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members, memberDocuments } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ingestDocument } from '@/lib/skills/ingest';

export const dynamic = 'force-dynamic';

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
  const docs = await db
    .select()
    .from(memberDocuments)
    .where(eq(memberDocuments.memberId, member.id))
    .orderBy(desc(memberDocuments.uploadedAt))
    .all();
  return NextResponse.json({ success: true, documents: docs });
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
    const { filename, contentMd, sizeBytes } = body as {
      filename?: string;
      contentMd?: string;
      sizeBytes?: number;
    };
    if (!filename || !contentMd) {
      return NextResponse.json(
        { success: false, error: 'filename, contentMd required' },
        { status: 400 }
      );
    }

    const result = await ingestDocument(
      member.tenantId || 1,
      member.id,
      filename,
      contentMd,
      sizeBytes || contentMd.length
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[documents POST] failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'upload failed' },
      { status: 500 }
    );
  }
}
