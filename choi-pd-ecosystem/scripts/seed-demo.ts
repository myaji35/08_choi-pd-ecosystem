import { db } from '../src/lib/db';
import { courses, posts, works, settings, leads, heroImages } from '../src/lib/db/schema';
import { sql } from 'drizzle-orm';

async function seedDemo() {
  console.log('🎬 Demo seed 시작 — 풍부한 목업 데이터 삽입...');

  // 기존 데이터 정리 (admin_users 제외)
  console.log('🗑️  기존 콘텐츠 데이터 제거...');
  await db.delete(courses);
  await db.delete(posts);
  await db.delete(works);
  await db.delete(leads);
  await db.delete(heroImages);
  await db.run(sql`DELETE FROM settings WHERE key IN ('hero_images', 'social_links')`);

  // ============================
  // 1. 교육 과정 (8개)
  // ============================
  console.log('📚 교육 과정 8개 삽입...');
  await db.insert(courses).values([
    {
      title: '스마트폰 창업 기초 과정 (1기)',
      description: '5060 베이비부머를 위한 스마트폰 활용 창업 교육. 카메라 기본 조작부터 유튜브 채널 개설, 쇼츠 편집까지 8주 완성. 수료생 92%가 자신의 채널을 운영 중입니다.',
      type: 'online',
      price: 100000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
      externalLink: 'https://example.com/course/smartphone-basic',
      published: true,
    },
    {
      title: '소상공인 디지털 마케팅 마스터',
      description: '매출 30% 상승을 목표로 하는 소상공인 맞춤 디지털 마케팅. 네이버 플레이스 최적화, 인스타그램 릴스 제작, 카카오톡 채널 운영까지 실전 위주 교육.',
      type: 'offline',
      price: 150000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop',
      published: true,
    },
    {
      title: '기업 맞춤형 미디어 리터러시',
      description: '임직원 디지털 역량 강화를 위한 기업 출강 교육. AI 시대 미디어 활용법, 사내 콘텐츠 제작, 브랜드 커뮤니케이션 전략까지 맞춤 설계합니다.',
      type: 'b2b',
      price: null,
      thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
      published: true,
    },
    {
      title: '유튜브 수익화 전략 과정',
      description: '구독자 1,000명 달성부터 광고 수익 최적화까지. 알고리즘 분석, 썸네일 디자인, 영상 기획법을 체계적으로 배웁니다. 수료생 평균 구독자 수 2,300명 돌파!',
      type: 'online',
      price: 120000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=500&fit=crop',
      externalLink: 'https://example.com/course/youtube-monetize',
      published: true,
    },
    {
      title: '스마트폰 영상 편집 실전',
      description: 'CapCut, VLLO 등 무료 앱으로 프로급 영상 만들기. 자막, 트랜지션, BGM, 컬러 보정까지 하루 만에 마스터하는 집중 워크숍.',
      type: 'offline',
      price: 80000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=500&fit=crop',
      published: true,
    },
    {
      title: '시니어 인플루언서 양성 과정',
      description: '60대 이상을 위한 SNS 인플루언서 과정. 일상 브이로그, 요리 콘텐츠, 여행 영상 등 자신만의 콘텐츠 장르를 발견하고 팬덤을 구축하세요.',
      type: 'online',
      price: 90000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop',
      published: true,
    },
    {
      title: '지자체·공공기관 디지털 교육',
      description: '지자체, 복지관, 도서관 등 공공기관 대상 맞춤 교육. 시민 디지털 역량 강화, 어르신 스마트폰 활용, 1인 미디어 교육 등 다양한 프로그램을 운영합니다.',
      type: 'b2b',
      price: null,
      thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop',
      published: true,
    },
    {
      title: '스마트폰 창업 심화 과정 (2기)',
      description: '기초 과정 수료생 대상 심화 교육. 네이버 스마트스토어 입점, 쿠팡 파트너스, 전자책 출판까지. 실제 수익을 만드는 N잡러 로드맵을 완성합니다.',
      type: 'online',
      price: 180000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      externalLink: 'https://example.com/course/smartphone-advanced',
      published: true,
    },
  ]);

  // ============================
  // 2. 공지사항/소식 (12개)
  // ============================
  console.log('📢 공지사항/소식 12개 삽입...');
  await db.insert(posts).values([
    // notice (5개)
    {
      title: '2026년 봄학기 스마트폰 창업 과정 수강생 모집',
      content: `2026년 봄학기 스마트폰 창업 과정 수강생을 모집합니다.

## 모집 대상
- 제2의 인생을 준비하는 5060 세대
- 스마트폰으로 부업/창업을 꿈꾸는 분
- 디지털 전환이 필요한 소상공인

## 과정 개요
- **기간**: 8주 (주 2회, 화·목)
- **시간**: 오전 10시 ~ 12시
- **장소**: 온라인 ZOOM + 월 1회 오프라인 모임
- **수강료**: 100,000원 (조기 등록 시 20% 할인)
- **정원**: 30명 (선착순 마감)

## 커리큘럼 하이라이트
1주차: 스마트폰 카메라 200% 활용법
2주차: 유튜브 채널 개설 및 브랜딩
3주차: 영상 촬영의 기초 (구도, 조명, 음향)
4주차: 모바일 편집 앱 마스터 (CapCut)
5주차: 콘텐츠 기획과 스토리텔링
6주차: SNS 마케팅 전략
7주차: 수익화 모델 구축
8주차: 포트폴리오 발표 및 수료

📧 문의: education@chopd.kr | 📞 02-1234-5678`,
      category: 'notice',
      published: true,
    },
    {
      title: '소상공인 무료 디지털 컨설팅 신청 안내',
      content: `중소벤처기업부 지원사업의 일환으로 소상공인 대상 무료 디지털 마케팅 컨설팅을 진행합니다.

## 컨설팅 내용
- 네이버 플레이스 최적화 진단
- SNS 채널 운영 전략 수립
- 간단한 홍보 영상 제작 가이드
- 맞춤형 디지털 마케팅 로드맵

## 신청 자격
- 사업자등록증 보유 소상공인
- 연 매출 10억 원 이하 사업체

**신청 기한**: 2026년 4월 30일까지
**선정 인원**: 50명 (서류 심사 후 개별 연락)`,
      category: 'notice',
      published: true,
    },
    {
      title: '오프라인 수업 장소 변경 안내 (4월부터)',
      content: `안녕하세요, 수강생 여러분.

2026년 4월부터 오프라인 수업 장소가 변경됩니다.

**기존**: 서울시 강남구 테헤란로 123, 5층
**변경**: 서울시 마포구 월드컵북로 396, 상암 디지털미디어시티 15층

주차 지원이 가능하며, 6호선 디지털미디어시티역 2번 출구에서 도보 3분 거리입니다.

불편을 드려 죄송합니다. 더 넓고 쾌적한 환경에서 수업을 진행할 수 있게 되었습니다.`,
      category: 'notice',
      published: true,
    },
    {
      title: '겨울 방학 특별 워크숍: AI와 콘텐츠 제작',
      content: `ChatGPT, Midjourney, Suno AI 등 최신 AI 도구를 활용한 콘텐츠 제작 특별 워크숍을 개최합니다.

## 일시 및 장소
- **일시**: 2026년 1월 15일 ~ 17일 (3일간)
- **시간**: 오전 10시 ~ 오후 4시
- **장소**: 상암 디지털미디어시티 컨퍼런스홀

## 워크숍 내용
- Day 1: AI 도구 소개 및 ChatGPT 활용 글쓰기
- Day 2: AI 이미지/음악 생성 실습
- Day 3: AI로 완성하는 숏폼 영상 제작

**수강료**: 200,000원 (기존 수강생 50% 할인)`,
      category: 'notice',
      published: true,
    },
    {
      title: '2025년 연말 수료식 및 네트워킹 데이 안내',
      content: `2025년 한 해를 마무리하며 수료식과 네트워킹 행사를 진행합니다.

- **일시**: 2025년 12월 20일 (금) 오후 3시
- **장소**: JW 메리어트 동대문 스퀘어 2층
- **참석 대상**: 2025년 수료생 전원 (동반 1인 가능)

### 프로그램
- 15:00 수료식 및 우수 수강생 시상
- 16:00 특별 강연: "시니어 크리에이터의 미래"
- 17:00 네트워킹 파티 (다과 제공)

RSVP는 12월 15일까지 이메일로 회신 부탁드립니다.`,
      category: 'notice',
      published: true,
    },
    // review (4개)
    {
      title: '[수강 후기] 60대도 유튜버가 될 수 있습니다',
      content: `처음에는 스마트폰 사용도 서툴렀는데, 최 PD님의 차근차근한 설명 덕분에 이제는 구독자 800명의 요리 채널을 운영하고 있습니다.

"할 수 있다"는 자신감을 준 최고의 수업이었습니다. 같은 반 동기들과 지금도 매주 모여서 서로의 영상을 봐주고 피드백하고 있어요.

은퇴 후 집에서 무기력하게 지내던 제가, 지금은 매일 아침 "오늘은 어떤 콘텐츠를 만들까" 설레며 하루를 시작합니다.

**— 김영숙 (62세, 요리 유튜버 '영숙이의 집밥')**`,
      category: 'review',
      published: true,
    },
    {
      title: '[수강 후기] 네이버 스마트스토어로 월 매출 300만원 달성',
      content: `소상공인 디지털 마케팅 과정을 수강한 후 인생이 바뀌었습니다.

원래 오프라인 꽃집만 운영했는데, 수업에서 배운 대로 네이버 스마트스토어를 열고, 인스타그램으로 마케팅을 시작했더니 3개월 만에 온라인 월 매출 300만원을 달성했습니다.

특히 상품 사진 촬영 팁이 큰 도움이 되었어요. 스마트폰 하나로 이렇게 멋진 상품 사진을 찍을 수 있다니!

**— 박정미 (55세, '정미플라워' 대표)**`,
      category: 'review',
      published: true,
    },
    {
      title: '[수강 후기] 은퇴 후 제2의 인생을 찾았습니다',
      content: `35년 교직 생활을 마치고 뭘 해야 할지 막막했습니다. 우연히 최 PD님의 스마트폰 창업 과정을 알게 되었고, "이건 나를 위한 수업이다"라고 직감했어요.

지금은 '은퇴교사의 세계여행'이라는 유튜브 채널로 여행 브이로그를 올리고 있습니다. 구독자 1,500명이 넘었고, 영상 하나에 조회수 5만이 넘기도 해요.

무엇보다 매일이 즐겁고, 배우고 도전하는 삶이 다시 시작된 느낌입니다.

**— 이종호 (64세, 전직 교사, 여행 유튜버)**`,
      category: 'review',
      published: true,
    },
    {
      title: '[수강 후기] 마을 기업 디지털 전환 성공기',
      content: `우리 마을 기업 '행복한 떡방앗간'에서 기업 맞춤형 교육을 받았습니다.

직원 8명 모두 참여했는데, 교육 후 카카오톡 채널 친구 수가 3배 늘었고, 네이버 플레이스 리뷰도 200개를 넘겼습니다.

"이 나이에 무슨 SNS냐"고 하시던 어르신 직원분도 이제는 인스타그램에 떡 사진을 올리시며 즐거워하세요.

**— 최은정 (48세, '행복한 떡방앗간' 대표)**`,
      category: 'review',
      published: true,
    },
    // media (3개)
    {
      title: '한국환경저널 창간 2주년 기념호 발행',
      content: `한국환경저널이 창간 2주년을 맞이하여 기념 특별호를 발행합니다.

이번 호에서는 '기후위기 시대, 시민 저널리즘의 역할'이라는 주제로 국내외 환경 전문가 12인의 기고문을 실었습니다.

또한 지난 2년간의 주요 보도를 돌아보고, 독자 여러분이 보내주신 환경 사진 30선도 함께 게재합니다.

**발행일**: 2026년 3월 1일
**구독 문의**: media@chopd.kr`,
      category: 'media',
      published: true,
    },
    {
      title: '[언론 보도] MBC 뉴스데스크 — 시니어 크리에이터 열풍',
      content: `MBC 뉴스데스크에서 '5060 시니어 크리에이터' 특집을 방영했습니다.

최범희 PD가 출연하여 시니어 세대의 디지털 콘텐츠 제작 역량과 가능성에 대해 인터뷰했으며, 수강생 3명의 성공 사례가 함께 소개되었습니다.

방송 이후 수강 문의가 300% 증가했으며, 전국 지자체에서 협력 요청이 쇄도하고 있습니다.

📺 방송일시: 2026년 2월 15일 (토) 저녁 8시 뉴스데스크`,
      category: 'media',
      published: true,
    },
    {
      title: '[언론 보도] 조선일보 — "스마트폰 하나로 인생 2막"',
      content: `조선일보 주말 특집 '인생 2막, 디지털로 시작하다' 시리즈에 최범희 PD의 스마트폰 창업 교육이 크게 소개되었습니다.

기사에서는 수강생 김영숙 씨(62세)의 사례를 중심으로, 6개월 만에 유튜브 구독자 800명을 달성하고 광고 수익까지 올리게 된 과정을 상세히 다루었습니다.

"디지털 교육은 단순 기술 전수가 아니라, 새로운 삶의 가능성을 여는 것"이라는 최 PD의 철학이 인상적이었다는 후기가 많았습니다.

📰 게재일: 2026년 1월 28일 (수) 조선일보 A12면`,
      category: 'media',
      published: true,
    },
  ]);

  // ============================
  // 3. 작품 — 갤러리 (8개) + 언론보도 (6개)
  // ============================
  console.log('🎨 갤러리 작품 8개 + 언론보도 6개 삽입...');
  await db.insert(works).values([
    // gallery (8개) - Unsplash 이미지 사용
    {
      title: '제주도 해변 풍경',
      description: '스마트폰으로 포착한 제주도 협재해수욕장의 에메랄드빛 바다. 파도 소리가 들리는 듯한 순간을 담았습니다.',
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    {
      title: '서울 남산타워 야경',
      description: '남산에서 바라본 서울 도심의 화려한 야경. 모바일 나이트모드로 촬영한 작품입니다.',
      imageUrl: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    {
      title: '봄의 벚꽃길',
      description: '여의도 한강공원 벚꽃길의 만개한 벚꽃. 핑크빛 터널 아래서 산책하는 시민들의 모습.',
      imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    {
      title: '전통시장의 활기',
      description: '광장시장의 먹거리 골목. 형형색색의 음식들과 활기찬 시장 분위기를 담은 스트리트 포토.',
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    {
      title: '가을 단풍 산책로',
      description: '내장산 단풍 터널 속 가을의 절정. 붉고 노란 단풍잎이 수놓은 산책로를 걸으며.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    {
      title: '한옥마을의 고즈넉함',
      description: '전주 한옥마을의 전통 기와지붕과 처마 곡선. 과거와 현재가 공존하는 아름다운 공간.',
      imageUrl: 'https://images.unsplash.com/photo-1553619538-b04d8a3ef7dd?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    {
      title: '해운대 일출',
      description: '부산 해운대 해변에서 맞이한 장엄한 일출. 수평선 위로 솟아오르는 태양의 황금빛.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    {
      title: '도시의 빗속 풍경',
      description: '비 내리는 서울 종로 거리. 우산 쓴 사람들과 젖은 도로에 반사되는 네온사인의 영롱한 빛.',
      imageUrl: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=600&h=600&fit=crop',
      category: 'gallery',
    },
    // press (6개)
    {
      title: '조선일보 — "스마트폰 하나로 인생 2막"',
      description: '5060 세대의 스마트폰 창업 교육 성공 사례를 심층 보도. 수강생 인터뷰와 매출 성장 데이터 포함.',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=600&h=400&fit=crop',
      category: 'press',
    },
    {
      title: 'KBS 뉴스 — 시니어 유튜버 시대',
      description: 'KBS 저녁 뉴스에 소개된 시니어 유튜버 양성 프로그램. 전국 최초 체계적 시니어 크리에이터 과정으로 주목.',
      imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&h=400&fit=crop',
      category: 'press',
    },
    {
      title: 'MBC 뉴스데스크 — 5060 디지털 창업 열풍',
      description: '뉴스데스크 메인 뉴스로 보도된 시니어 디지털 창업 열풍. 최범희 PD 인터뷰 및 교육 현장 취재.',
      imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop',
      category: 'press',
    },
    {
      title: '한겨레 — 환경저널리즘의 새 지평',
      description: '한국환경저널 창간 특집 기사. 시민 환경 저널리즘의 가치와 미래에 대한 심층 인터뷰.',
      imageUrl: 'https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=600&h=400&fit=crop',
      category: 'press',
    },
    {
      title: '매일경제 — 디지털 교육이 만드는 제2의 인생',
      description: '매일경제 라이프 섹션 특집. 은퇴자의 디지털 역량 교육이 사회에 미치는 긍정적 영향 분석.',
      imageUrl: 'https://images.unsplash.com/photo-1586339949216-35c2747cc36d?w=600&h=400&fit=crop',
      category: 'press',
    },
    {
      title: 'SBS 모닝와이드 — 스마트폰 크리에이터의 하루',
      description: 'SBS 모닝와이드에서 방영된 시니어 크리에이터의 일상. 하루를 콘텐츠 제작으로 알차게 보내는 모습.',
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop',
      category: 'press',
    },
  ]);

  // ============================
  // 4. 히어로 이미지 (settings 테이블에 URL 배열 저장)
  // ============================
  console.log('🖼️  히어로 이미지 설정...');
  const heroImageUrls = [
    'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&h=1080&fit=crop&q=80',
  ];
  await db.insert(settings).values({
    key: 'hero_images',
    value: JSON.stringify(heroImageUrls),
  });

  // ============================
  // 5. 소셜 링크 설정
  // ============================
  console.log('🔗 소셜 링크 설정...');
  await db.insert(settings).values({
    key: 'social_links',
    value: JSON.stringify([
      { platform: 'youtube', url: 'https://youtube.com/@chopd', label: 'YouTube' },
      { platform: 'instagram', url: 'https://instagram.com/chopd_official', label: 'Instagram' },
      { platform: 'facebook', url: 'https://facebook.com/chopd.kr', label: 'Facebook' },
      { platform: 'blog', url: 'https://blog.naver.com/chopd', label: 'Naver Blog' },
    ]),
  });

  // ============================
  // 6. 뉴스레터 구독자 (10명)
  // ============================
  console.log('📧 뉴스레터 구독자 10명 삽입...');
  await db.insert(leads).values([
    { email: 'kim.youngsook@gmail.com' },
    { email: 'park.jungmi@naver.com' },
    { email: 'lee.jongho@hanmail.net' },
    { email: 'choi.eunjeong@gmail.com' },
    { email: 'hong.gildong@naver.com' },
    { email: 'seo.minji@gmail.com' },
    { email: 'jang.sunwoo@kakao.com' },
    { email: 'yoon.haerim@naver.com' },
    { email: 'shin.donghyuk@gmail.com' },
    { email: 'oh.sunyoung@hanmail.net' },
  ]);

  console.log('');
  console.log('✅ Demo seed 완료!');
  console.log('📊 삽입된 데이터:');
  console.log('   📚 교육 과정: 8개');
  console.log('   📢 공지/소식: 12개 (notice 5, review 4, media 3)');
  console.log('   🎨 갤러리: 8개');
  console.log('   📰 언론보도: 6개');
  console.log('   🖼️  히어로 이미지: 4개');
  console.log('   🔗 소셜 링크: 4개');
  console.log('   📧 뉴스레터 구독자: 10명');
  console.log('');
  console.log('🌐 http://localhost:3008/chopd 에서 확인하세요!');
}

seedDemo()
  .catch((error) => {
    console.error('❌ Demo seed 실패:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
