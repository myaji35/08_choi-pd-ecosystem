import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cohorts, cohortUsers } from '@/lib/db/schema';
import { eq, desc, and, type SQL } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

// Create cohort
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      cohortType,
      startDate,
      endDate,
      criteria,
      createdBy
    } = body;

    // Validation
    if (!name || !cohortType || !startDate || !endDate || !criteria || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const [cohort] = await db.insert(cohorts).values(withTenantId({
      name,
      description: description || null,
      cohortType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      criteria: JSON.stringify(criteria),
      userCount: 0,
      metrics: null,
      createdBy
    }, tenantId)).returning();

    return NextResponse.json({ success: true, data: cohort });
  } catch (error: any) {
    console.error('Error creating cohort:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get cohorts
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const cohortType = searchParams.get('cohortType') || undefined;

    const conditions: SQL[] = [tenantFilter(cohorts.tenantId, tenantId)];
    if (cohortType) {
      conditions.push(eq(cohorts.cohortType, cohortType as 'acquisition' | 'behavior' | 'demographic' | 'custom'));
    }

    const allCohorts = await db.select().from(cohorts).where(and(...conditions)).orderBy(desc(cohorts.createdAt));

    // Parse JSON fields
    const parsedCohorts = allCohorts.map((cohort) => ({
      ...cohort,
      criteria: cohort.criteria ? JSON.parse(cohort.criteria) : null,
      metrics: cohort.metrics ? JSON.parse(cohort.metrics) : null
    }));

    return NextResponse.json({ success: true, data: parsedCohorts });
  } catch (error: any) {
    console.error('Error fetching cohorts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
