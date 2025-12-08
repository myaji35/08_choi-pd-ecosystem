import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { liveStreams } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { createLiveStream } from '@/lib/video';

/**
 * GET /api/live
 * List live streams
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const hostedBy = searchParams.get('hostedBy');
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = db.select().from(liveStreams);

    const conditions = [];

    if (status) {
      conditions.push(eq(liveStreams.status, status as any));
    }

    if (hostedBy) {
      conditions.push(eq(liveStreams.hostedBy, hostedBy));
    }

    if (upcoming) {
      const now = new Date();
      conditions.push(
        and(
          eq(liveStreams.status, 'scheduled'),
          gte(liveStreams.scheduledStartTime, now)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const streams = await query
      .orderBy(desc(liveStreams.scheduledStartTime))
      .limit(limit);

    return NextResponse.json({
      success: true,
      streams
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live streams' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/live
 * Create a new live stream
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      scheduledStartTime,
      scheduledEndTime,
      maxViewers = 1000,
      enableChat = true,
      enableRecording = true,
      visibility = 'public',
      hostedBy
    } = body;

    // Validation
    if (!title || !scheduledStartTime || !hostedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const stream = await createLiveStream({
      title,
      description,
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined,
      maxViewers,
      enableChat,
      enableRecording,
      visibility,
      hostedBy
    });

    return NextResponse.json({
      success: true,
      stream
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating live stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create live stream' },
      { status: 500 }
    );
  }
}
