// Pomelli 테마 타입
// 참조: docs/pomelli-theme-tokens-plan.md §3

export type HexColor = `#${string}`;

export interface BaseColors {
  primary: HexColor;  // 핵심 강조 (ex #E53935)
  trust: HexColor;    // 신뢰·권위 (ex #1A237E)
  secondary: HexColor; // 보조 액션 (ex #00897B)
  accent: HexColor;   // 에너지·CTA 보조 (ex #FF6F00)
  surface: HexColor;  // 여백·카드 배경 (ex #FFFFFF)
}

export interface SemanticTokens {
  '--brand-primary': HexColor;
  '--brand-primary-strong': HexColor;
  '--brand-primary-soft': HexColor;
  '--brand-trust': HexColor;
  '--brand-trust-soft': HexColor;
  '--brand-accent': HexColor;
  '--brand-secondary': HexColor;
  '--brand-secondary-soft': HexColor;
  '--surface': HexColor;
  '--surface-muted': HexColor;
  '--ink-primary': HexColor;
  '--ink-muted': HexColor;
  '--border': HexColor;
  '--ring': HexColor;
}

export type TokenName = keyof SemanticTokens;
