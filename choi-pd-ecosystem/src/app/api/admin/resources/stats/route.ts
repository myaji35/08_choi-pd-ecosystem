import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorResources } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

// GET /api/admin/resources/stats - Get resource statistics
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantCond = tenantFilter(distributorResources.tenantId, tenantId);

    // Get total resources
    const totalResources = await db
      .select({ count: sql<number>`count(*)` })
      .from(distributorResources)
      .where(tenantCond)
      .get();

    // Get total downloads
    const totalDownloads = await db
      .select({ total: sql<number>`sum(${distributorResources.downloadCount})` })
      .from(distributorResources)
      .where(tenantCond)
      .get();

    // Get resources by category
    const byCategory = await db
      .select({
        category: distributorResources.category,
        count: sql<number>`count(*)`,
        downloads: sql<number>`sum(${distributorResources.downloadCount})`,
      })
      .from(distributorResources)
      .where(tenantCond)
      .groupBy(distributorResources.category)
      .all();

    // Get top 10 most downloaded resources
    const topResources = await db
      .select({
        id: distributorResources.id,
        title: distributorResources.title,
        category: distributorResources.category,
        downloadCount: distributorResources.downloadCount,
        fileType: distributorResources.fileType,
      })
      .from(distributorResources)
      .where(tenantCond)
      .orderBy(desc(distributorResources.downloadCount))
      .limit(10)
      .all();

    // Get resources by required plan
    const byPlan = await db
      .select({
        requiredPlan: distributorResources.requiredPlan,
        count: sql<number>`count(*)`,
      })
      .from(distributorResources)
      .where(tenantCond)
      .groupBy(distributorResources.requiredPlan)
      .all();

    return NextResponse.json({
      success: true,
      stats: {
        total: totalResources?.count || 0,
        totalDownloads: totalDownloads?.total || 0,
        byCategory,
        byPlan,
        topResources,
      },
    });
  } catch (error) {
    console.error('Failed to get resource stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get resource stats' },
      { status: 500 }
    );
  }
}
