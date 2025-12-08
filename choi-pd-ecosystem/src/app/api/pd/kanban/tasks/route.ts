import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kanbanTasks } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/pd/kanban/tasks?projectId=1 - Get tasks by project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const tasks = await db
      .select()
      .from(kanbanTasks)
      .where(eq(kanbanTasks.projectId, parseInt(projectId)))
      .orderBy(kanbanTasks.sortOrder, kanbanTasks.createdAt)
      .all();

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/pd/kanban/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      columnId,
      title,
      description,
      priority,
      dueDate,
      labels,
      assignee,
    } = body;

    if (!projectId || !columnId || !title) {
      return NextResponse.json(
        { success: false, error: 'Project ID, Column ID, and Title are required' },
        { status: 400 }
      );
    }

    // Get the highest sort order in the column
    const maxOrder = await db
      .select({ max: sql<number>`MAX(${kanbanTasks.sortOrder})` })
      .from(kanbanTasks)
      .where(eq(kanbanTasks.columnId, columnId))
      .get();

    const sortOrder = (maxOrder?.max || 0) + 1;

    const result = await db
      .insert(kanbanTasks)
      .values({
        projectId,
        columnId,
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        labels: labels ? JSON.stringify(labels) : null,
        assignee,
        sortOrder,
      })
      .returning()
      .get();

    return NextResponse.json({
      success: true,
      task: result,
    });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PATCH /api/pd/kanban/tasks - Move task to different column
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, columnId, sortOrder } = body;

    if (!taskId || !columnId) {
      return NextResponse.json(
        { success: false, error: 'Task ID and Column ID are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      columnId,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder;
    }

    await db
      .update(kanbanTasks)
      .set(updateData)
      .where(eq(kanbanTasks.id, taskId))
      .run();

    const updated = await db
      .select()
      .from(kanbanTasks)
      .where(eq(kanbanTasks.id, taskId))
      .get();

    return NextResponse.json({
      success: true,
      task: updated,
    });
  } catch (error) {
    console.error('Failed to move task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to move task' },
      { status: 500 }
    );
  }
}
