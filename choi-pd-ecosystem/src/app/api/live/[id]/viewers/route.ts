import { NextRequest, NextResponse } from 'next/server';
import { updateLiveViewers } from '@/lib/video';
import { db } from '@/lib/db';
import { liveStreams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/live/[id]/viewers
 * Get current viewer count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = parseInt(params.id);

    const [stream] = await db
      .select({
        currentViewers: liveStreams.currentViewers,
        peakViewers: liveStreams.peakViewers,
        totalViews: liveStreams.totalViews
      })
      .from(liveStreams)
      .where(eq(liveStreams.id, streamId));

    if (!stream) {
      return NextResponse.json(
        { success: false, error: 'Live stream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...stream
    });
  } catch (error) {
    console.error('Error fetching viewer count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch viewer count' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/live/[id]/viewers
 * Update viewer count (called by streaming server)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = parseInt(params.id);
    const body = await request.json();
    const { currentViewers } = body;

    if (currentViewers === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing currentViewers' },
        { status: 400 }
      );
    }

    await updateLiveViewers(streamId, parseInt(currentViewers));

    return NextResponse.json({
      success: true,
      message: 'Viewer count updated'
    });
  } catch (error) {
    console.error('Error updating viewer count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update viewer count' },
      { status: 500 }
    );
  }
}
