import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getTowninGraphAuthUrl } from '@/lib/auth/oauth';

export async function GET() {
  const state = nanoid();
  const url = getTowninGraphAuthUrl(state);
  return NextResponse.redirect(url);
}
