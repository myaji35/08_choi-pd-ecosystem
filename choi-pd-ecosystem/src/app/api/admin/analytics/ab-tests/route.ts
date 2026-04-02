import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { abTests } from '@/lib/db/schema';
import { eq, desc, and, type SQL } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter, withTenantId } from '@/lib/tenant/query-helpers';

// Create A/B test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      hypothesis,
      targetMetric,
      variants,
      trafficAllocation,
      confidenceLevel,
      createdBy
    } = body;

    // Validation
    if (!name || !targetMetric || !variants || !trafficAllocation || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate variants structure
    if (!Array.isArray(variants) || variants.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 variants are required' },
        { status: 400 }
      );
    }

    const tenantId = getTenantIdFromRequest(request);
    const [test] = await db.insert(abTests).values(withTenantId({
      name,
      description: description || null,
      hypothesis: hypothesis || null,
      status: 'draft',
      targetMetric,
      variants: JSON.stringify(variants),
      trafficAllocation: JSON.stringify(trafficAllocation),
      totalParticipants: 0,
      confidenceLevel: confidenceLevel || 95,
      results: null,
      winner: null,
      createdBy
    }, tenantId)).returning();

    return NextResponse.json({ success: true, data: test });
  } catch (error: any) {
    console.error('Error creating A/B test:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get A/B tests
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;

    const conditions: SQL[] = [tenantFilter(abTests.tenantId, tenantId)];
    if (status) {
      conditions.push(eq(abTests.status, status as 'draft' | 'running' | 'paused' | 'completed' | 'archived'));
    }

    const tests = await db.select().from(abTests).where(and(...conditions)).orderBy(desc(abTests.createdAt));

    // Parse JSON fields
    const parsedTests = tests.map((test) => ({
      ...test,
      variants: test.variants ? JSON.parse(test.variants) : null,
      trafficAllocation: test.trafficAllocation ? JSON.parse(test.trafficAllocation) : null,
      results: test.results ? JSON.parse(test.results) : null
    }));

    return NextResponse.json({ success: true, data: parsedTests });
  } catch (error: any) {
    console.error('Error fetching A/B tests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
