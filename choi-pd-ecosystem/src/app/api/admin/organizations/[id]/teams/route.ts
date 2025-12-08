import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Create team
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = parseInt(params.id);
    const body = await request.json();

    const {
      name,
      description,
      parentTeamId,
      teamLead,
      color,
      icon
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Team name is required' },
        { status: 400 }
      );
    }

    const [team] = await db.insert(teams).values({
      organizationId: orgId,
      name,
      description: description || null,
      parentTeamId: parentTeamId || null,
      teamLead: teamLead || null,
      color: color || '#3b82f6',
      icon: icon || 'users',
      isActive: true
    }).returning();

    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get organization teams
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = parseInt(params.id);

    const orgTeams = await db.select()
      .from(teams)
      .where(eq(teams.organizationId, orgId))
      .orderBy(desc(teams.createdAt));

    return NextResponse.json({ success: true, data: orgTeams });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
