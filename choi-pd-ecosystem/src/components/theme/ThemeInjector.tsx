// SSR 인라인 <style> 주입 — 14개 시맨틱 토큰을 :root에 바인딩
// Next.js App Router Server Component. FOUC 방지.
// 참조: docs/pomelli-theme-tokens-plan.md §4

import { generateSemanticTokens, tokensToCssVariables } from '@/lib/theme/token-generator';
import { autoRemediate } from '@/lib/theme/contrast-guard';
import type { BaseColors } from '@/lib/theme/types';

interface ThemeInjectorProps {
  baseColors: BaseColors;
  themeVersion?: number;
  autoFix?: boolean;
}

export function ThemeInjector({ baseColors, themeVersion = 1, autoFix = true }: ThemeInjectorProps) {
  let tokens = generateSemanticTokens(baseColors);
  if (autoFix) {
    tokens = autoRemediate(tokens).tokens;
  }
  const css = tokensToCssVariables(tokens);

  return (
    <style
      data-theme-version={themeVersion}
      data-theme-injector="pomelli"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
