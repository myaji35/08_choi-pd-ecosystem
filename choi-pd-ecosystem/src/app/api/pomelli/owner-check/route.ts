import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { tenants, tenantMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/auth/session';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ isOwner: false });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  let sessionUserId: string | null = null;
  if (sessionCookie) {
    try {
      const session = await verifySessionToken(sessionCookie);
      if (session?.userId) {
        sessionUserId = String(session.userId);
      }
    } catch {
      // 세션 파싱 실패 무시
    }
  }
  if (!sessionUserId && isDevMode) {
    sessionUserId = 'dev_user';
  }

  if (!sessionUserId) {
    return NextResponse.json({ isOwner: false });
  }

  const tenant = await db
    .select({ id: tenants.id, clerkUserId: tenants.clerkUserId })
    .from(tenants)
    .where(and(eq(tenants.slug, slug), eq(tenants.status, 'active')))
    .get();

  if (!tenant) {
    return NextResponse.json({ isOwner: false });
  }

  if (tenant.clerkUserId && tenant.clerkUserId === sessionUserId) {
    return NextResponse.json({ isOwner: true });
  }

  const membership = await db
    .select({ id: tenantMembers.id })
    .from(tenantMembers)
    .where(
      and(
        eq(tenantMembers.tenantId, tenant.id),
        eq(tenantMembers.clerkUserId, sessionUserId),
        eq(tenantMembers.role, 'owner')
      )
    )
    .get();

  return NextResponse.json({ isOwner: !!membership });
}
