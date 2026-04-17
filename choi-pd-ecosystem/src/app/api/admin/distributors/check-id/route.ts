import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors, members } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';
import { validateSlug, suggestSlug } from '@/lib/distributors/slug';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const raw = url.searchParams.get('id') || '';
  const emailForSuggest = url.searchParams.get('email');
  const nameForSuggest = url.searchParams.get('name');
  const suggest = url.searchParams.get('suggest') === '1';

  const tenantId = getTenantIdFromRequest(request);

  // 제안 모드
  if (suggest) {
    const base = suggestSlug({ email: emailForSuggest, name: nameForSuggest });
    if (!base) {
      return NextResponse.json({ success: true, suggestion: null });
    }
    // 충돌 없는 slug 찾기 (base → base-2 → base-3 …)
    const cand = await findAvailable(base, tenantId, 20);
    return NextResponse.json({ success: true, suggestion: cand });
  }

  const check = validateSlug(raw);
  if (!check.ok) {
    return NextResponse.json({
      success: true,
      available: false,
      reason: check.reason,
      normalized: raw.trim().toLowerCase(),
    });
  }

  const slug = check.normalized;
  const [dupDist, dupMember] = await Promise.all([
    db.select({ id: distributors.id }).from(distributors)
      .where(and(tenantFilter(distributors.tenantId, tenantId), eq(distributors.slug, slug)))
      .get(),
    db.select({ id: members.id }).from(members)
      .where(eq(members.slug, slug))
      .get(),
  ]);

  if (dupDist || dupMember) {
    return NextResponse.json({
      success: true,
      available: false,
      reason: '이미 사용 중인 ID입니다',
      normalized: slug,
    });
  }

  return NextResponse.json({
    success: true,
    available: true,
    normalized: slug,
    url: `/member/${slug}`,
    adminUrl: `/admin/distributors/${slug}`,
  });
}

async function findAvailable(base: string, tenantId: number, maxTries = 20): Promise<string> {
  for (let i = 0; i < maxTries; i++) {
    const cand = i === 0 ? base : `${base}-${i + 1}`;
    const v = validateSlug(cand);
    if (!v.ok) continue;
    const [dDist, dMember] = await Promise.all([
      db.select({ id: distributors.id }).from(distributors)
        .where(and(tenantFilter(distributors.tenantId, tenantId), eq(distributors.slug, v.normalized))).get(),
      db.select({ id: members.id }).from(members).where(eq(members.slug, v.normalized)).get(),
    ]);
    if (!dDist && !dMember) return v.normalized;
  }
  return base;
}
