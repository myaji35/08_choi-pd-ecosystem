import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  distributorIntegrations,
  integrationProjects,
  type IntegrationProject,
} from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';
import { fetchSnapshot } from '@/lib/integrations/fetch-snapshot';

type RouteCtx = { params: Promise<{ id: string; linkId: string }> };

/** POST — 실시간 테스트 호출 + 스냅샷 캐시 저장 */
export async function POST(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const p = await params;
    const distributorId = parseInt(p.id, 10);
    const linkId = parseInt(p.linkId, 10);
    if (Number.isNaN(distributorId) || Number.isNaN(linkId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }

    const [row] = await db
      .select({
        link: distributorIntegrations,
        project: integrationProjects,
      })
      .from(distributorIntegrations)
      .innerJoin(
        integrationProjects,
        eq(distributorIntegrations.projectId, integrationProjects.id),
      )
      .where(
        and(
          eq(distributorIntegrations.id, linkId),
          eq(distributorIntegrations.distributorId, distributorId),
          tenantFilter(distributorIntegrations.tenantId, tenantId),
        ),
      );

    if (!row) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }

    const result = await fetchSnapshot(
      row.project as IntegrationProject,
      row.link.externalId,
      'test',
    );

    const now = new Date();
    if (result.ok && result.snapshot) {
      await db
        .update(distributorIntegrations)
        .set({
          lastSnapshotJson: JSON.stringify(result.snapshot),
          lastSyncedAt: now,
          syncStatus: 'ok',
          syncError: null,
          updatedAt: now,
        })
        .where(eq(distributorIntegrations.id, linkId));
    } else {
      await db
        .update(distributorIntegrations)
        .set({
          lastSyncedAt: now,
          syncStatus: 'error',
          syncError: result.error?.slice(0, 500) ?? 'unknown',
          updatedAt: now,
        })
        .where(eq(distributorIntegrations.id, linkId));
    }

    return NextResponse.json({
      success: result.ok,
      httpStatus: result.status,
      durationMs: result.durationMs,
      snapshot: result.snapshot ?? null,
      error: result.error ?? null,
      rawSample: result.raw ?? null,
    });
  } catch (error) {
    console.error('[distrib-integrations/test] error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
