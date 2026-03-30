import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { memberMemories, members } from '@/lib/db/schema';
import { eq, and, like, desc } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db
      .select()
      .from(members)
      .where(and(eq(members.towningraphUserId, session.userId), tenantFilter(members.tenantId, tenantId)))
      .get();
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const month = searchParams.get('month'); // YYYY-MM
    const category = searchParams.get('category');

    // Build conditions
    const conditions = [eq(memberMemories.memberId, member.id)];

    if (category) {
      conditions.push(eq(memberMemories.category, category));
    }

    if (month) {
      // Match dates starting with YYYY-MM
      conditions.push(like(memberMemories.date, `${month}%`));
    }

    if (q) {
      conditions.push(like(memberMemories.summary, `%${q}%`));
    }

    const memories = await db
      .select()
      .from(memberMemories)
      .where(and(...conditions))
      .orderBy(desc(memberMemories.date), desc(memberMemories.createdAt));

    return NextResponse.json({ success: true, data: memories });
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}
