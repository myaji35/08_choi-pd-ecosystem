import { ADMIN_ALLOWED_EMAILS } from './constants';

// ─── Google OAuth ───────────────────────────────────────────

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

export async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_ALLOWED_EMAILS.some(allowed => {
    if (allowed.startsWith('@')) return email.endsWith(allowed);
    return email === allowed;
  });
}

// ─── TowninGraph OAuth ──────────────────────────────────────

export function getTowninGraphAuthUrl(state: string): string {
  const baseUrl = process.env.TOWNINGRAPH_OAUTH_URL || '';
  const params = new URLSearchParams({
    client_id: process.env.TOWNINGRAPH_CLIENT_ID || '',
    redirect_uri: process.env.TOWNINGRAPH_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'profile email',
    state,
  });
  return `${baseUrl}/authorize?${params}`;
}

export async function exchangeTowninGraphCode(code: string) {
  const baseUrl = process.env.TOWNINGRAPH_OAUTH_URL || '';
  const res = await fetch(`${baseUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.TOWNINGRAPH_CLIENT_ID || '',
      client_secret: process.env.TOWNINGRAPH_CLIENT_SECRET || '',
      redirect_uri: process.env.TOWNINGRAPH_REDIRECT_URI || '',
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

export async function getTowninGraphUserInfo(accessToken: string) {
  const baseUrl = process.env.TOWNINGRAPH_OAUTH_URL || '';
  const res = await fetch(`${baseUrl}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}
