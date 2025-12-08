import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/workflows';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/webhooks/receive
 * Receive and process incoming webhooks
 *
 * Headers:
 * - X-Webhook-Signature: HMAC signature for verification
 * - X-Webhook-ID: Webhook ID (optional, can be in query param)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookIdParam = searchParams.get('id');
    const signature = request.headers.get('X-Webhook-Signature');

    if (!webhookIdParam) {
      return NextResponse.json(
        { success: false, error: 'Webhook ID required' },
        { status: 400 }
      );
    }

    const webhookId = parseInt(webhookIdParam);

    // Get webhook configuration
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

    if (!webhook.isActive) {
      return NextResponse.json(
        { success: false, error: 'Webhook is disabled' },
        { status: 403 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify signature if provided
    if (signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhook.secret);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Process webhook event
    // This could trigger workflows, send notifications, etc.
    console.log('Webhook received:', {
      webhookId,
      event: payload.event,
      data: payload.data
    });

    // TODO: Implement actual webhook processing logic
    // - Trigger associated workflows
    // - Send notifications
    // - Update database records
    // - etc.

    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed',
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
