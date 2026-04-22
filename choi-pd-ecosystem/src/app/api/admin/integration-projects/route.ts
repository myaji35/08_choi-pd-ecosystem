import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationProjects } from '@/lib/db/schema';
import { and, asc, desc, eq, type SQL } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';
import { encryptData } from '@/lib/workflows';

/**
 * GET /api/admin/integration-projects
 * 등록된 통합 프로젝트 목록 (Townin/CertiGraph/InsureGraph 등).
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const isEnabled = searchParams.get('isEnabled');

    const conditions: SQL[] = [tenantFilter(integrationProjects.tenantId, tenantId)];
    if (isEnabled !== null) {
      conditions.push(eq(integrationProjects.isEnabled, isEnabled === 'true'));
    }

    const rows = await db
      .select()
      .from(integrationProjects)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(integrationProjects.sortOrder), desc(integrationProjects.createdAt));

    const sanitized = rows.map((r) => ({
      ...r,
      authCredential: r.authCredential ? '***encrypted***' : null,
    }));

    return NextResponse.json({ success: true, projects: sanitized });
  } catch (error) {
    console.error('[integration-projects] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list integration projects' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/integration-projects
 * 새 프로젝트 등록.
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const {
      key,
      name,
      description,
      baseUrl,
      apiBaseUrl,
      endpointTemplate,
      authType,
      authCredential,
      adapterKey,
      brandColor,
      logoUrl,
      isEnabled,
      sortOrder,
    } = body ?? {};

    if (!key || !name || !baseUrl) {
      return NextResponse.json(
        { success: false, error: 'key, name, baseUrl는 필수입니다.' },
        { status: 400 },
      );
    }

    const rawKey = String(key).trim();
    if (!/^[a-z0-9-]{2,32}$/.test(rawKey)) {
      return NextResponse.json(
        { success: false, error: 'key는 영소문자/숫자/하이픈 2~32자여야 합니다.' },
        { status: 400 },
      );
    }
    const normalizedKey = rawKey;

    const validAuthTypes = ['none', 'api_key', 'bearer', 'oauth2'];
    const finalAuthType = authType && validAuthTypes.includes(authType) ? authType : 'none';

    const encryptedCred =
      authCredential && finalAuthType !== 'none' ? encryptData(String(authCredential)) : null;

    const [created] = await db
      .insert(integrationProjects)
      .values({
        tenantId,
        key: normalizedKey,
        name,
        description: description ?? null,
        baseUrl,
        apiBaseUrl: apiBaseUrl ?? null,
        endpointTemplate: endpointTemplate ?? '/api/integrations/public/{external_id}',
        authType: finalAuthType as 'none' | 'api_key' | 'bearer' | 'oauth2',
        authCredential: encryptedCred,
        adapterKey: adapterKey ?? null,
        brandColor: brandColor ?? null,
        logoUrl: logoUrl ?? null,
        isEnabled: isEnabled ?? true,
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        project: { ...created, authCredential: created.authCredential ? '***encrypted***' : null },
      },
      { status: 201 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown';
    const causeMsg =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : '';
    const fullMsg = `${msg} ${causeMsg}`;
    console.error('[integration-projects] POST error:', msg, causeMsg);
    if (
      fullMsg.includes('UNIQUE') ||
      fullMsg.includes('unique') ||
      fullMsg.includes('SQLITE_CONSTRAINT')
    ) {
      return NextResponse.json(
        { success: false, error: '이미 같은 key가 등록되어 있습니다.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create integration project' },
      { status: 500 },
    );
  }
}
