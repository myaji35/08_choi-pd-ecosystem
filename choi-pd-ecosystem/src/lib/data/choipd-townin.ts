// 최PD Townin Personal DNA Report (2026-04-14) — 리포트 원본 데이터
// 출처: ChoiPD_Townin_Report.pdf
// 본 파일은 /choi 서브디렉토리 페이지의 단일 진본 데이터 소스

export const CHOIPD_DNA = {
  meta: {
    koreanName: '최범희',
    hanjaName: '崔範熙',
    englishName: 'Bum Hee Choi',
    titles: ['교육인', '1인미디어 크리에이터', '강사'],
    subtitles: ['최PD의 희스토리', '스마트폰교실', '해양경찰교육원 강사'],
    birthYear: 1972,
    birthLunar: '1972.03.14',
    heightCm: 175,
    weightKg: 72,
    origin: '경기도 안성',
    residence: '경기도 안성',
    pressAwardsYear: 2022,
    seoulAwardYear: 2025,
    activeChannels: '3+',
    profession: '교육인',
    analysisDate: '2026.04.14',
  },

  // 1. Personal DNA — 색상 5개 + 팔레트 8개
  colors: {
    primary: '#E53935',
    primaryDark: '#B71C1C',
    accent: '#FF6F00',
    accentSoft: '#FFF3E0',
    secondary: '#00897B',
    secondarySoft: '#E0F2F1',
    trust: '#1A237E',
    trustSoft: '#E8EAF6',
    surface: '#FFFFFF',
  },

  // 톤앤매너 4축
  contentStyle: ['에너지·활기·친근함', '스마트폰 실전 위주', '쉽고 재미있는 설명', '중장년 친화 강의', '현장감 있는 연출'],
  toneKeywords: ['열정적·긍정적', '친절·유머 보유', '실용적·현장감', '동기부여형', '소통·공감 중심'],
  coreValues: ['스마트폰으로 세상과 소통', '1인미디어 대중화', '공공·사회봉사 기여', '진정성 있는 교육', '유튜브로 희스토리 기록'],
  toneBadges: ['열정적', '친근함', '실용적', '긍정적', '유머', '공익적', '소통', '현장감'],

  identity: {
    channelName: '최PD의 희스토리 (최PD의 스마트폰교실)',
    slogan: '스마트폰으로 사진·동영상·글을 만들어 홍보 마케팅 콘텐츠를 제작합니다',
    activity: '1인미디어 유튜브 교육 · 스마트폰 영상 장비 판매 교육',
    site: '카페 · 페이스북 · 유튜브 3채널 운영',
  },

  // 2. 인물 프로필
  profile: {
    name: '최범희 (崔範熙 / Bum Hee Choi)',
    job: '교육인 · 1인미디어 크리에이터 · PD',
    birth: '음력 1972.03.14. 경기도 안성',
    body: '175cm, 72kg',
    affiliation: '최PD의 희스토리 (스마트폰교실)',
    career: '해양경찰교육원 강사',
    sns: '카페 · 페이스북 · 유튜브',
    interests: '마케팅 · 비즈니스 · 콘텐츠 마케팅',
    specialty: '스마트폰 활용 사진·동영상·글 제작 및 홍보 마케팅 콘텐츠 교육',
    region: '경기도 안성 출신',
  },

  awards: [
    { year: 2025, name: '제17회 서울특별시 청소년지도자 대상 사회봉사대상', org: '서울특별시' },
    { year: 2022, name: '제4회 PRESS AWARDS 유튜버상', org: 'PRESS AWARDS 선정위원회' },
  ],

  activityAreas: [
    { area: '스마트폰 교육', detail: '사진·동영상·글 제작, 앱 활용, 홍보 마케팅 콘텐츠 제작', target: '중장년·일반인·기관', platform: '오프라인 교육' },
    { area: '1인미디어 유튜브', detail: '유튜브 채널 운영 교육, 영상 제작 실습, 크리에이터 양성', target: '예비 크리에이터', platform: '유튜브 · 카페' },
    { area: '장비 교육·판매', detail: '스마트폰 영상 장비 활용법 교육 및 판매', target: '영상 입문자', platform: '오프라인 · SNS' },
    { area: '공공기관 강의', detail: '해양경찰교육원 등 공공기관 스마트폰·미디어 강의', target: '경찰·공무원', platform: '오프라인 교육' },
    { area: '봉사·사회활동', detail: '청소년 지도 봉사, 서울시 청소년지도자 대상 수상', target: '청소년·지역사회', platform: '현장 활동' },
  ],

  // 3. 추천 콘텐츠 캠페인 6종
  campaigns: [
    {
      category: '스마트폰 교육',
      title: '스마트폰 하나로 유튜버 되는 법',
      body: '장비 없이도 OK! 스마트폰으로 전 과정을 쉽게 촬영·편집·업로드 알려드립니다.',
      channels: ['유튜브', '카페', '블로그'],
      accent: 'primary',
    },
    {
      category: '1인미디어',
      title: '나도 유튜버 — 중장년 크리에이터 입문',
      body: '50·60대도 쉽게 시작하는 유튜브 채널 완전 개설부터 수익화까지 정복!',
      channels: ['유튜브', '쇼츠', '카카오채널'],
      accent: 'secondary',
    },
    {
      category: '홍보 마케팅',
      title: '스마트폰으로 내 가게 홍보하세요',
      body: '소상공인·자영업자를 위한 스마트폰 마케팅 콘텐츠 제작 실전 강의.',
      channels: ['유튜브', '페이스북', '인스타'],
      accent: 'accent',
    },
    {
      category: '장비 활용',
      title: '이 장비 하나면 영상 퀄리티가 달라진다',
      body: '스마트폰 영상을 프로급으로 만드는 필수 장비 TOP5 활용법 공개!',
      channels: ['유튜브', '쇼핑몰'],
      accent: 'accent',
    },
    {
      category: '공익 캠페인',
      title: '최PD의 희스토리 — 봉사로 기록하는 삶',
      body: '청소년 지도·사회봉사 활동을 영상으로 더 큰 기록하며 공익 브랜드로 성장합니다.',
      channels: ['유튜브', '페이스북', '카페'],
      accent: 'primary',
    },
    {
      category: '수상 활용',
      title: '서울시 대상·PRESS AWARDS 수상 PD의 노하우',
      body: '공신력을 바탕으로 한 강의 및 컨설팅 브랜딩. 수상 경력이 신뢰를 만듭니다.',
      channels: ['유튜브', '강의 플랫폼'],
      accent: 'trust',
    },
  ],

  // 4. AI 소재 미리보기
  aiCreatives: [
    { format: '유튜브 썸네일', headline: '스마트폰 하나로 유튜버 됩니다', body: '중장년도 쉽게 시작하는 1인미디어', cta: '구독·알림 설정', animate: 'Veo 3.1' },
    { format: 'Instagram Reels', headline: '이 장비 하나면 영상이 달라진다', body: '스마트폰 영상 장비 TOP5 리뷰', cta: '링크 클릭', animate: 'Animate' },
    { format: '페이스북 광고', headline: '우리 가게 홍보, 스마트폰으로 직접!', body: '소상공인 맞춤 마케팅 콘텐츠 강의', cta: '수강 신청', animate: 'Animate' },
    { format: '카카오채널', headline: '최PD와 함께하는 유튜브 입문 클래스', body: '1:1 맞춤 스마트폰 교육 안내', cta: '상담 신청', animate: '권장' },
  ],

  // 5. 채널별 마케팅 전략
  channels: [
    { name: '유튜브 (희스토리)', status: '운영 중', activityScore: 68, recommended: '스마트폰 강의, 장비 리뷰, 봉사활동 브이로그', frequency: '주 2~3회', kpi: '구독자 조회수·시청시간' },
    { name: '네이버 카페', status: '운영 중', activityScore: 60, recommended: '강의 공지, 수강생 후기, 스마트폰 꿀팁 정보', frequency: '주 2~3회', kpi: '회원 수 게시글 조회' },
    { name: '페이스북', status: '운영 중', activityScore: 55, recommended: '활동 근황, 이벤트 공지, 영상 공유', frequency: '주 2회', kpi: '좋아요·공유 도달률' },
    { name: 'Instagram (신규 권장)', status: '미운영', activityScore: 10, recommended: '강의 현장 사진, 릴스 강의 클립, 수강생 후기', frequency: '주 3~4회', kpi: '팔로워 저장·공유율' },
    { name: '네이버 블로그 (신규 권장)', status: '미운영', activityScore: 10, recommended: '강의 후기, 스마트폰 활용법 정보글, SEO 최적화', frequency: '주 2회', kpi: '검색 유입 방문자 수' },
  ],

  channelInsights: [
    { icon: '⭐', label: '현재 강점', text: '유튜브+카페+페이스북 3채널 운영 중' },
    { icon: '▲', label: '즉시 개선', text: 'Instagram 개설 — 릴스로 강의 클립 확산' },
    { icon: '★', label: '성장 기회', text: '블로그 SEO — 스마트폰 강의 검색 유입 극대화' },
    { icon: '◆', label: '수상 활용', text: '서울시 대상·PRESS AWARDS 공신력 전면 활용' },
  ],

  // 6. 월간 콘텐츠 캘린더 (5월 샘플)
  contentCalendar: [
    { week: 1, channel: '유튜브', type: '스마트폰 강의', topic: '스마트폰으로 유튜브 시작하는 방법 — 설치부터 업로드까지 한 번에!', animate: '권장' },
    { week: 1, channel: '카페', type: '이벤트 공지', topic: '어버이날 특집 중장년 스마트폰 교육 무료 체험 이벤트', animate: '불필요' },
    { week: 2, channel: '유튜브 Reels', type: '장비 리뷰', topic: '이 짐벌 하나로 영상이 달라진다 — 스마트폰 장비 TOP3 비교', animate: 'Veo 3.1' },
    { week: 2, channel: '페이스북', type: '봉사 브이로그', topic: '청소년 스마트폰 교육 봉사 현장 — 최PD의 희스토리', animate: '불필요' },
    { week: 3, channel: '유튜브', type: '수강생 후기', topic: '60대 어머니도 유튜버가 됐어요 — 실제 수강생 인터뷰', animate: '권장' },
    { week: 3, channel: 'Instagram (신규)', type: '릴스', topic: '스마트폰으로 찍은 10초 영상 Before & After — #최PD스마트폰교실', animate: 'Veo 3.1' },
    { week: 4, channel: '유튜브', type: 'PRESS AWARDS 콘텐츠', topic: '유튜버상 수상 PD가 알려주는 유튜브 성장 비법 3가지', animate: '권장' },
    { week: 4, channel: '카페', type: '수강 안내', topic: '6월 스마트폰교실 정규 과정 모집 — 선착순 마감 임박', animate: '불필요' },
  ],

  // 7. 해시태그/키워드 전략
  hashtags: [
    { category: '브랜드', tags: ['#최PD의희스토리', '#최PD스마트폰교실', '#최범희PD'], volume: '낮음', competition: '낮음' },
    { category: '스마트폰 교육', tags: ['#스마트폰교육', '#스마트폰강의', '#스마트폰활용법', '#스마트폰강사'], volume: '높음', competition: '중간' },
    { category: '1인미디어', tags: ['#유튜브강의', '#1인미디어', '#유튜브시작', '#크리에이터입문'], volume: '높음', competition: '높음' },
    { category: '중장년 타겟', tags: ['#중장년유튜버', '#50대유튜브', '#시니어크리에이터', '#중년취미'], volume: '중간', competition: '낮음' },
    { category: '장비·도구', tags: ['#스마트폰장비', '#짐벌추천', '#영상장비', '#유튜브장비'], volume: '중간', competition: '중간' },
    { category: '네이버 키워드', tags: ['스마트폰강사', '유튜브강의', '1인미디어교육', '스마트폰영상편집'], volume: '높음', competition: '높음' },
  ],

  // 8. 유사 크리에이터 포지셔닝
  positioning: [
    { name: '최범희 PD (자사)', focus: '스마트폰 교육·1인미디어', target: '중장년·소상공인', strength: '공공기관 강의 수상 공신력', differentiation: '해양경찰 등 공공 봉사·사회기여 병행', isSelf: true },
    { name: '단희쌤', focus: '유튜브·SNS 마케팅', target: '전 연령 마케터', strength: '정보성 콘텐츠 높은 조회수', differentiation: '중장년 특화 현장 실습 강점', isSelf: false },
    { name: '스마트폰 강사 이정화', focus: '스마트폰 활용 교육', target: '시니어·중장년', strength: '스마트폰 활용법 자격증 교육', differentiation: '1인미디어 영상 장비 교육 차별화', isSelf: false },
  ],

  // 9. 8주 성장 로드맵
  roadmap: [
    { phase: 1, name: '브랜드 정비', weeks: '1~2주', items: ['Personal DNA 확정', '유튜브 채널 아트 리뉴얼', '카페·페이스북 프로필 통합'], function: 'Townin Core / Imagen 4', effect: '브랜드 일관성 확립' },
    { phase: 2, name: '영상 강화', weeks: '3~4주', items: ['강의 쇼츠 6종 Animate 변환', 'Instagram 개설·릴스 업로드', '유튜브 썸네일 AI 자동 생성'], function: 'Veo 3.1 Animate', effect: '영상 콘텐츠 도달률 3배' },
    { phase: 3, name: '노출 확대', weeks: '5~6주', items: ['네이버 블로그 SEO 콘텐츠 20편', '수상 경력 활용 홍보 캠페인', '공공기관 강의 포트폴리오 제작'], function: 'Townin + 키워드 최적화', effect: '검색 유입 신규 수강생 확보' },
    { phase: 4, name: '수익 다각화', weeks: '7~8주', items: ['온라인 강의 플랫폼 입점 검토', '장비 판매 쇼핑몰 연동', '수강생 커뮤니티 활성화'], function: 'Townin Analytics 자동화 파이프라인', effect: '수입원 다각화 팬덤 구축' },
  ],

  summaryStats: [
    { value: '6', label: '추천 캠페인' },
    { value: '4', label: '생성 소재' },
    { value: '8주', label: '성장 로드맵' },
    { value: '2', label: '수상 경력' },
    { value: '5+', label: '활동 채널 목표' },
  ],

  // 10. 인사이트 배너 (상단)
  topStats: [
    { value: '1972', label: '출생연도' },
    { value: '175cm', label: '신체' },
    { value: '2022', label: 'PRESS AWARDS' },
    { value: '2025', label: '서울시 대상' },
    { value: '3+', label: '활동 채널' },
    { value: '교육인', label: '직업군' },
  ],
} as const;

export type ChoipdDnaData = typeof CHOIPD_DNA;
