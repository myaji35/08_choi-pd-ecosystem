import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kanbanColumns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/pd/kanban/columns?projectId=1 - Get columns by project
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

    const columns = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.projectId, parseInt(projectId)))
      .orderBy(kanbanColumns.sortOrder)
      .all();

    return NextResponse.json({
      success: true,
      columns,
    });
  } catch (error) {
    console.error('Failed to fetch columns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch columns' },
      { status: 500 }
    );
  }
}
