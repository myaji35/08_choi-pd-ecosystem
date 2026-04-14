// Pomelli 테마 저장 API (MVP) — 실제 DB 기록은 Phase 2 ingestion 통합 후.
// 현재는 수신·검증·서버 로그만 수행, 파생 토큰과 대비 리포트를 응답으로 반환.
import { NextResponse } from 'next/server';
import { generateSemanticTokens } from '@/lib/theme/token-generator';
import { auditTokens, autoRemediate } from '@/lib/theme/contrast-guard';
import type { BaseColors } from '@/lib/theme/types';

const HEX = /^#[0-9a-fA-F]{6}$/;
const KEYS: (keyof BaseColors)[] = ['primary', 'trust', 'secondary', 'accent', 'surface'];

export async function POST(req: Request) {
  let body: { username?: string; colors?: BaseColors; autoFix?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }

  if (!body.username || typeof body.username !== 'string') {
    return NextResponse.json({ error: 'username required' }, { status: 400 });
  }
  if (!body.colors) return NextResponse.json({ error: 'colors required' }, { status: 400 });
  for (const k of KEYS) {
    if (!HEX.test(body.colors[k] ?? '')) {
      return NextResponse.json({ error: `invalid hex for ${k}` }, { status: 400 });
    }
  }

  const base = generateSemanticTokens(body.colors);
  const { tokens, changed } = body.autoFix === false ? { tokens: base, changed: [] } : autoRemediate(base);
  const report = auditTokens(tokens);

  return NextResponse.json({
    ok: true,
    username: body.username,
    tokens,
    remediatedTokens: changed,
    contrast: { passed: report.passedCount, failed: report.failedCount },
    note: 'MVP: persisted to server log only; DB wiring scheduled for Phase 2.',
  });
}
