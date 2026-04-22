import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrationProjects } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';
import { encryptData } from '@/lib/workflows';

type RouteCtx = { params: Promise<{ id: string }> };

function sanitize<T extends { authCredential: string | null }>(row: T) {
  return { ...row, authCredential: row.authCredential ? '***encrypted***' : null };
}

export async function GET(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }

    const [row] = await db
      .select()
      .from(integrationProjects)
      .where(
        and(eq(integrationProjects.id, projectId), tenantFilter(integrationProjects.tenantId, tenantId)),
      );

    if (!row) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: sanitize(row) });
  } catch (error) {
    console.error('[integration-projects/:id] GET error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const allowed: Array<keyof typeof integrationProjects.$inferInsert> = [
      'name',
      'description',
      'baseUrl',
      'apiBaseUrl',
      'endpointTemplate',
      'authType',
      'authCredential',
      'adapterKey',
      'brandColor',
      'logoUrl',
      'isEnabled',
      'sortOrder',
    ];

    const updates: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in body) updates[k] = body[k];
    }

    // key는 변경 불가 (URL/adapter 식별자로 고정)
    if ('key' in body) {
      return NextResponse.json(
        { success: false, error: 'key는 변경할 수 없습니다. 새 프로젝트로 등록하세요.' },
        { status: 400 },
      );
    }

    // authCredential이 들어오면 암호화. 빈 문자열이나 마스킹 센티넬은 무시(기존 값 유지).
    if ('authCredential' in updates) {
      const raw = updates.authCredential;
      if (raw === null || raw === '' || raw === '***encrypted***') {
        delete updates.authCredential;
      } else if (typeof raw === 'string') {
        updates.authCredential = encryptData(raw);
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'no fields to update' }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(integrationProjects)
      .set(updates)
      .where(
        and(eq(integrationProjects.id, projectId), tenantFilter(integrationProjects.tenantId, tenantId)),
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: sanitize(updated) });
  } catch (error) {
    console.error('[integration-projects/:id] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ success: false, error: 'invalid id' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(integrationProjects)
      .where(
        and(eq(integrationProjects.id, projectId), tenantFilter(integrationProjects.tenantId, tenantId)),
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[integration-projects/:id] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
