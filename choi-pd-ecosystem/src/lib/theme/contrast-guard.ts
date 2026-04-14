// Pomelli 컬러 대비 가드
// 14개 시맨틱 토큰에 대해 WCAG AA 대비 검증 + 실패 시 자동 보정
// 참조: docs/pomelli-theme-tokens-plan.md §3, 전역 CLAUDE.md "가독성 절대 규칙"

import { converter, formatHex, parse } from 'culori';
import type { HexColor, SemanticTokens, TokenName } from './types';

const toHsl = converter('hsl');

/**
 * WCAG relative luminance (sRGB).
 */
function luminance(hex: HexColor): number {
  const parsed = parse(hex);
  if (!parsed || parsed.mode !== 'rgb') {
    const rgb = converter('rgb')(parsed ?? hex);
    if (!rgb) return 0;
    return computeLum(rgb.r, rgb.g, rgb.b);
  }
  return computeLum(parsed.r, parsed.g, parsed.b);
}

function computeLum(r: number, g: number, b: number): number {
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG contrast ratio (1 ~ 21).
 */
export function contrastRatio(fg: HexColor, bg: HexColor): number {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

export type WcagLevel = 'AAA' | 'AA' | 'AA-large' | 'FAIL';

/** AA: 본문 4.5 / 큰텍스트 3 / AAA: 7 */
export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'FAIL';
}

export interface ContrastCheck {
  pair: string;           // 예: "--ink-primary on --surface"
  fg: HexColor;
  bg: HexColor;
  ratio: number;
  level: WcagLevel;
  required: number;       // 요구되는 최소 대비
  passed: boolean;
}

export interface ContrastReport {
  checks: ContrastCheck[];
  failed: ContrastCheck[];
  passedCount: number;
  failedCount: number;
}

/**
 * 프로필 페이지에서 실제 사용되는 14개 토큰 간 대비 페어 (의도적 사용처 기반).
 * CLAUDE.md 가독성 규칙: 배지(solid + white), 다크 배경 위 text-white/60 이상 등 반영.
 */
const CONTRAST_PAIRS: Array<{
  pair: string;
  fg: TokenName;
  bg: TokenName;
  required: number;
  description: string;
}> = [
  { pair: 'ink-primary on surface', fg: '--ink-primary', bg: '--surface', required: 4.5, description: '본문 텍스트' },
  { pair: 'ink-muted on surface', fg: '--ink-muted', bg: '--surface', required: 3, description: '보조 텍스트 (큰 텍스트)' },
  { pair: 'surface on brand-primary', fg: '--surface', bg: '--brand-primary', required: 3, description: 'CTA 버튼 라벨' },
  { pair: 'surface on brand-trust', fg: '--surface', bg: '--brand-trust', required: 4.5, description: '다크 히어로 / 푸터 텍스트' },
  { pair: 'surface on brand-accent', fg: '--surface', bg: '--brand-accent', required: 3, description: '솔리드 뱃지' },
  { pair: 'ink-primary on brand-primary-soft', fg: '--ink-primary', bg: '--brand-primary-soft', required: 4.5, description: 'soft 배경 위 텍스트' },
  { pair: 'ink-primary on brand-trust-soft', fg: '--ink-primary', bg: '--brand-trust-soft', required: 4.5, description: 'trust soft 카드 텍스트' },
];

/**
 * 토큰 세트를 전수 검증하여 리포트 반환.
 */
export function auditTokens(tokens: SemanticTokens): ContrastReport {
  const checks: ContrastCheck[] = CONTRAST_PAIRS.map(({ pair, fg, bg, required }) => {
    const fgHex = tokens[fg];
    const bgHex = tokens[bg];
    const ratio = contrastRatio(fgHex, bgHex);
    const level = wcagLevel(ratio);
    const passed = ratio >= required;
    return { pair, fg: fgHex, bg: bgHex, ratio: Number(ratio.toFixed(2)), level, required, passed };
  });
  const failed = checks.filter((c) => !c.passed);
  return {
    checks,
    failed,
    passedCount: checks.length - failed.length,
    failedCount: failed.length,
  };
}

/**
 * 실패한 페어에 대해 foreground의 명도를 조정하여 필요 대비를 달성.
 * bg가 밝으면 fg를 더 어둡게, bg가 어두우면 fg를 더 밝게.
 */
export function remediateForeground(fg: HexColor, bg: HexColor, required: number): HexColor {
  let current = contrastRatio(fg, bg);
  if (current >= required) return fg;

  const hsl = toHsl(parse(fg) ?? fg);
  if (!hsl) return fg;

  const bgLum = luminance(bg);
  const makeDarker = bgLum > 0.5;

  let l = hsl.l ?? 0.5;
  const step = 0.02;
  for (let i = 0; i < 50; i++) {
    l = makeDarker ? Math.max(0, l - step) : Math.min(1, l + step);
    const candidate = formatHex({ mode: 'hsl', h: hsl.h, s: hsl.s ?? 0, l }) as HexColor;
    current = contrastRatio(candidate, bg);
    if (current >= required) return candidate;
    if (l <= 0 || l >= 1) break;
  }
  return fg;
}

/**
 * 실패한 토큰들을 자동 보정하여 새 토큰 세트 반환.
 * 원본은 변경하지 않음 (immutable).
 */
export function autoRemediate(tokens: SemanticTokens): { tokens: SemanticTokens; changed: TokenName[] } {
  const report = auditTokens(tokens);
  if (report.failedCount === 0) return { tokens, changed: [] };

  const next: SemanticTokens = { ...tokens };
  const changed: TokenName[] = [];

  for (const fail of report.failed) {
    const pairDef = CONTRAST_PAIRS.find((p) => p.pair === fail.pair);
    if (!pairDef) continue;
    const newFg = remediateForeground(fail.fg, fail.bg, fail.required);
    if (newFg !== fail.fg) {
      next[pairDef.fg] = newFg;
      if (!changed.includes(pairDef.fg)) changed.push(pairDef.fg);
    }
  }

  return { tokens: next, changed };
}
