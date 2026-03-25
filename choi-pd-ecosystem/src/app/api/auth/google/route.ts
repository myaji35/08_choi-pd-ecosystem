import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getGoogleAuthUrl } from '@/lib/auth/oauth';

export async function GET() {
  const state = nanoid();
  const url = getGoogleAuthUrl(state);
  return NextResponse.redirect(url);
}
