import { NextRequest, NextResponse } from 'next/server';
import { getVideoAnalytics } from '@/lib/video';

/**
 * GET /api/videos/[id]/analytics
 * Get video analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;    const videoId = parseInt(id);

    const analytics = await getVideoAnalytics(videoId);

    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
