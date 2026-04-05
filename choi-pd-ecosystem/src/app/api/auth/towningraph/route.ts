import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getTowninGraphAuthUrl } from '@/lib/auth/oauth';

export async function GET() {
  try {
    const state = nanoid();
    const url = getTowninGraphAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('[AUTH_TOWNINGRAPH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
