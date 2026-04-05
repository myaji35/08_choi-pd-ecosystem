import { NextRequest, NextResponse } from 'next/server';
import { getChannels } from '@/lib/sns/social-pulse-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') ?? undefined;

    const channels = await getChannels(platform);
    return NextResponse.json({ channels });
  } catch (error) {
    console.error('[SNS_CHANNELS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
