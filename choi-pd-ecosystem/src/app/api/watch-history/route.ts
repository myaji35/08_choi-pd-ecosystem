import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { watchHistory, videos } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getWatchHistory } from '@/lib/video';

/**
 * GET /api/watch-history
 * Get watch history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType') || 'customer';
    const completedOnly = searchParams.get('completedOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const history = await getWatchHistory({
      userId,
      userType: userType as any,
      completedOnly,
      limit
    });

    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch watch history' },
      { status: 500 }
    );
  }
}
