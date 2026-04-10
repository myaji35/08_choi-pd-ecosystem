import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { funnels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

// Create funnel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      steps,
      conversionWindow,
      createdBy
    } = body;

    // Validation
    if (!name || !steps || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate steps structure
    if (!Array.isArray(steps) || steps.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 steps are required' },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const [funnel] = await db.insert(funnels).values(withTenantId({
      name,
      description: description || null,
      steps: JSON.stringify(steps),
      conversionWindow: conversionWindow || 7,
      totalUsers: 0,
      conversionData: null,
      createdBy
    }, tenantId)).returning();

    return NextResponse.json({ success: true, data: funnel });
  } catch (error: any) {
    console.error('Error creating funnel:', error);
    return NextResponse.json(
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Get funnels
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const allFunnels = await db.select()
      .from(funnels)
      .where(tenantFilter(funnels.tenantId, tenantId))
      .orderBy(desc(funnels.createdAt));

    // Parse JSON fields
    const parsedFunnels = allFunnels.map((funnel) => ({
      ...funnel,
      steps: funnel.steps ? JSON.parse(funnel.steps) : null,
      conversionData: funnel.conversionData ? JSON.parse(funnel.conversionData) : null
    }));

    return NextResponse.json({ success: true, data: parsedFunnels });
  } catch (error: any) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json(
      { success: false, error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
