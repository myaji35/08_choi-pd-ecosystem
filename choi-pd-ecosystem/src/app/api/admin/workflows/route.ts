import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { executeWorkflow } from '@/lib/workflows';

/**
 * GET /api/admin/workflows
 * List all workflows
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const createdBy = searchParams.get('createdBy');

    let query = db.select().from(workflows);

    if (isActive !== null) {
      query = query.where(eq(workflows.isActive, isActive === 'true'));
    }

    if (createdBy) {
      query = query.where(eq(workflows.createdBy, createdBy));
    }

    const allWorkflows = await query.orderBy(desc(workflows.createdAt));

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

    // Create workflow
    const [workflow] = await db.insert(workflows).values({
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
    }).returning();

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
