import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflowExecutions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/admin/workflows/[id]/executions
 * Get workflow execution history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const workflowId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    let query = db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.workflowId, workflowId))
      .orderBy(desc(workflowExecutions.createdAt))
      .limit(limit);

    if (status) {
      query = query.where(eq(workflowExecutions.status, status as any));
    }

    const executions = await query;

    return NextResponse.json({
      success: true,
      executions
    });
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
