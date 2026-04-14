import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyticsEvents, tenants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface TrackPayload {
  tenantSlug: string;
  eventType: 'view' | 'share' | 'contact';
  platform?: string;        // 'kakao' | 'link' | 'sms' | 'native_share' | 'copy' ...
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<TrackPayload>;

    const { tenantSlug, eventType, platform, metadata } = body;

    if (!tenantSlug || !eventType) {
      return NextResponse.json(
        { ok: false, error: 'tenantSlug and eventType are required' },
        { status: 400 }
      );
    }

    if (!['view', 'share', 'contact'].includes(eventType)) {
      return NextResponse.json(
        { ok: false, error: 'eventType must be view | share | contact' },
        { status: 400 }
      );
    }

    // tenantId 조회
    const tenantRows = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.status, 'active')))
      .limit(1);

    if (tenantRows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'tenant not found' },
        { status: 404 }
      );
    }

    const tenantId = tenantRows[0].id;

    // 이벤트 이름 / 카테고리 매핑
    const eventNameMap: Record<string, string> = {
      view: 'profile_view',
      share: 'profile_share',
      contact: 'profile_contact',
    };
    const eventCategoryMap: Record<string, string> = {
      view: 'engagement',
      share: 'virality',
      contact: 'conversion',
    };

    const metadataObj: Record<string, unknown> = { ...(metadata ?? {}) };
    if (platform) metadataObj.platform = platform;

    // UA / referrer (optional)
    const userAgent = req.headers.get('user-agent') ?? undefined;
    const referrer = req.headers.get('referer') ?? undefined;
    const pagePath = `/p/${tenantSlug}`;

    await db.insert(analyticsEvents).values({
      tenantId,
      userType: 'anonymous',
      eventName: eventNameMap[eventType],
      eventCategory: eventCategoryMap[eventType],
      eventAction: eventType,
      eventLabel: platform ?? null,
      pagePath,
      referrer: referrer ?? null,
      userAgent: userAgent ?? null,
      metadata: JSON.stringify(metadataObj),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[analytics/track] error:', err);
    return NextResponse.json(
      { ok: false, error: 'internal server error' },
      { status: 500 }
    );
  }
}
