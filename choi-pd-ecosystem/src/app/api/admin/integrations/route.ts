import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { addIntegration, updateIntegration } from '@/lib/workflows';

/**
 * GET /api/admin/integrations
 * List all integrations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');
    const isEnabled = searchParams.get('isEnabled');

    let query = db.select().from(integrations);

    if (type) {
      query = query.where(eq(integrations.type, type as any));
    }

    if (provider) {
      query = query.where(eq(integrations.provider, provider));
    }

    if (isEnabled !== null) {
      query = query.where(eq(integrations.isEnabled, isEnabled === 'true'));
    }

    const allIntegrations = await query.orderBy(desc(integrations.createdAt));

    // Don't expose credentials in list view
    const sanitized = allIntegrations.map(int => ({
      ...int,
      credentials: '***encrypted***'
    }));

    return NextResponse.json({
      success: true,
      integrations: sanitized
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/integrations
 * Add a new integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      provider,
      credentials,
      config,
      scopes,
      createdBy
    } = body;

    // Validation
    if (!name || !type || !provider || !credentials || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['messaging', 'crm', 'storage', 'analytics', 'automation'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid integration type' },
        { status: 400 }
      );
    }

    // Create integration using utility function (handles encryption)
    const integration = await addIntegration({
      name,
      type,
      provider,
      credentials,
      config,
      scopes,
      createdBy
    });

    return NextResponse.json({
      success: true,
      integration: {
        ...integration,
        credentials: '***encrypted***'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}
