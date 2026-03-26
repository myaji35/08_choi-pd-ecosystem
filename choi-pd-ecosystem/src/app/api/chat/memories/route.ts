import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { memberMemories, members } from '@/lib/db/schema';
import { eq, and, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db.query.members.findFirst({
      where: eq(members.towningraphUserId, session.userId),
    });
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

    const memories = await db.query.memberMemories.findMany({
      where: and(...conditions),
      orderBy: [desc(memberMemories.date), desc(memberMemories.createdAt)],
    });

    return NextResponse.json({ success: true, data: memories });
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}
