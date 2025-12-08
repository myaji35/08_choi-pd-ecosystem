import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Get organization by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const orgId = parseInt(id);

    const [organization] = await db.select()
      .from(organizations)
      .where(eq(organizations.id, orgId));

    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsed = {
      ...organization,
      settings: organization.settings ? JSON.parse(organization.settings) : null,
      metadata: organization.metadata ? JSON.parse(organization.metadata) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const orgId = parseInt(id);
    const body = await request.json();

    const {
      displayName,
      industry,
      size,
      contactEmail,
      contactPhone,
      billingEmail,
      address,
      website,
      taxId,
      subscriptionPlan,
      subscriptionStatus,
      maxUsers,
      maxStorage,
      settings,
      metadata,
      isActive
    } = body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (industry !== undefined) updateData.industry = industry;
    if (size !== undefined) updateData.size = size;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (billingEmail !== undefined) updateData.billingEmail = billingEmail;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (subscriptionPlan !== undefined) updateData.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (maxStorage !== undefined) updateData.maxStorage = maxStorage;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);
    if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db.update(organizations)
      .set(updateData)
      .where(eq(organizations.id, orgId))
      .returning();

    // Parse JSON fields
    const parsed = {
      ...updated,
      settings: updated.settings ? JSON.parse(updated.settings) : null,
      metadata: updated.metadata ? JSON.parse(updated.metadata) : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const orgId = parseInt(id);

    await db.delete(organizations).where(eq(organizations.id, orgId));

    return NextResponse.json({ success: true, message: 'Organization deleted' });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
