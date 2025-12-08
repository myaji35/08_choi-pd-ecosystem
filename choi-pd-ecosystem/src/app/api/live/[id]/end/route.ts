import { NextRequest, NextResponse } from 'next/server';
import { endLiveStream } from '@/lib/video';

/**
 * POST /api/live/[id]/end
 * End a live stream
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = parseInt(params.id);
    const body = await request.json();
    const { recordingUrl } = body;

    await endLiveStream(streamId, recordingUrl);

    return NextResponse.json({
      success: true,
      message: 'Live stream ended'
    });
  } catch (error) {
    console.error('Error ending live stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end live stream' },
      { status: 500 }
    );
  }
}
