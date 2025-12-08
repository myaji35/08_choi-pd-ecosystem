import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/webhooks/[id]
 * Get webhook details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhookId = parseInt(params.id);

    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));

    if (!webhook) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      webhook: {
        ...webhook,
        secret: '***hidden***'
      }
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhook' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/webhooks/[id]
 * Update webhook
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhookId = parseInt(params.id);
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.url !== undefined) {
      // Validate URL
      try {
        new URL(body.url);
        updateData.url = body.url;
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL' },
          { status: 400 }
        );
      }
    }
    if (body.events !== undefined) {
      if (!Array.isArray(body.events)) {
        return NextResponse.json(
          { success: false, error: 'Events must be an array' },
          { status: 400 }
        );
      }
      updateData.events = JSON.stringify(body.events);
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.headers !== undefined) {
      updateData.headers = JSON.stringify(body.headers);
    }

    const [updatedWebhook] = await db
      .update(webhooks)
      .set(updateData)
      .where(eq(webhooks.id, webhookId))
      .returning();

    if (!updatedWebhook) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      webhook: {
        ...updatedWebhook,
        secret: '***hidden***'
      }
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/webhooks/[id]
 * Delete webhook
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhookId = parseInt(params.id);

    await db.delete(webhooks).where(eq(webhooks.id, webhookId));

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
