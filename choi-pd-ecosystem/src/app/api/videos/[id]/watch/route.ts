import { NextRequest, NextResponse } from 'next/server';
import { updateWatchProgress } from '@/lib/video';

/**
 * POST /api/videos/[id]/watch
 * Update watch progress
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const videoId = parseInt(id);
    const body = await request.json();
    const {
      userId,
      userType = 'customer',
      position,
      duration,
      device,
      quality
    } = body;

    // Validation
    if (!userId || position === undefined || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await updateWatchProgress({
      userId,
      userType,
      videoId,
      position: parseInt(position),
      duration: parseInt(duration),
      device,
      quality
    });

    return NextResponse.json({
      success: true,
      message: 'Watch progress updated'
    });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update watch progress' },
      { status: 500 }
    );
  }
}
