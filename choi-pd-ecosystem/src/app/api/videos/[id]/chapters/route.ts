import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videoChapters } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { addVideoChapter } from '@/lib/video';

/**
 * GET /api/videos/[id]/chapters
 * Get all chapters for a video
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id);

    const chapters = await db
      .select()
      .from(videoChapters)
      .where(eq(videoChapters.videoId, videoId))
      .orderBy(asc(videoChapters.order));

    return NextResponse.json({
      success: true,
      chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos/[id]/chapters
 * Add a chapter to a video
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id);
    const body = await request.json();
    const {
      title,
      startTime,
      endTime,
      thumbnailUrl,
      order
    } = body;

    // Validation
    if (!title || startTime === undefined || endTime === undefined || order === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    const chapter = await addVideoChapter({
      videoId,
      title,
      startTime: parseInt(startTime),
      endTime: parseInt(endTime),
      thumbnailUrl,
      order: parseInt(order)
    });

    return NextResponse.json({
      success: true,
      chapter
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding chapter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add chapter' },
      { status: 500 }
    );
  }
}
