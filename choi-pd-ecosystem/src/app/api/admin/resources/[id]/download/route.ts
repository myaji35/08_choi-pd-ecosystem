import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorResources } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { logger } from '@/lib/monitoring';

// POST /api/admin/resources/[id]/download - Track resource download
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Get resource
    const resource = await db
      .select()
      .from(distributorResources)
      .where(eq(distributorResources.id, id))
      .get();

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Increment download count
    await db
      .update(distributorResources)
      .set({
        downloadCount: sql`${distributorResources.downloadCount} + 1`,
      })
      .where(eq(distributorResources.id, id))
      .run();

    // Log the download
    logger.api('Resource downloaded', {
      resourceId: id,
      title: resource.title,
      category: resource.category,
    });

    return NextResponse.json({
      success: true,
      message: 'Download tracked',
      resource: {
        id: resource.id,
        fileUrl: resource.fileUrl,
        filename: resource.filename,
      },
    });
  } catch (error) {
    console.error('Failed to track download:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track download' },
      { status: 500 }
    );
  }
}
