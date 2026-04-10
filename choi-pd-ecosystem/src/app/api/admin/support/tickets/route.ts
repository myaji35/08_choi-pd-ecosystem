import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supportTickets } from '@/lib/db/schema';
import { eq, desc, and, or, like, type SQL } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

// Create support ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      organizationId,
      createdBy,
      createdByEmail,
      createdByName,
      subject,
      description,
      category,
      priority,
      attachments,
      tags
    } = body;

    // Validation
    if (!organizationId || !createdBy || !createdByEmail || !subject || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const [ticket] = await db.insert(supportTickets).values(withTenantId({
      organizationId,
      createdBy,
      createdByEmail,
      createdByName: createdByName || null,
      subject,
      description,
      category,
      priority: priority || 'medium',
      status: 'open',
      attachments: attachments ? JSON.stringify(attachments) : null,
      tags: tags ? JSON.stringify(tags) : null,
      metadata: null
    }, tenantId)).returning();

    // Parse JSON fields
    const parsed = {
      ...ticket,
      attachments: ticket.attachments ? JSON.parse(ticket.attachments) : null,
      tags: ticket.tags ? JSON.parse(ticket.tags) : null,
      metadata: ticket.metadata ? JSON.parse(ticket.metadata) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Get support tickets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const search = searchParams.get('search') || undefined;

    const tenantId = getTenantIdFromRequest(request);
    const conditions: SQL[] = [tenantFilter(supportTickets.tenantId, tenantId)];

    if (organizationId) {
      conditions.push(eq(supportTickets.organizationId, parseInt(organizationId)));
    }

    if (status) {
      conditions.push(eq(supportTickets.status, status as 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'));
    }

    if (priority) {
      conditions.push(eq(supportTickets.priority, priority as 'low' | 'medium' | 'high' | 'urgent'));
    }

    if (category) {
      conditions.push(eq(supportTickets.category, category as 'technical' | 'billing' | 'feature_request' | 'bug' | 'other'));
    }

    if (assignedTo) {
      conditions.push(eq(supportTickets.assignedTo, assignedTo));
    }

    if (search) {
      conditions.push(
        or(
          like(supportTickets.subject, `%${search}%`),
          like(supportTickets.description, `%${search}%`)
        )!
      );
    }

    const tickets = await db.select().from(supportTickets)
      .where(and(...conditions))
      .orderBy(desc(supportTickets.createdAt));

    // Parse JSON fields
    const parsed = tickets.map((ticket) => ({
      ...ticket,
      attachments: ticket.attachments ? JSON.parse(ticket.attachments) : null,
      tags: ticket.tags ? JSON.parse(ticket.tags) : null,
      metadata: ticket.metadata ? JSON.parse(ticket.metadata) : null
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
