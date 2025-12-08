import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videoPlaylists } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createPlaylist } from '@/lib/video';

/**
 * GET /api/playlists
 * List playlists
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get('createdBy');
    const visibility = searchParams.get('visibility');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = db.select().from(videoPlaylists);

    if (createdBy) {
      query = query.where(eq(videoPlaylists.createdBy, createdBy));
    }

    if (visibility) {
      query = query.where(eq(videoPlaylists.visibility, visibility as any));
    }

    const playlists = await query
      .orderBy(desc(videoPlaylists.createdAt))
      .limit(limit);

    return NextResponse.json({
      success: true,
      playlists
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/playlists
 * Create a new playlist
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      visibility = 'public',
      createdBy
    } = body;

    // Validation
    if (!name || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const playlist = await createPlaylist({
      name,
      description,
      visibility,
      createdBy
    });

    return NextResponse.json({
      success: true,
      playlist
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
