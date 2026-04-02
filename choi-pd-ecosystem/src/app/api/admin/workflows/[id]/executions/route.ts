import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflowExecutions } from '@/lib/db/schema';
import { eq, desc, and, type SQL } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

/**
 * GET /api/admin/workflows/[id]/executions
 * Get workflow execution history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;    const workflowId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    const conditions: SQL[] = [
      eq(workflowExecutions.workflowId, workflowId),
      tenantFilter(workflowExecutions.tenantId, tenantId)
    ];

    if (status) {
      conditions.push(eq(workflowExecutions.status, status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'));
    }

    const executions = await db
      .select()
      .from(workflowExecutions)
      .where(and(...conditions))
      .orderBy(desc(workflowExecutions.createdAt))
      .limit(limit);

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
