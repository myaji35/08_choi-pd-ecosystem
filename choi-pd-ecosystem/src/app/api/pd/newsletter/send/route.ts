import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { sendNewsletter } from '@/lib/email';
import { logger } from '@/lib/monitoring';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

// POST /api/pd/newsletter/send - Send newsletter to subscribers
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { subject, content, previewText, recipientIds } = body;

    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Get recipients
    let recipients: string[];

    if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
      // Send to specific recipients
      const selectedLeads = await db
        .select()
        .from(leads)
        .where(tenantFilter(leads.tenantId, tenantId))
        .all();

      recipients = selectedLeads
        .filter(lead => recipientIds.includes(lead.id))
        .map(lead => lead.email);
    } else {
      // Send to all subscribers
      const allLeads = await db.select().from(leads).where(tenantFilter(leads.tenantId, tenantId)).all();
      recipients = allLeads.map(lead => lead.email);
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients found' },
        { status: 400 }
      );
    }

    // Send newsletter
    const subscribers = recipients.map(email => ({ email }));
    await sendNewsletter({
      subject,
      content,
      subscribers,
    });

    // Log the newsletter send
    logger.api('Newsletter sent', {
      subject,
      recipients: recipients.length,
      sent: subscribers.length,
      failed: 0,
    });

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${subscribers.length} recipients`,
      sent: subscribers.length,
      failed: 0,
      errors: [],
    });
  } catch (error) {
    console.error('Failed to send newsletter:', error);
    logger.error('Newsletter send failed', error as Error);

    return NextResponse.json(
      { success: false, error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
