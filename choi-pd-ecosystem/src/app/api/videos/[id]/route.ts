import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';
import { logger } from '@/lib/logger';
import { Storage } from '@google-cloud/storage';
import { unlink } from 'fs/promises';
import path from 'path';

/**
 * GET /api/videos/[id]
 * Get video details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;    const videoId = parseInt(id);

    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), tenantFilter(videos.tenantId, tenantId)));

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
      .where(and(eq(videos.id, videoId), tenantFilter(videos.tenantId, tenantId)));

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;    const videoId = parseInt(id);
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
      .where(and(eq(videos.id, videoId), tenantFilter(videos.tenantId, tenantId)))
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
 * Delete storage files associated with a video.
 * Supports GCS (when GCS_BUCKET_NAME is set) and local public/ directory.
 * Failures are logged as warnings — DB deletion proceeds regardless.
 */
async function deleteStorageFiles(fileUrls: (string | null)[]): Promise<void> {
  const urls = fileUrls.filter((u): u is string => !!u);
  if (urls.length === 0) return;

  const gcsBucket = process.env.GCS_BUCKET_NAME;

  for (const url of urls) {
    try {
      if (gcsBucket && url.includes('storage.googleapis.com')) {
        // GCS file: extract object path from URL
        // URL format: https://storage.googleapis.com/BUCKET/path/to/file
        const gcsPrefix = `https://storage.googleapis.com/${gcsBucket}/`;
        if (url.startsWith(gcsPrefix)) {
          const objectPath = url.slice(gcsPrefix.length);
          const storage = new Storage();
          await storage.bucket(gcsBucket).file(objectPath).delete({ ignoreNotFound: true });
          logger.info('GCS file deleted', { objectPath });
        } else {
          logger.warn('GCS URL does not match bucket, skipping', { url, gcsBucket });
        }
      } else if (url.startsWith('/')) {
        // Local file in public/ directory
        const filePath = path.join(process.cwd(), 'public', url);
        await unlink(filePath);
        logger.info('Local file deleted', { filePath });
      } else {
        logger.warn('Unknown storage URL scheme, skipping', { url });
      }
    } catch (err) {
      logger.warn('Failed to delete storage file', {
        url,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

/**
 * DELETE /api/videos/[id]
 * Delete video and associated storage files
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { id } = await params;
    const videoId = parseInt(id);

    // Fetch video record to get file URLs before deletion
    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), tenantFilter(videos.tenantId, tenantId)));

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete storage files (best-effort, failures are logged as warnings)
    await deleteStorageFiles([
      video.hlsUrl,
      video.dashUrl,
      video.mp4Url,
      video.thumbnailUrl,
    ]);

    await db.delete(videos).where(and(eq(videos.id, videoId), tenantFilter(videos.tenantId, tenantId)));

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting video', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
