import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationMembers } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Add member to organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const orgId = parseInt(id);
    const body = await request.json();

    const {
      userId,
      userEmail,
      userName,
      role,
      teamId,
      jobTitle,
      department,
      permissions,
      invitedBy
    } = body;

    // Validation
    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'userId and userEmail are required' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existing = await db.select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userEmail, userEmail)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User is already a member' },
        { status: 400 }
      );
    }

    const [member] = await db.insert(organizationMembers).values({
      organizationId: orgId,
      userId,
      userEmail,
      userName: userName || null,
      role: role || 'member',
      teamId: teamId || null,
      jobTitle: jobTitle || null,
      department: department || null,
      permissions: permissions ? JSON.stringify(permissions) : null,
      invitedBy: invitedBy || null,
      invitedAt: new Date(),
      status: 'invited'
    }).returning();

    // Parse JSON fields
    const parsed = {
      ...member,
      permissions: member.permissions ? JSON.parse(member.permissions) : null,
      metadata: member.metadata ? JSON.parse(member.metadata) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get organization members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const orgId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;

    let query = db.select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));

    const members = await query;

    // Filter by role and status if provided
    let filtered = members;
    if (role) {
      filtered = filtered.filter(m => m.role === role);
    }
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }

    // Parse JSON fields
    const parsed = filtered.map((member) => ({
      ...member,
      permissions: member.permissions ? JSON.parse(member.permissions) : null,
      metadata: member.metadata ? JSON.parse(member.metadata) : null
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
