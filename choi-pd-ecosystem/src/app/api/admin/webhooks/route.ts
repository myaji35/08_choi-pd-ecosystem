import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { createWebhook } from '@/lib/workflows';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

/**
 * GET /api/admin/webhooks
 * List all webhooks
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    let query = db.select().from(webhooks);

    const conditions: any[] = [tenantFilter(webhooks.tenantId, tenantId)];
    if (isActive !== null) {
      conditions.push(eq(webhooks.isActive, isActive === 'true'));
    }
    query = query.where(and(...conditions)) as any;

    const allWebhooks = await query.orderBy(desc(webhooks.createdAt));

    // Don't expose secrets in list view
    const sanitized = allWebhooks.map(wh => ({
      ...wh,
      secret: '***hidden***'
    }));

    return NextResponse.json({
      success: true,
      webhooks: sanitized
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/webhooks
 * Create a new webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      url,
      events,
      headers,
      createdBy
    } = body;

    // Validation
    if (!name || !url || !events || !Array.isArray(events) || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Create webhook using utility function
    const webhook = await createWebhook({
      name,
      url,
      events,
      headers,
      createdBy
    });

    return NextResponse.json({
      success: true,
      webhook: {
        ...webhook,
        secret: '***hidden***'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
