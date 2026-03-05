import { NextRequest, NextResponse } from 'next/server';
import { publishToSocialPulse } from '@/lib/sns/social-pulse-client';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { platform, content, imageUrl, videoUrl, link, scheduledAt, mockMode } = body as {
    platform?: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    link?: string;
    scheduledAt?: string;
    mockMode?: boolean;
  };

  if (!content?.trim()) {
    return NextResponse.json({ error: 'content는 필수입니다.' }, { status: 400 });
  }

  const result = await publishToSocialPulse({
    platform,
    content: content.trim(),
    imageUrl,
    videoUrl,
    link,
    scheduledAt,
    mockMode,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
