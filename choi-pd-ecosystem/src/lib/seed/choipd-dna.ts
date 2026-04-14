// Pomelli Phase 1-5 시드 — 최PD Personal DNA
// ThemeInjector에 입력되는 BaseColors와 프로토타입 페이지용 콘텐츠 최소 세트
// 참조: ChoiPD_Townin_Report.pdf, docs/pomelli-master-plan.md §5

import type { BaseColors } from '@/lib/theme/types';

export interface SeedProfile {
  username: string;
  meta: {
    koreanName: string;
    titles: string[];
    subtitles: string[];
    analysisDate: string;
  };
  baseColors: BaseColors;
  coreValues: string[];
  tagline: string;
  campaigns: Array<{
    category: string;
    title: string;
    body: string;
    channels: string[];
  }>;
}

export const SEED_PROFILES: Record<string, SeedProfile> = {
  choipd: {
    username: 'choipd',
    meta: {
      koreanName: '최범희 PD',
      titles: ['교육인', '1인미디어 크리에이터', '강사'],
      subtitles: ['최PD의 희스토리', '스마트폰교실', '해양경찰교육원 강사'],
      analysisDate: '2026.04.14',
    },
    baseColors: {
      primary: '#E53935',
      trust: '#1A237E',
      secondary: '#00897B',
      accent: '#FF6F00',
      surface: '#FFFFFF',
    },
    coreValues: [
      '스마트폰으로 세상과 소통',
      '1인미디어 대중화',
      '공공·사회봉사 기여',
      '진정성 있는 교육',
    ],
    tagline: '스마트폰으로 사진·동영상·글을 만들어 홍보 마케팅 콘텐츠를 제작합니다',
    campaigns: [
      { category: '스마트폰 교육', title: '스마트폰 하나로 유튜버 되는 법', body: '장비 없이도 OK! 전 과정을 쉽게 알려드립니다.', channels: ['유튜브', '카페', '블로그'] },
      { category: '1인미디어', title: '나도 유튜버 — 중장년 크리에이터 입문', body: '50·60대도 쉽게 시작하는 유튜브 완전 정복.', channels: ['유튜브', '쇼츠', '카카오채널'] },
      { category: '홍보 마케팅', title: '스마트폰으로 내 가게 홍보하세요', body: '소상공인 맞춤 실전 강의.', channels: ['유튜브', '페이스북', '인스타'] },
      { category: '장비 활용', title: '이 장비 하나면 영상 퀄리티가 달라진다', body: '필수 장비 TOP5 활용법 공개.', channels: ['유튜브', '쇼핑몰'] },
      { category: '공익 캠페인', title: '봉사로 기록하는 삶', body: '청소년 지도·사회봉사 공익 브랜드 성장.', channels: ['유튜브', '페이스북', '카페'] },
      { category: '수상 활용', title: '서울시 대상·PRESS AWARDS 수상 PD의 노하우', body: '수상 경력이 신뢰를 만듭니다.', channels: ['유튜브', '강의 플랫폼'] },
    ],
  },
};

export function getSeedProfile(username: string): SeedProfile | null {
  return SEED_PROFILES[username] ?? null;
}
