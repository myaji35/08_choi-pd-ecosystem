import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/lib/workflows';

/**
 * POST /api/admin/workflows/[id]/execute
 * Execute a workflow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const workflowId = parseInt(id);
    const body = await request.json();
    const { triggerData, executedBy } = body;

    const result = await executeWorkflow({
      workflowId,
      trigger: 'manual',
      triggerData,
      executedBy
    });

    return NextResponse.json({
      success: true,
      execution: result
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}
