import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, count } from 'drizzle-orm';

// Track analytics event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      userType,
      sessionId,
      eventName,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pagePath,
      pageTitle,
      referrer,
      deviceType,
      browser,
      os,
      country,
      city,
      metadata
    } = body;

    // Basic validation
    if (!eventName || !eventCategory) {
      return NextResponse.json(
        { success: false, error: 'eventName and eventCategory are required' },
        { status: 400 }
      );
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const [event] = await db.insert(analyticsEvents).values({
      userId: userId || null,
      userType: userType || null,
      sessionId: sessionId || null,
      eventName,
      eventCategory,
      eventAction: eventAction || null,
      eventLabel: eventLabel || null,
      eventValue: eventValue || null,
      pagePath: pagePath || null,
      pageTitle: pageTitle || null,
      referrer: referrer || null,
      ipAddress,
      userAgent,
      deviceType: deviceType || null,
      browser: browser || null,
      os: os || null,
      country: country || null,
      city: city || null,
      metadata: metadata ? JSON.stringify(metadata) : null
    }).returning();

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get analytics events with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const userId = searchParams.get('userId') || undefined;
    const eventCategory = searchParams.get('eventCategory') || undefined;
    const eventName = searchParams.get('eventName') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = db.select().from(analyticsEvents);
    const conditions: any[] = [];

    if (userId) {
      conditions.push(eq(analyticsEvents.userId, userId));
    }

    if (eventCategory) {
      conditions.push(eq(analyticsEvents.eventCategory, eventCategory));
    }

    if (eventName) {
      conditions.push(eq(analyticsEvents.eventName, eventName));
    }

    if (startDate) {
      conditions.push(gte(analyticsEvents.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(analyticsEvents.createdAt, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const events = await query
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit);

    // Parse metadata
    const parsedEvents = events.map((event) => ({
      ...event,
      metadata: event.metadata ? JSON.parse(event.metadata) : null
    }));

    return NextResponse.json({ success: true, data: parsedEvents });
  } catch (error: any) {
    console.error('Error fetching analytics events:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
