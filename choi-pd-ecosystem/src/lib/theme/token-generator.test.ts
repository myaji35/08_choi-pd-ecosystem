import { describe, it, expect } from '@jest/globals';
import { generateSemanticTokens, tokensToCssVariables, generateExtendedPalette } from './token-generator';
import type { BaseColors } from './types';

// 최PD Townin 리포트의 실제 DNA 컬러
const CHOIPD_BASE: BaseColors = {
  primary: '#E53935',
  trust: '#1A237E',
  secondary: '#00897B',
  accent: '#FF6F00',
  surface: '#FFFFFF',
};

describe('generateSemanticTokens', () => {
  it('14개 토큰을 모두 생성한다', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    expect(Object.keys(tokens)).toHaveLength(14);
  });

  it('base 5 컬러를 그대로 매핑한다', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    expect(tokens['--brand-primary']).toBe('#E53935');
    expect(tokens['--brand-trust']).toBe('#1A237E');
    expect(tokens['--brand-secondary']).toBe('#00897B');
    expect(tokens['--brand-accent']).toBe('#FF6F00');
    expect(tokens['--surface']).toBe('#FFFFFF');
  });

  it('결정적(deterministic) — 같은 입력은 같은 출력', () => {
    const a = generateSemanticTokens(CHOIPD_BASE);
    const b = generateSemanticTokens(CHOIPD_BASE);
    expect(a).toEqual(b);
  });

  it('primary-strong은 primary보다 어둡다', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    const primary = parseInt(tokens['--brand-primary'].slice(1), 16);
    const strong = parseInt(tokens['--brand-primary-strong'].slice(1), 16);
    expect(strong).toBeLessThan(primary);
  });

  it('soft tint들은 valid hex 포맷이다', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    expect(tokens['--brand-primary-soft']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens['--brand-trust-soft']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens['--brand-secondary-soft']).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('ink-primary는 어두운 값 (l < 0.3 근사)', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    // hex → rgb → 평균으로 대략적 밝기 확인
    const hex = tokens['--ink-primary'].slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const avg = (r + g + b) / 3;
    expect(avg).toBeLessThan(100);
  });
});

describe('tokensToCssVariables', () => {
  it(':root 블록으로 직렬화한다', () => {
    const css = tokensToCssVariables(generateSemanticTokens(CHOIPD_BASE));
    expect(css).toContain(':root {');
    expect(css).toContain('--brand-primary: #E53935;');
    expect(css).toContain('--surface: #FFFFFF;');
    expect(css.trim().endsWith('}')).toBe(true);
  });
});

describe('generateExtendedPalette', () => {
  it('8개 컬러를 반환한다', () => {
    expect(generateExtendedPalette(CHOIPD_BASE)).toHaveLength(8);
  });

  it('모두 valid hex이다', () => {
    const palette = generateExtendedPalette(CHOIPD_BASE);
    palette.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/i));
  });
});
