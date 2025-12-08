import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kanbanProjects, kanbanColumns } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

// GET /api/pd/kanban/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const projects = await db
      .select()
      .from(kanbanProjects)
      .where(eq(kanbanProjects.isArchived, false))
      .orderBy(kanbanProjects.sortOrder, kanbanProjects.createdAt)
      .all();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/pd/kanban/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, color, icon } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create project
    const result = await db
      .insert(kanbanProjects)
      .values({
        title,
        description,
        color: color || '#3b82f6',
        icon: icon || 'folder',
      })
      .returning()
      .get();

    // Create default columns for the project
    const defaultColumns = [
      { title: 'To Do', color: '#6b7280', sortOrder: 0 },
      { title: 'In Progress', color: '#f59e0b', sortOrder: 1 },
      { title: 'Review', color: '#8b5cf6', sortOrder: 2 },
      { title: 'Done', color: '#10b981', sortOrder: 3 },
    ];

    for (const column of defaultColumns) {
      await db.insert(kanbanColumns).values({
        projectId: result.id,
        title: column.title,
        color: column.color,
        sortOrder: column.sortOrder,
      });
    }

    return NextResponse.json({
      success: true,
      project: result,
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
