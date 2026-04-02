import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kanbanTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

// DELETE /api/pd/kanban/tasks/[taskId] - 칸반 태스크 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId: taskIdStr } = await params;
    const taskId = parseInt(taskIdStr);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);

    const result = await db
      .delete(kanbanTasks)
      .where(and(
        eq(kanbanTasks.id, taskId),
        tenantFilter(kanbanTasks.tenantId, tenantId)
      ))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
