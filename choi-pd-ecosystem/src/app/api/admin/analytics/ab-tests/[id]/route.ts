import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { abTests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Update A/B test
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = parseInt(params.id);
    const body = await request.json();

    const { status, results, winner } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'running') {
        updateData.startDate = new Date();
      } else if (status === 'completed') {
        updateData.endDate = new Date();
      }
    }

    if (results) {
      updateData.results = JSON.stringify(results);
    }

    if (winner) {
      updateData.winner = winner;
    }

    updateData.updatedAt = new Date();

    const [updated] = await db.update(abTests)
      .set(updateData)
      .where(eq(abTests.id, testId))
      .returning();

    // Parse JSON fields
    const parsed = {
      ...updated,
      variants: updated.variants ? JSON.parse(updated.variants) : null,
      trafficAllocation: updated.trafficAllocation ? JSON.parse(updated.trafficAllocation) : null,
      results: updated.results ? JSON.parse(updated.results) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error updating A/B test:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get single A/B test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = parseInt(params.id);

    const [test] = await db.select()
      .from(abTests)
      .where(eq(abTests.id, testId));

    if (!test) {
      return NextResponse.json(
        { success: false, error: 'A/B test not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsed = {
      ...test,
      variants: test.variants ? JSON.parse(test.variants) : null,
      trafficAllocation: test.trafficAllocation ? JSON.parse(test.trafficAllocation) : null,
      results: test.results ? JSON.parse(test.results) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching A/B test:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
