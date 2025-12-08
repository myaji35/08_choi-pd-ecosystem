import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationBranding } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Generate CSS variables from branding
function generateCssVariables(branding: any): string {
  return `
:root {
  --primary-color: ${branding.primaryColor || '#3b82f6'};
  --secondary-color: ${branding.secondaryColor || '#8b5cf6'};
  --accent-color: ${branding.accentColor || '#10b981'};
  --font-family: ${branding.fontFamily || 'Inter'}, sans-serif;
}
  `.trim();
}

// Get organization branding
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const orgId = parseInt(id);

    const [branding] = await db.select()
      .from(organizationBranding)
      .where(eq(organizationBranding.organizationId, orgId));

    if (!branding) {
      return NextResponse.json(
        { success: false, error: 'Branding not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields and generate CSS
    const parsed = {
      ...branding,
      metadata: branding.metadata ? JSON.parse(branding.metadata) : null,
      generatedCss: generateCssVariables(branding)
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update organization branding
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const orgId = parseInt(id);
    const body = await request.json();

    const {
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      customCss,
      customDomain,
      emailTemplateHeader,
      emailTemplateFooter,
      footerText,
      loginPageMessage,
      dashboardWelcomeMessage,
      metadata
    } = body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (fontFamily !== undefined) updateData.fontFamily = fontFamily;
    if (customCss !== undefined) updateData.customCss = customCss;
    if (customDomain !== undefined) updateData.customDomain = customDomain;
    if (emailTemplateHeader !== undefined) updateData.emailTemplateHeader = emailTemplateHeader;
    if (emailTemplateFooter !== undefined) updateData.emailTemplateFooter = emailTemplateFooter;
    if (footerText !== undefined) updateData.footerText = footerText;
    if (loginPageMessage !== undefined) updateData.loginPageMessage = loginPageMessage;
    if (dashboardWelcomeMessage !== undefined) updateData.dashboardWelcomeMessage = dashboardWelcomeMessage;
    if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);

    const [updated] = await db.update(organizationBranding)
      .set(updateData)
      .where(eq(organizationBranding.organizationId, orgId))
      .returning();

    // Parse JSON fields and generate CSS
    const parsed = {
      ...updated,
      metadata: updated.metadata ? JSON.parse(updated.metadata) : null,
      generatedCss: generateCssVariables(updated)
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
