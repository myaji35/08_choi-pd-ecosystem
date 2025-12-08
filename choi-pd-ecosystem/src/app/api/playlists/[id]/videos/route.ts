import { NextRequest, NextResponse } from 'next/server';
import { addVideoToPlaylist, removeVideoFromPlaylist } from '@/lib/video';

/**
 * POST /api/playlists/[id]/videos
 * Add a video to a playlist
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = parseInt(params.id);
    const body = await request.json();
    const { videoId, order } = body;

    // Validation
    if (!videoId || order === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await addVideoToPlaylist({
      playlistId,
      videoId: parseInt(videoId),
      order: parseInt(order)
    });

    return NextResponse.json({
      success: true,
      message: 'Video added to playlist'
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add video to playlist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/playlists/[id]/videos
 * Remove a video from a playlist
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Missing videoId parameter' },
        { status: 400 }
      );
    }

    const playlistVideoId = parseInt(videoId);

    await removeVideoFromPlaylist(playlistVideoId);

    return NextResponse.json({
      success: true,
      message: 'Video removed from playlist'
    });
  } catch (error) {
    console.error('Error removing video from playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove video from playlist' },
      { status: 500 }
    );
  }
}
