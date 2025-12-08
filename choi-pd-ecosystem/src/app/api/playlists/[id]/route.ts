import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videoPlaylists, playlistVideos, videos } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

/**
 * GET /api/playlists/[id]
 * Get playlist details with videos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const playlistId = parseInt(id);

    // Get playlist
    const [playlist] = await db
      .select()
      .from(videoPlaylists)
      .where(eq(videoPlaylists.id, playlistId));

    if (!playlist) {
      return NextResponse.json(
        { success: false, error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Get videos in playlist
    const playlistItems = await db
      .select({
        id: playlistVideos.id,
        videoId: playlistVideos.videoId,
        order: playlistVideos.order,
        addedAt: playlistVideos.addedAt,
        video: videos
      })
      .from(playlistVideos)
      .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
      .where(eq(playlistVideos.playlistId, playlistId))
      .orderBy(asc(playlistVideos.order));

    return NextResponse.json({
      success: true,
      playlist: {
        ...playlist,
        videos: playlistItems
      }
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/playlists/[id]
 * Update playlist
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const playlistId = parseInt(id);
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;

    const [updatedPlaylist] = await db
      .update(videoPlaylists)
      .set(updateData)
      .where(eq(videoPlaylists.id, playlistId))
      .returning();

    if (!updatedPlaylist) {
      return NextResponse.json(
        { success: false, error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/playlists/[id]
 * Delete playlist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const playlistId = parseInt(id);

    await db.delete(videoPlaylists).where(eq(videoPlaylists.id, playlistId));

    return NextResponse.json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
