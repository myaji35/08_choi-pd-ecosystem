import { NextRequest, NextResponse } from 'next/server';
import { getChannels } from '@/lib/sns/social-pulse-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') ?? undefined;

  const channels = await getChannels(platform);
  return NextResponse.json({ channels });
}
