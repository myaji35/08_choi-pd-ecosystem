import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/videos/[id]
 * Get video details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id);

    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db
      .update(videos)
      .set({
        viewCount: video.viewCount + 1
      })
      .where(eq(videos.id, videoId));

    return NextResponse.json({
      success: true,
      video: {
        ...video,
        viewCount: video.viewCount + 1
      }
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/videos/[id]
 * Update video
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id);
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.processingProgress !== undefined) {
      updateData.processingProgress = body.processingProgress;
    }
    if (body.hlsUrl !== undefined) updateData.hlsUrl = body.hlsUrl;
    if (body.dashUrl !== undefined) updateData.dashUrl = body.dashUrl;
    if (body.mp4Url !== undefined) updateData.mp4Url = body.mp4Url;
    if (body.resolutions !== undefined) {
      updateData.resolutions = JSON.stringify(body.resolutions);
    }
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.allowDownload !== undefined) updateData.allowDownload = body.allowDownload;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.category !== undefined) updateData.category = body.category;

    const [updatedVideo] = await db
      .update(videos)
      .set(updateData)
      .where(eq(videos.id, videoId))
      .returning();

    if (!updatedVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      video: updatedVideo
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/videos/[id]
 * Delete video
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id);

    // TODO: Delete actual video files from storage
    // - HLS segments
    // - DASH segments
    // - MP4 file
    // - Thumbnails

    await db.delete(videos).where(eq(videos.id, videoId));

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
