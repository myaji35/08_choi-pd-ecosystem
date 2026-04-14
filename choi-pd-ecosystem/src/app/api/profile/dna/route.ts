// Pomelli DNA 저장 API (Phase 1 마감)
// Self-declaration 10문항 → personalDna UPSERT + profileThemes 초기 버전 + profilePages UPSERT.
// 인증 필요: 본인 DNA만 편집 가능.

import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { personalDna, profileThemes, profilePages } from '@/lib/db/schema/pomelli';
import { members } from '@/lib/db/schema/member';
import { getSession } from '@/lib/auth/session';
import { generateSemanticTokens } from '@/lib/theme/token-generator';
import { auditTokens, autoRemediate } from '@/lib/theme/contrast-guard';
import type { BaseColors } from '@/lib/theme/types';

const HEX = /^#[0-9a-fA-F]{6}$/;
const COLOR_KEYS: (keyof BaseColors)[] = ['primary', 'trust', 'secondary', 'accent', 'surface'];

interface DnaPayload {
  colors: BaseColors;
  styleKeywords: string[];
  toneKeywords: string[];
  coreValues: string[];
  slogan?: string;
  identity?: {
    channelName?: string;
    profession?: string;
    activity?: string;
    site?: string;
  };
  syncPolicy?: 'auto_all' | 'ask_each' | 'manual_only';
  autoFix?: boolean;
}

function validate(body: unknown): DnaPayload | string {
  if (!body || typeof body !== 'object') return 'body required';
  const b = body as Partial<DnaPayload>;

  if (!b.colors) return 'colors required';
  for (const k of COLOR_KEYS) {
    if (!HEX.test(b.colors[k] ?? '')) return `invalid hex for ${k}`;
  }
  if (!Array.isArray(b.toneKeywords) || b.toneKeywords.length === 0) return 'toneKeywords required (min 1)';
  if (!Array.isArray(b.coreValues) || b.coreValues.length < 1) return 'coreValues required (min 1)';
  if (!Array.isArray(b.styleKeywords)) return 'styleKeywords must be array';

  return b as DnaPayload;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }
  const parsed = validate(raw);
  if (typeof parsed === 'string') return NextResponse.json({ error: parsed }, { status: 400 });

  // 현재 사용자의 member 조회 (slug 필요)
  const [member] = await db.select().from(members).where(eq(members.email, session.email)).limit(1);
  if (!member) return NextResponse.json({ error: 'member not found' }, { status: 404 });

  // 토큰 파생 + WCAG 감사
  const base = generateSemanticTokens(parsed.colors);
  const { tokens, changed } = parsed.autoFix === false ? { tokens: base, changed: [] } : autoRemediate(base);
  const report = auditTokens(tokens);

  // 1) personalDna UPSERT
  const [existingDna] = await db.select().from(personalDna).where(eq(personalDna.memberId, member.id)).limit(1);
  const dnaRow = {
    memberId: member.id,
    tenantId: member.tenantId ?? 1,
    colorsJson: JSON.stringify(parsed.colors),
    semanticTokensJson: JSON.stringify(tokens),
    styleKeywords: JSON.stringify(parsed.styleKeywords ?? []),
    toneKeywords: JSON.stringify(parsed.toneKeywords),
    coreValues: JSON.stringify(parsed.coreValues),
    slogan: parsed.slogan ?? null,
    identityJson: JSON.stringify(parsed.identity ?? {}),
    syncPolicy: parsed.syncPolicy ?? 'auto_all',
    generatedBy: 'self_declared' as const,
    version: existingDna ? existingDna.version + 1 : 1,
    updatedAt: new Date(),
  };
  let dnaId: number;
  if (existingDna) {
    await db.update(personalDna).set(dnaRow).where(eq(personalDna.id, existingDna.id));
    dnaId = existingDna.id;
  } else {
    const inserted = await db.insert(personalDna).values(dnaRow).returning({ id: personalDna.id });
    dnaId = inserted[0].id;
  }

  // 2) profileThemes 새 버전 생성
  const [prevTheme] = await db
    .select()
    .from(profileThemes)
    .where(eq(profileThemes.memberId, member.id))
    .orderBy(profileThemes.version)
    .limit(1);
  const themeInserted = await db.insert(profileThemes).values({
    memberId: member.id,
    tenantId: member.tenantId ?? 1,
    dnaId,
    version: prevTheme ? prevTheme.version + 1 : 1,
    baseColorsJson: JSON.stringify(parsed.colors),
    derivedColorsJson: JSON.stringify(changed),
    semanticMappingJson: JSON.stringify(tokens),
    contrastReportJson: JSON.stringify({
      passed: report.passedCount,
      failed: report.failedCount,
      checks: report.checks,
    }),
    themeMode: 'light' as const,
    isPublished: true,
    publishedAt: new Date(),
  }).returning({ id: profileThemes.id });
  const themeId = themeInserted[0].id;

  // 3) profilePages UPSERT (slug는 member.slug 재사용)
  const [existingPage] = await db.select().from(profilePages).where(eq(profilePages.memberId, member.id)).limit(1);
  if (existingPage) {
    await db.update(profilePages).set({
      activeThemeId: themeId,
      updatedAt: new Date(),
    }).where(eq(profilePages.id, existingPage.id));
  } else {
    await db.insert(profilePages).values({
      memberId: member.id,
      tenantId: member.tenantId ?? 1,
      usernameSlug: member.slug,
      templateId: 'pomelli_v1',
      activeThemeId: themeId,
      isPublished: false,
    });
  }

  return NextResponse.json({
    ok: true,
    dnaId,
    themeId,
    slug: member.slug,
    tokens,
    contrast: { passed: report.passedCount, failed: report.failedCount, remediated: changed.length },
    publicUrl: `/p/${member.slug}`,
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const [member] = await db.select().from(members).where(eq(members.email, session.email)).limit(1);
  if (!member) return NextResponse.json({ error: 'member not found' }, { status: 404 });

  const [dna] = await db.select().from(personalDna).where(eq(personalDna.memberId, member.id)).limit(1);
  if (!dna) return NextResponse.json({ dna: null });

  return NextResponse.json({
    dna: {
      id: dna.id,
      version: dna.version,
      colors: JSON.parse(dna.colorsJson),
      styleKeywords: JSON.parse(dna.styleKeywords ?? '[]'),
      toneKeywords: JSON.parse(dna.toneKeywords ?? '[]'),
      coreValues: JSON.parse(dna.coreValues ?? '[]'),
      slogan: dna.slogan,
      identity: JSON.parse(dna.identityJson ?? '{}'),
      syncPolicy: dna.syncPolicy,
    },
    slug: member.slug,
  });
}
