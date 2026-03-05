import { NextRequest, NextResponse } from 'next/server';
import { generateCopy } from '@/lib/sns/social-pulse-client';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt, platform } = body as { prompt: string; platform?: string };

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'prompt는 필수입니다.' }, { status: 400 });
  }

  const copy = await generateCopy(prompt.trim(), platform);
  return NextResponse.json({ copy });
}
