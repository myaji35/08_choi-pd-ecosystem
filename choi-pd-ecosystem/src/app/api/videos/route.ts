import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { eq, desc, and, or, like, type SQL } from 'drizzle-orm';
import { createVideo } from '@/lib/video';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

/**
 * GET /api/videos
 * List videos with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions: SQL[] = [tenantFilter(videos.tenantId, tenantId)];

    if (courseId) {
      conditions.push(eq(videos.courseId, parseInt(courseId)));
    }

    if (status) {
      conditions.push(eq(videos.status, status as 'uploading' | 'processing' | 'ready' | 'failed' | 'archived'));
    }

    if (visibility) {
      conditions.push(eq(videos.visibility, visibility as 'public' | 'unlisted' | 'private' | 'members_only'));
    }

    if (category) {
      conditions.push(eq(videos.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(videos.title, `%${search}%`),
          like(videos.description, `%${search}%`)
        )!
      );
    }

    const allVideos = await db.select().from(videos)
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      videos: allVideos,
      pagination: {
        limit,
        offset,
        total: allVideos.length
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos
 * Create a new video (initiate upload)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      courseId,
      originalFileName,
      fileSize,
      duration,
      visibility = 'public',
      uploadedBy
    } = body;

    // Validation
    if (!title || !originalFileName || !fileSize || !duration || !uploadedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create video record
    const video = await createVideo({
      title,
      description,
      courseId: courseId ? parseInt(courseId) : undefined,
      originalFileName,
      fileSize: parseInt(fileSize),
      duration: parseInt(duration),
      visibility,
      uploadedBy
    });

    return NextResponse.json({
      success: true,
      video
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
