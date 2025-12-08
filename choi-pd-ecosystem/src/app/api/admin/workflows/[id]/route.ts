import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/workflows/[id]
 * Get workflow details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = parseInt(params.id);

    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, workflowId));

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/workflows/[id]
 * Update workflow
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = parseInt(params.id);
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.trigger !== undefined) updateData.trigger = body.trigger;
    if (body.triggerConfig !== undefined) {
      updateData.triggerConfig = JSON.stringify(body.triggerConfig);
    }
    if (body.actions !== undefined) {
      updateData.actions = JSON.stringify(body.actions);
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [updatedWorkflow] = await db
      .update(workflows)
      .set(updateData)
      .where(eq(workflows.id, workflowId))
      .returning();

    if (!updatedWorkflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/workflows/[id]
 * Delete workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = parseInt(params.id);

    await db.delete(workflows).where(eq(workflows.id, workflowId));

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
