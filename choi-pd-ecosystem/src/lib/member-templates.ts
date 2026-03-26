/**
 * 직업별 회원 페이지 템플릿 설정
 *
 * 각 profession에 따라:
 * - 히어로 문구 (title, subtitle)
 * - 기본 활성 모듈
 * - CTA 버튼 텍스트
 * - 테마 색상
 * - 섹션 라벨 커스터마이징
 */

export interface MemberTemplate {
  profession: string;
  label: string;            // 한글 직업명
  heroTitle: string;        // 히어로 기본 제목 ({name} 플레이스홀더)
  heroSubtitle: string;     // 히어로 기본 부제
  ctaPrimary: string;       // 메인 CTA 버튼 텍스트
  ctaSecondary: string;     // 보조 CTA 버튼 텍스트
  defaultModules: string[]; // 기본 활성 모듈
  accentColor: string;      // 기본 테마 색상
  moduleLabels: Record<string, string>; // 모듈 라벨 오버라이드
  coverGradient: string;    // 커버 그라데이션
}

export const MEMBER_TEMPLATES: Record<string, MemberTemplate> = {
  insurance_agent: {
    profession: 'insurance_agent',
    label: '보험설계사',
    heroTitle: '고객의 미래를 설계합니다',
    heroSubtitle: '{name} 보험설계사와 함께 안전한 내일을 준비하세요',
    ctaPrimary: '무료 상담 신청',
    ctaSecondary: '보장 분석 받기',
    defaultModules: ['services', 'reviews', 'contact', 'blog'],
    accentColor: '#2563EB',
    moduleLabels: {
      services: '보장 상품',
      reviews: '상담 후기',
      contact: '상담 신청',
      blog: '보험 칼럼',
      portfolio: '보장 분석 사례',
    },
    coverGradient: 'from-blue-700 to-blue-500',
  },
  realtor: {
    profession: 'realtor',
    label: '부동산중개사',
    heroTitle: '최적의 부동산을 찾아드립니다',
    heroSubtitle: '{name} 공인중개사의 전문적인 부동산 서비스',
    ctaPrimary: '매물 문의',
    ctaSecondary: '시세 조회',
    defaultModules: ['portfolio', 'services', 'reviews', 'contact'],
    accentColor: '#059669',
    moduleLabels: {
      portfolio: '매물 목록',
      services: '중개 서비스',
      reviews: '거래 후기',
      contact: '매물 문의',
      blog: '부동산 뉴스',
    },
    coverGradient: 'from-emerald-700 to-emerald-500',
  },
  educator: {
    profession: 'educator',
    label: '교육자/강사',
    heroTitle: '새로운 배움의 시작',
    heroSubtitle: '{name} 강사와 함께 성장하는 교육 과정',
    ctaPrimary: '수강 신청',
    ctaSecondary: '커리큘럼 보기',
    defaultModules: ['services', 'reviews', 'blog', 'booking'],
    accentColor: '#7C3AED',
    moduleLabels: {
      services: '교육 과정',
      reviews: '수강 후기',
      blog: '교육 칼럼',
      portfolio: '교육 실적',
      contact: '교육 문의',
      booking: '수강 예약',
    },
    coverGradient: 'from-violet-700 to-purple-500',
  },
  author: {
    profession: 'author',
    label: '저자/크리에이터',
    heroTitle: '콘텐츠로 세상과 소통합니다',
    heroSubtitle: '{name}의 저서와 활동을 만나보세요',
    ctaPrimary: '저서 보기',
    ctaSecondary: '문의하기',
    defaultModules: ['portfolio', 'blog', 'reviews', 'contact'],
    accentColor: '#DB2777',
    moduleLabels: {
      portfolio: '저서 및 작품',
      blog: '최근 활동',
      reviews: '독자 후기',
      contact: '출판 문의',
      services: '강연/출연',
    },
    coverGradient: 'from-pink-700 to-rose-500',
  },
  shopowner: {
    profession: 'shopowner',
    label: '소상공인/매장',
    heroTitle: '정성을 담아 준비했습니다',
    heroSubtitle: '{name}의 특별한 상품과 서비스를 만나보세요',
    ctaPrimary: '방문 예약',
    ctaSecondary: '메뉴 보기',
    defaultModules: ['services', 'portfolio', 'reviews', 'contact'],
    accentColor: '#EA580C',
    moduleLabels: {
      services: '메뉴/상품',
      portfolio: '매장 갤러리',
      reviews: '고객 리뷰',
      contact: '방문 예약',
      blog: '새 소식',
    },
    coverGradient: 'from-orange-700 to-amber-500',
  },
  freelancer: {
    profession: 'freelancer',
    label: '프리랜서/전문가',
    heroTitle: '전문가에게 맡기세요',
    heroSubtitle: '{name}의 전문 서비스로 문제를 해결하세요',
    ctaPrimary: '견적 요청',
    ctaSecondary: '포트폴리오 보기',
    defaultModules: ['portfolio', 'services', 'reviews', 'contact'],
    accentColor: '#0891B2',
    moduleLabels: {
      portfolio: '포트폴리오',
      services: '서비스 목록',
      reviews: '클라이언트 후기',
      contact: '견적 요청',
      blog: '작업 일지',
    },
    coverGradient: 'from-cyan-700 to-teal-500',
  },
  custom: {
    profession: 'custom',
    label: '기본',
    heroTitle: '안녕하세요, {name}입니다',
    heroSubtitle: '새로운 가능성을 함께 만들어갑니다',
    ctaPrimary: '문의하기',
    ctaSecondary: '더 알아보기',
    defaultModules: ['portfolio', 'services', 'contact'],
    accentColor: '#00A1E0',
    moduleLabels: {
      portfolio: '포트폴리오',
      services: '서비스',
      reviews: '후기',
      contact: '문의하기',
      blog: '블로그',
      booking: '예약',
    },
    coverGradient: 'from-[#16325C] to-[#00A1E0]',
  },
};

/**
 * 회원의 profession에 맞는 템플릿 반환
 * 없으면 custom(기본) 템플릿 반환
 */
export function getTemplate(profession: string | null | undefined): MemberTemplate {
  if (!profession) return MEMBER_TEMPLATES.custom;
  return MEMBER_TEMPLATES[profession] || MEMBER_TEMPLATES.custom;
}

/**
 * 히어로 제목에서 {name} 플레이스홀더 치환
 */
export function resolveHeroText(text: string, name: string): string {
  return text.replace(/{name}/g, name);
}

/**
 * 직업 목록 (선택 UI용)
 */
export const PROFESSION_OPTIONS = Object.values(MEMBER_TEMPLATES).map((t) => ({
  value: t.profession,
  label: t.label,
}));
