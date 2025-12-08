import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cohorts, cohortUsers } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

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

    const [cohort] = await db.insert(cohorts).values({
      name,
      description: description || null,
      cohortType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      criteria: JSON.stringify(criteria),
      userCount: 0,
      metrics: null,
      createdBy
    }).returning();

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
    const searchParams = request.nextUrl.searchParams;
    const cohortType = searchParams.get('cohortType') || undefined;

    let query = db.select().from(cohorts);

    if (cohortType) {
      query = query.where(eq(cohorts.cohortType, cohortType as any)) as any;
    }

    const allCohorts = await query.orderBy(desc(cohorts.createdAt));

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
