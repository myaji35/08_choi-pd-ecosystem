import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memberDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { docId } = await params;
    const id = parseInt(docId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }
    await db.delete(memberDocuments).where(eq(memberDocuments.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[documents DELETE] failed:', error);
    return NextResponse.json({ success: false, error: 'delete failed' }, { status: 500 });
  }
}
