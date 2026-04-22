import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorIntegrations } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

type RouteCtx = { params: Promise<{ id: string; linkId: string }> };

function parseIds(p: { id: string; linkId: string }) {
  const distributorId = parseInt(p.id, 10);
  const linkId = parseInt(p.linkId, 10);
  return { distributorId, linkId };
}

/** PATCH — isPublic / externalUrl / role 등 수정 */
export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const p = await params;
    const { distributorId, linkId } = parseIds(p);
    if (Number.isNaN(distributorId) || Number.isNaN(linkId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const allowed: Array<keyof typeof distributorIntegrations.$inferInsert> = [
      'externalId',
      'externalUrl',
      'role',
      'isPublic',
    ];
    const updates: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in body) updates[k] = body[k];
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'no fields to update' }, { status: 400 });
    }
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(distributorIntegrations)
      .set(updates)
      .where(
        and(
          eq(distributorIntegrations.id, linkId),
          eq(distributorIntegrations.distributorId, distributorId),
          tenantFilter(distributorIntegrations.tenantId, tenantId),
        ),
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, integration: updated });
  } catch (error) {
    console.error('[distrib-integrations/linkId] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

/** DELETE — 연결 해제 */
export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const p = await params;
    const { distributorId, linkId } = parseIds(p);
    if (Number.isNaN(distributorId) || Number.isNaN(linkId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(distributorIntegrations)
      .where(
        and(
          eq(distributorIntegrations.id, linkId),
          eq(distributorIntegrations.distributorId, distributorId),
          tenantFilter(distributorIntegrations.tenantId, tenantId),
        ),
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[distrib-integrations/linkId] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
