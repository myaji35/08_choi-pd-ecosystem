import { NextRequest, NextResponse } from 'next/server';
import { startLiveStream } from '@/lib/video';

/**
 * POST /api/live/[id]/start
 * Start a live stream
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const streamId = parseInt(id);

    await startLiveStream(streamId);

    return NextResponse.json({
      success: true,
      message: 'Live stream started'
    });
  } catch (error) {
    console.error('Error starting live stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start live stream' },
      { status: 500 }
    );
  }
}
