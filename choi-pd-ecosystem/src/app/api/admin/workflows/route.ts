import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { executeWorkflow } from '@/lib/workflows';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

/**
 * GET /api/admin/workflows
 * List all workflows
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const createdBy = searchParams.get('createdBy');

    const conditions: any[] = [tenantFilter(workflows.tenantId, tenantId)];

    if (isActive !== null) {
      conditions.push(eq(workflows.isActive, isActive === 'true'));
    }

    if (createdBy) {
      conditions.push(eq(workflows.createdBy, createdBy));
    }

    const allWorkflows = await db.select().from(workflows).where(and(...conditions)).orderBy(desc(workflows.createdAt));

    return NextResponse.json({
      success: true,
      workflows: allWorkflows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/workflows
 * Create a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      trigger,
      triggerConfig,
      actions,
      isActive = true,
      createdBy
    } = body;

    // Validation
    if (!name || !trigger || !triggerConfig || !actions || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['manual', 'schedule', 'event', 'webhook'].includes(trigger)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trigger type' },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);

    // Create workflow
    const [workflow] = await db.insert(workflows).values(withTenantId({
      name,
      description,
      trigger,
      triggerConfig: JSON.stringify(triggerConfig),
      actions: JSON.stringify(actions),
      isActive,
      createdBy,
      executionCount: 0,
      successCount: 0,
      failureCount: 0
    }, tenantId)).returning();

    return NextResponse.json({
      success: true,
      workflow
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
