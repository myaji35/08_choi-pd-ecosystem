// /choi 브랜드 컬러 단일 진본
// 기본값은 최PD Townin Personal DNA Report 2026-04-14
// 런타임 변경은 /choi/admin → POST /api/choi/brand 로 data/choi-brand.json에 저장,
// 다음 요청부터 /api/choi/brand 가 해당 JSON을 읽어 덮어씀.

export interface ChoiBrandColors {
  primary: string;
  primaryDark: string;
  accent: string;
  accentSoft: string;
  secondary: string;
  secondarySoft: string;
  trust: string;
  trustSoft: string;
  surface: string;
  ink: string;
  inkMuted: string;
  border: string;
}

export const DEFAULT_CHOI_BRAND: ChoiBrandColors = {
  primary: '#E53935',
  primaryDark: '#B71C1C',
  accent: '#FF6F00',
  accentSoft: '#FFF3E0',
  secondary: '#00897B',
  secondarySoft: '#E0F2F1',
  trust: '#1A237E',
  trustSoft: '#E8EAF6',
  surface: '#FFFFFF',
  ink: '#16325C',
  inkMuted: '#5B6B85',
  border: '#E5E7EB',
};

export const BRAND_COLOR_KEYS: (keyof ChoiBrandColors)[] = [
  'primary', 'primaryDark', 'accent', 'accentSoft',
  'secondary', 'secondarySoft', 'trust', 'trustSoft',
  'surface', 'ink', 'inkMuted', 'border',
];

export const BRAND_LABELS: Record<keyof ChoiBrandColors, { label: string; hint: string }> = {
  primary: { label: 'Primary', hint: '핵심 강조 · CTA 버튼 · 섹션 헤더 언더라인' },
  primaryDark: { label: 'Primary Dark', hint: '히어로 그라데이션 중간 톤' },
  accent: { label: 'Accent', hint: '뱃지 · 2차 CTA · 오렌지 액션' },
  accentSoft: { label: 'Accent Soft', hint: '요약 통계 배경' },
  secondary: { label: 'Secondary (Teal)', hint: '보조 액션 · 해시태그 텍스트' },
  secondarySoft: { label: 'Secondary Soft', hint: '해시태그 배경' },
  trust: { label: 'Trust (Navy)', hint: '제목 · 다크 헤더/푸터' },
  trustSoft: { label: 'Trust Soft', hint: '신뢰 섹션 배경' },
  surface: { label: 'Surface', hint: '메인 카드/페이지 배경' },
  ink: { label: 'Ink Primary', hint: '본문 텍스트' },
  inkMuted: { label: 'Ink Muted', hint: '보조 텍스트 · 라벨' },
  border: { label: 'Border', hint: '카드 경계' },
};
