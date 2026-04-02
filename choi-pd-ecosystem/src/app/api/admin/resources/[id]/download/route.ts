import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorResources } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { logger } from '@/lib/monitoring';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

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

    const tenantId = getTenantIdFromRequest(request);
    // Get resource
    const resource = await db
      .select()
      .from(distributorResources)
      .where(and(eq(distributorResources.id, id), tenantFilter(distributorResources.tenantId, tenantId)))
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
        filename: resource.title,
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
