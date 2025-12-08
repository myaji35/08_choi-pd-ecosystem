/**
 * Epic 21: 보안 이벤트 API
 * GET /api/admin/security/events - 보안 이벤트 조회
 * PATCH /api/admin/security/events/:id/resolve - 보안 이벤트 해결 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUnresolvedSecurityEvents } from '@/lib/security';
import { db } from '@/lib/db';
import { securityEvents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity') as 'low' | 'medium' | 'high' | 'critical' | null;

    const events = await getUnresolvedSecurityEvents(severity || undefined);

    // Parse JSON metadata
    const parsedEvents = events.map((event) => ({
      ...event,
      metadata: event.metadata ? JSON.parse(event.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      data: parsedEvents,
      count: parsedEvents.length,
    });
  } catch (error) {
    console.error('Failed to fetch security events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, resolvedBy } = body;

    if (!eventId || !resolvedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await db
      .update(securityEvents)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      })
      .where(eq(securityEvents.id, eventId));

    return NextResponse.json({
      success: true,
      message: 'Security event resolved',
    });
  } catch (error) {
    console.error('Failed to resolve security event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve security event' },
      { status: 500 }
    );
  }
}
