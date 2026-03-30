import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { chatConversations, members } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db.query.members.findFirst({
      where: and(eq(members.towningraphUserId, session.userId), tenantFilter(members.tenantId, tenantId)),
    });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const conversations = await db.query.chatConversations.findMany({
      where: and(eq(chatConversations.memberId, member.id), tenantFilter(chatConversations.tenantId, tenantId)),
      orderBy: [desc(chatConversations.updatedAt)],
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db.query.members.findFirst({
      where: and(eq(members.towningraphUserId, session.userId), tenantFilter(members.tenantId, tenantId)),
    });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const body = await request.json();
    const title = body.title || '새 대화';

    const [conversation] = await db.insert(chatConversations).values(withTenantId({
      memberId: member.id,
      title,
    }, tenantId)).returning();

    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
