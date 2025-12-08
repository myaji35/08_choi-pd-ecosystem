import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ssoConfigurations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Get SSO configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = parseInt(params.id);

    const [ssoConfig] = await db.select()
      .from(ssoConfigurations)
      .where(eq(ssoConfigurations.organizationId, orgId));

    if (!ssoConfig) {
      return NextResponse.json(
        { success: false, error: 'SSO configuration not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields and redact sensitive data
    const parsed = {
      ...ssoConfig,
      attributeMapping: ssoConfig.attributeMapping ? JSON.parse(ssoConfig.attributeMapping) : null,
      metadata: ssoConfig.metadata ? JSON.parse(ssoConfig.metadata) : null,
      // Redact secrets in response
      oauthClientSecret: ssoConfig.oauthClientSecret ? '***REDACTED***' : null,
      ldapBindPassword: ssoConfig.ldapBindPassword ? '***REDACTED***' : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching SSO config:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Create or update SSO configuration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = parseInt(params.id);
    const body = await request.json();

    const {
      provider,
      providerName,
      isEnabled,
      samlEntityId,
      samlSsoUrl,
      samlX509Certificate,
      samlSignRequests,
      oauthClientId,
      oauthClientSecret,
      oauthAuthorizationUrl,
      oauthTokenUrl,
      oauthUserInfoUrl,
      oauthScopes,
      ldapServerUrl,
      ldapBindDn,
      ldapBindPassword,
      ldapBaseDn,
      ldapUserFilter,
      attributeMapping,
      defaultRole,
      autoProvision,
      metadata
    } = body;

    // Validation
    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider is required' },
        { status: 400 }
      );
    }

    // Check if SSO config already exists
    const existing = await db.select()
      .from(ssoConfigurations)
      .where(eq(ssoConfigurations.organizationId, orgId));

    const configData: any = {
      organizationId: orgId,
      provider,
      providerName: providerName || null,
      isEnabled: isEnabled || false,
      samlEntityId: samlEntityId || null,
      samlSsoUrl: samlSsoUrl || null,
      samlX509Certificate: samlX509Certificate || null,
      samlSignRequests: samlSignRequests || false,
      oauthClientId: oauthClientId || null,
      oauthClientSecret: oauthClientSecret || null,
      oauthAuthorizationUrl: oauthAuthorizationUrl || null,
      oauthTokenUrl: oauthTokenUrl || null,
      oauthUserInfoUrl: oauthUserInfoUrl || null,
      oauthScopes: oauthScopes || null,
      ldapServerUrl: ldapServerUrl || null,
      ldapBindDn: ldapBindDn || null,
      ldapBindPassword: ldapBindPassword || null,
      ldapBaseDn: ldapBaseDn || null,
      ldapUserFilter: ldapUserFilter || null,
      attributeMapping: attributeMapping ? JSON.stringify(attributeMapping) : null,
      defaultRole: defaultRole || 'member',
      autoProvision: autoProvision !== undefined ? autoProvision : true,
      metadata: metadata ? JSON.stringify(metadata) : null,
      updatedAt: new Date()
    };

    let result;
    if (existing.length > 0) {
      // Update
      [result] = await db.update(ssoConfigurations)
        .set(configData)
        .where(eq(ssoConfigurations.organizationId, orgId))
        .returning();
    } else {
      // Insert
      [result] = await db.insert(ssoConfigurations)
        .values(configData)
        .returning();
    }

    // Parse JSON fields and redact sensitive data
    const parsed = {
      ...result,
      attributeMapping: result.attributeMapping ? JSON.parse(result.attributeMapping) : null,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
      oauthClientSecret: result.oauthClientSecret ? '***REDACTED***' : null,
      ldapBindPassword: result.ldapBindPassword ? '***REDACTED***' : null
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error saving SSO config:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
