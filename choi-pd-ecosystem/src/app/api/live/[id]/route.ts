import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { liveStreams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/live/[id]
 * Get live stream details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const streamId = parseInt(id);

    const [stream] = await db
      .select()
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
      stream
    });
  } catch (error) {
    console.error('Error fetching live stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live stream' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/live/[id]
 * Update live stream
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const streamId = parseInt(id);
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.scheduledStartTime !== undefined) {
      updateData.scheduledStartTime = new Date(body.scheduledStartTime);
    }
    if (body.scheduledEndTime !== undefined) {
      updateData.scheduledEndTime = new Date(body.scheduledEndTime);
    }
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.enableChat !== undefined) updateData.enableChat = body.enableChat;
    if (body.enableRecording !== undefined) updateData.enableRecording = body.enableRecording;

    const [updatedStream] = await db
      .update(liveStreams)
      .set(updateData)
      .where(eq(liveStreams.id, streamId))
      .returning();

    if (!updatedStream) {
      return NextResponse.json(
        { success: false, error: 'Live stream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stream: updatedStream
    });
  } catch (error) {
    console.error('Error updating live stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update live stream' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/live/[id]
 * Delete live stream
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const streamId = parseInt(id);

    await db.delete(liveStreams).where(eq(liveStreams.id, streamId));

    return NextResponse.json({
      success: true,
      message: 'Live stream deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live stream:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete live stream' },
      { status: 500 }
    );
  }
}
