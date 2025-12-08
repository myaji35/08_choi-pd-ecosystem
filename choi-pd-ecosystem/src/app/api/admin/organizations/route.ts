import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations, organizationBranding } from '@/lib/db/schema';
import { eq, desc, or, like } from 'drizzle-orm';

// Helper function to generate slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Create organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      displayName,
      slug,
      type,
      industry,
      size,
      contactEmail,
      contactPhone,
      billingEmail,
      address,
      website,
      taxId,
      subscriptionPlan,
      maxUsers,
      maxStorage
    } = body;

    // Validation
    if (!name || !displayName || !type || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const generatedSlug = slug || slugify(name);

    // Check if slug already exists
    const existing = await db.select()
      .from(organizations)
      .where(eq(organizations.slug, generatedSlug));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Organization slug already exists' },
        { status: 400 }
      );
    }

    // Create organization
    const [organization] = await db.insert(organizations).values({
      name,
      displayName,
      slug: generatedSlug,
      type,
      industry: industry || null,
      size: size || null,
      contactEmail,
      contactPhone: contactPhone || null,
      billingEmail: billingEmail || null,
      address: address || null,
      website: website || null,
      taxId: taxId || null,
      subscriptionPlan: subscriptionPlan || 'enterprise',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUsers: maxUsers || 10,
      maxStorage: maxStorage || 10737418240, // 10GB
      usedStorage: 0,
      isActive: true
    }).returning();

    // Create default branding
    await db.insert(organizationBranding).values({
      organizationId: organization.id,
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      fontFamily: 'Inter'
    });

    return NextResponse.json({ success: true, data: organization });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get organizations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    let query = db.select().from(organizations);
    const conditions: any[] = [];

    if (type) {
      conditions.push(eq(organizations.type, type as any));
    }

    if (status) {
      conditions.push(eq(organizations.subscriptionStatus, status as any));
    }

    if (search) {
      conditions.push(
        or(
          like(organizations.name, `%${search}%`),
          like(organizations.displayName, `%${search}%`),
          like(organizations.contactEmail, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      const { and } = await import('drizzle-orm');
      query = query.where(and(...conditions)) as any;
    }

    const allOrganizations = await query.orderBy(desc(organizations.createdAt));

    // Parse JSON fields
    const parsed = allOrganizations.map((org) => ({
      ...org,
      settings: org.settings ? JSON.parse(org.settings) : null,
      metadata: org.metadata ? JSON.parse(org.metadata) : null
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
