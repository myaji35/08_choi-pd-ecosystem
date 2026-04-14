import { describe, it, expect } from '@jest/globals';
import { generateSemanticTokens } from './token-generator';
import { contrastRatio, wcagLevel, auditTokens, autoRemediate, remediateForeground } from './contrast-guard';
import type { BaseColors, SemanticTokens } from './types';

const CHOIPD_BASE: BaseColors = {
  primary: '#E53935',
  trust: '#1A237E',
  secondary: '#00897B',
  accent: '#FF6F00',
  surface: '#FFFFFF',
};

describe('contrastRatio', () => {
  it('흰-검 대비는 21에 근접', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
  });
  it('같은 색은 대비 1', () => {
    expect(contrastRatio('#E53935', '#E53935')).toBeCloseTo(1, 1);
  });
  it('대칭적 (A on B == B on A)', () => {
    const a = contrastRatio('#E53935', '#FFFFFF');
    const b = contrastRatio('#FFFFFF', '#E53935');
    expect(a).toBeCloseTo(b, 3);
  });
});

describe('wcagLevel', () => {
  it('경계값 판별', () => {
    expect(wcagLevel(21)).toBe('AAA');
    expect(wcagLevel(7)).toBe('AAA');
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(3)).toBe('AA-large');
    expect(wcagLevel(2.9)).toBe('FAIL');
  });
});

describe('auditTokens', () => {
  it('최PD DNA는 모든 페어 검증 결과를 반환', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    const report = auditTokens(tokens);
    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.passedCount + report.failedCount).toBe(report.checks.length);
  });

  it('본문 텍스트(ink on surface)는 AA 통과', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    const report = auditTokens(tokens);
    const bodyCheck = report.checks.find((c) => c.pair === 'ink-primary on surface');
    expect(bodyCheck).toBeDefined();
    expect(bodyCheck!.passed).toBe(true);
  });

  it('다크 히어로(surface on trust)는 AA 통과', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    const report = auditTokens(tokens);
    const heroCheck = report.checks.find((c) => c.pair === 'surface on brand-trust');
    expect(heroCheck).toBeDefined();
    expect(heroCheck!.passed).toBe(true);
  });
});

describe('remediateForeground', () => {
  it('이미 통과한 페어는 원본 유지', () => {
    const result = remediateForeground('#000000', '#FFFFFF', 4.5);
    expect(result).toBe('#000000');
  });

  it('실패한 페어는 대비 상향 조정', () => {
    // 회색 on 흰색 — 대비 낮음
    const before = contrastRatio('#AAAAAA', '#FFFFFF');
    expect(before).toBeLessThan(4.5);
    const fixed = remediateForeground('#AAAAAA', '#FFFFFF', 4.5);
    const after = contrastRatio(fixed, '#FFFFFF');
    expect(after).toBeGreaterThanOrEqual(4.5);
  });
});

describe('autoRemediate', () => {
  it('강제 실패 토큰을 자동 보정한다', () => {
    // 일부러 대비가 약한 토큰 세트 (ink-primary가 회색)
    const bad: SemanticTokens = {
      ...generateSemanticTokens(CHOIPD_BASE),
      '--ink-primary': '#AAAAAA',
    };
    const badReport = auditTokens(bad);
    expect(badReport.failedCount).toBeGreaterThan(0);

    const { tokens: fixed, changed } = autoRemediate(bad);
    const fixedReport = auditTokens(fixed);
    expect(fixedReport.failedCount).toBeLessThan(badReport.failedCount);
    expect(changed.length).toBeGreaterThan(0);
  });

  it('문제 없는 토큰은 변경하지 않는다', () => {
    const tokens = generateSemanticTokens(CHOIPD_BASE);
    const initialReport = auditTokens(tokens);
    if (initialReport.failedCount === 0) {
      const { changed } = autoRemediate(tokens);
      expect(changed).toHaveLength(0);
    }
  });
});
