import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { abTests } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    const [test] = await db.insert(abTests).values({
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
    }).returning();

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
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;

    let query = db.select().from(abTests);

    if (status) {
      query = query.where(eq(abTests.status, status as any)) as any;
    }

    const tests = await query.orderBy(desc(abTests.createdAt));

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
