import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorIntegrations, integrationProjects, distributors } from '@/lib/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

type RouteCtx = { params: Promise<{ id: string }> };

async function assertDistributor(distributorId: number, tenantId: number | undefined) {
  const [row] = await db
    .select({ id: distributors.id })
    .from(distributors)
    .where(and(eq(distributors.id, distributorId), tenantFilter(distributors.tenantId, tenantId)));
  return !!row;
}

/** GET — 회원의 연결 목록 + 프로젝트 조인 */
export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;
    const distributorId = parseInt(id, 10);
    if (Number.isNaN(distributorId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }
    if (!(await assertDistributor(distributorId, tenantId))) {
      return NextResponse.json({ success: false, error: 'distributor not found' }, { status: 404 });
    }

    const rows = await db
      .select({
        link: distributorIntegrations,
        project: {
          id: integrationProjects.id,
          key: integrationProjects.key,
          name: integrationProjects.name,
          baseUrl: integrationProjects.baseUrl,
          brandColor: integrationProjects.brandColor,
          logoUrl: integrationProjects.logoUrl,
          isEnabled: integrationProjects.isEnabled,
        },
      })
      .from(distributorIntegrations)
      .innerJoin(integrationProjects, eq(distributorIntegrations.projectId, integrationProjects.id))
      .where(
        and(
          eq(distributorIntegrations.distributorId, distributorId),
          tenantFilter(distributorIntegrations.tenantId, tenantId),
        ),
      )
      .orderBy(asc(integrationProjects.sortOrder));

    const integrations = rows.map((r) => ({
      ...r.link,
      project: r.project,
    }));

    return NextResponse.json({ success: true, integrations });
  } catch (error) {
    console.error('[distrib-integrations] GET error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

/** POST — 새 연결 추가 */
export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;
    const distributorId = parseInt(id, 10);
    if (Number.isNaN(distributorId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }
    if (!(await assertDistributor(distributorId, tenantId))) {
      return NextResponse.json({ success: false, error: 'distributor not found' }, { status: 404 });
    }

    const body = await request.json();
    const { projectId, externalId, externalUrl, role, isPublic } = body ?? {};

    if (!projectId || !externalId) {
      return NextResponse.json(
        { success: false, error: 'projectId, externalId는 필수입니다.' },
        { status: 400 },
      );
    }

    // 프로젝트 존재·활성 확인
    const [project] = await db
      .select()
      .from(integrationProjects)
      .where(
        and(
          eq(integrationProjects.id, Number(projectId)),
          tenantFilter(integrationProjects.tenantId, tenantId),
        ),
      );
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'project not found' },
        { status: 404 },
      );
    }

    try {
      const [created] = await db
        .insert(distributorIntegrations)
        .values({
          tenantId: tenantId ?? 1,
          distributorId,
          projectId: Number(projectId),
          externalId: String(externalId).trim(),
          externalUrl: externalUrl ?? null,
          role: role ?? null,
          isPublic: Boolean(isPublic ?? false),
          syncStatus: 'pending',
        })
        .returning();

      return NextResponse.json(
        { success: true, integration: { ...created, project } },
        { status: 201 },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      const cause = e instanceof Error && e.cause instanceof Error ? e.cause.message : '';
      if (`${msg} ${cause}`.match(/UNIQUE|unique|SQLITE_CONSTRAINT/)) {
        return NextResponse.json(
          { success: false, error: '이 회원은 해당 프로젝트에 이미 연결되어 있습니다.' },
          { status: 409 },
        );
      }
      throw e;
    }
  } catch (error) {
    console.error('[distrib-integrations] POST error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
