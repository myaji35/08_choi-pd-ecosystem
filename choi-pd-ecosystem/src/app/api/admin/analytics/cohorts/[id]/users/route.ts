import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cohorts, cohortUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Add user to cohort
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const cohortId = parseInt(id);
    const body = await request.json();

    const { userId, userEmail, metadata } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'userId and userEmail are required' },
        { status: 400 }
      );
    }

    // Add user to cohort
    const [cohortUser] = await db.insert(cohortUsers).values({
      cohortId,
      userId,
      userEmail,
      metadata: metadata ? JSON.stringify(metadata) : null
    }).returning();

    // Update user count
    const userCount = await db.select().from(cohortUsers).where(eq(cohortUsers.cohortId, cohortId));
    await db.update(cohorts)
      .set({ userCount: userCount.length })
      .where(eq(cohorts.id, cohortId));

    return NextResponse.json({ success: true, data: cohortUser });
  } catch (error: any) {
    console.error('Error adding user to cohort:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get cohort users
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const cohortId = parseInt(id);

    const users = await db.select()
      .from(cohortUsers)
      .where(eq(cohortUsers.cohortId, cohortId));

    // Parse metadata
    const parsedUsers = users.map((user) => ({
      ...user,
      metadata: user.metadata ? JSON.parse(user.metadata) : null
    }));

    return NextResponse.json({ success: true, data: parsedUsers });
  } catch (error: any) {
    console.error('Error fetching cohort users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
