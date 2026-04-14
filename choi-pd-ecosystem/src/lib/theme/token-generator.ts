// Pomelli 시맨틱 토큰 생성기
// 5개 입력 컬러 → 14개 CSS 변수 자동 파생
// 참조: docs/pomelli-theme-tokens-plan.md §3

import { converter, formatHex, parse } from 'culori';
import type { BaseColors, HexColor, SemanticTokens } from './types';

const toHsl = converter('hsl');
const toOklch = converter('oklch');

function hexToHsl(hex: HexColor) {
  const parsed = parse(hex);
  if (!parsed) throw new Error(`Invalid hex color: ${hex}`);
  return toHsl(parsed);
}

function hslToHex(hsl: { mode: 'hsl'; h?: number; s: number; l: number; alpha?: number }): HexColor {
  return formatHex(hsl) as HexColor;
}

/**
 * 명도 조정: lightnessDelta 만큼 l 변화 (0~1)
 * 양수 → 더 밝게, 음수 → 더 어둡게
 */
function adjustLightness(hex: HexColor, lightnessDelta: number): HexColor {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const l = Math.max(0, Math.min(1, (hsl.l ?? 0.5) + lightnessDelta));
  return hslToHex({ mode: 'hsl', h: hsl.h, s: hsl.s ?? 0, l });
}

/**
 * 채도·명도 기반 soft tint 생성: 명도 ~0.95, 채도 ~0.2 수준
 */
function softTint(hex: HexColor): HexColor {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex({
    mode: 'hsl',
    h: hsl.h,
    s: Math.min(hsl.s ?? 0, 0.25),
    l: 0.94,
  });
}

/**
 * 대비 최적 ink 컬러: trust 기반으로 l=0.15 근접 deep navy
 */
function inkFromTrust(trust: HexColor): HexColor {
  const hsl = hexToHsl(trust);
  if (!hsl) return '#16325C';
  return hslToHex({
    mode: 'hsl',
    h: hsl.h,
    s: Math.min(hsl.s ?? 0, 0.4),
    l: 0.18,
  });
}

/**
 * 5개 base 컬러에서 14개 시맨틱 토큰을 파생.
 * 결정적(deterministic) — 같은 입력은 같은 출력.
 */
export function generateSemanticTokens(base: BaseColors): SemanticTokens {
  const primaryStrong = adjustLightness(base.primary, -0.12);
  const primarySoft = softTint(base.primary);
  const trustSoft = softTint(base.trust);
  const secondarySoft = softTint(base.secondary);

  const surfaceMuted = adjustLightness(base.surface, -0.04);
  const inkPrimary = inkFromTrust(base.trust);
  const inkMuted = adjustLightness(inkPrimary, 0.35);

  // border = trust의 매우 옅은 tint
  const borderHsl = hexToHsl(base.trust);
  const border: HexColor = borderHsl
    ? hslToHex({ mode: 'hsl', h: borderHsl.h, s: Math.min(borderHsl.s ?? 0, 0.15), l: 0.9 })
    : '#E8EAF6';

  // ring = primary 유지 (투명도는 CSS에서 rgba/alpha로 처리)
  const ring = base.primary;

  return {
    '--brand-primary': base.primary,
    '--brand-primary-strong': primaryStrong,
    '--brand-primary-soft': primarySoft,
    '--brand-trust': base.trust,
    '--brand-trust-soft': trustSoft,
    '--brand-accent': base.accent,
    '--brand-secondary': base.secondary,
    '--brand-secondary-soft': secondarySoft,
    '--surface': base.surface,
    '--surface-muted': surfaceMuted,
    '--ink-primary': inkPrimary,
    '--ink-muted': inkMuted,
    '--border': border,
    '--ring': ring,
  };
}

/**
 * 토큰 객체를 :root { ... } CSS 문자열로 직렬화 (SSR 인라인 주입용)
 */
export function tokensToCssVariables(tokens: SemanticTokens): string {
  const lines = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * Pomelli 리포트 스타일의 "확장 팔레트 8종" 생성 (base 4개 x strong/soft).
 * 본문 디자인 가이드 / UI 컬러픽커용.
 */
export function generateExtendedPalette(base: BaseColors): HexColor[] {
  return [
    base.primary, adjustLightness(base.primary, -0.15),
    base.accent, softTint(base.accent),
    base.secondary, softTint(base.secondary),
    base.trust, softTint(base.trust),
  ];
}
