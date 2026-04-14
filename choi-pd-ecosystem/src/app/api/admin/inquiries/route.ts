import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/guards';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/inquiries?status=pending&type=b2b */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const tenantId = getTenantIdFromRequest(request);
  const status = request.nextUrl.searchParams.get('status');
  const type = request.nextUrl.searchParams.get('type');

  const filters = [tenantFilter(inquiries.tenantId, tenantId)];
  if (status) filters.push(eq(inquiries.status, status as 'pending' | 'contacted' | 'closed'));
  if (type) filters.push(eq(inquiries.type, type as 'b2b' | 'contact'));

  const rows = await db
    .select()
    .from(inquiries)
    .where(and(...filters))
    .orderBy(desc(inquiries.createdAt))
    .all();

  return NextResponse.json({ success: true, inquiries: rows });
}

/** PATCH /api/admin/inquiries — 상태 업데이트 (body: { id, status, note? }) */
export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json();
  const id = Number(body.id);
  const status = body.status as 'pending' | 'contacted' | 'closed' | undefined;

  if (!Number.isFinite(id) || !status) {
    return NextResponse.json({ success: false, error: 'id and status required' }, { status: 400 });
  }

  const tenantId = getTenantIdFromRequest(request);
  const result = await db
    .update(inquiries)
    .set({ status })
    .where(and(eq(inquiries.id, id), tenantFilter(inquiries.tenantId, tenantId)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, inquiry: result[0] });
}
