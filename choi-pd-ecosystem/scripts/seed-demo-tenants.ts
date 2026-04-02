/**
 * ISS-015: 직종별 데모 테넌트 6개 시드
 * 각 직종에 맞는 완성된 프로필 + 교육과정 + SNS 계정
 */
import { db } from '../src/lib/db';
import { tenants, courses, snsAccounts } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const DEMO_TENANTS = [
  {
    slug: 'demo-pd',
    name: '김민준 PD',
    profession: 'pd' as const,
    primaryColor: '#E4405F',
    secondaryColor: '#FF6B6B',
    bio: '15년차 방송 PD. EBS 다큐멘터리, 유튜브 200만 구독 채널 운영. 1인 미디어 제작 교육 전문.',
    courses: [
      { title: '유튜브 크리에이터 입문', type: 'online' as const, price: 89000, description: '카메라 기초부터 편집, 채널 운영까지 8주 완성 과정' },
      { title: '1인 미디어 제작 워크숍', type: 'offline' as const, price: 250000, description: '현장 촬영 + 실시간 편집 + 라이브 방송 실습 (주말 2일)' },
    ],
    sns: [
      { platform: 'youtube', accountName: '김민준PD TV' },
      { platform: 'instagram', accountName: '@minjun.pd' },
    ],
  },
  {
    slug: 'demo-shopowner',
    name: '박서윤 대표',
    profession: 'shopowner' as const,
    primaryColor: '#FF6B35',
    secondaryColor: '#FFA07A',
    bio: '수제 천연비누 공방 "소나무비누" 대표. 네이버 스마트스토어 월 매출 3천만원. 입점업체 40곳 관리.',
    courses: [
      { title: '스마트스토어 A to Z', type: 'online' as const, price: 129000, description: '상품 등록, SEO, 광고 세팅까지 한 번에 배우는 과정' },
      { title: '핸드메이드 창업 캠프', type: 'offline' as const, price: 350000, description: '천연비누 제작 + 브랜딩 + 온라인 판매 전략 (3일)' },
    ],
    sns: [
      { platform: 'instagram', accountName: '@sonamoo.soap' },
      { platform: 'facebook', accountName: '소나무비누 공식' },
    ],
  },
  {
    slug: 'demo-realtor',
    name: '이정호 공인중개사',
    profession: 'realtor' as const,
    primaryColor: '#2EC4B6',
    secondaryColor: '#45D4C6',
    bio: '강남/서초 전문 20년. 상업용 부동산 컨설팅. 월평균 15건 거래 성사. 부동산 투자 강의 500회+.',
    courses: [
      { title: '부동산 투자 기초 세미나', type: 'offline' as const, price: 50000, description: '첫 매수부터 절세까지, 왕초보를 위한 3시간 세미나' },
      { title: '상업용 부동산 분석법', type: 'online' as const, price: 199000, description: '수익률 분석, 입지 평가, 임대차 관리까지 (6주)' },
    ],
    sns: [
      { platform: 'youtube', accountName: '이정호의 부동산 시장' },
      { platform: 'instagram', accountName: '@jhlee.realty' },
    ],
  },
  {
    slug: 'demo-educator',
    name: '최유진 강사',
    profession: 'educator' as const,
    primaryColor: '#00A1E0',
    secondaryColor: '#4FC3F7',
    bio: '수학 전문 강사 12년차. 대치동 학원 → 온라인 강의 전환. 누적 수강생 8,000명. SKY 합격률 87%.',
    courses: [
      { title: '수능 수학 킬러문항 정복', type: 'online' as const, price: 159000, description: '기출 10년 분석 + 풀이 전략 + 모의고사 5회분' },
      { title: '중등 수학 기초 다지기', type: 'online' as const, price: 79000, description: '중1~중3 핵심 개념 정리 + 문제풀이 (12주)' },
    ],
    sns: [
      { platform: 'youtube', accountName: '유진쌤 수학교실' },
      { platform: 'instagram', accountName: '@yujin.math' },
    ],
  },
  {
    slug: 'demo-insurance',
    name: '한승우 설계사',
    profession: 'insurance' as const,
    primaryColor: '#7B61FF',
    secondaryColor: '#A78BFA',
    bio: 'MDRT 5년 연속 달성. 법인보험 전문. 무료 재무 진단 제공. 고객 만족도 4.9/5.0.',
    courses: [
      { title: '보험 설계 기초 특강', type: 'online' as const, price: 0, description: '생명보험 vs 손해보험, 내게 맞는 보험 찾기 (무료)' },
      { title: 'CEO를 위한 법인보험 전략', type: 'b2b' as const, price: 500000, description: '법인세 절감 + 퇴직금 설계 + 상속 플래닝 (기업 단체 강의)' },
    ],
    sns: [
      { platform: 'linkedin', accountName: '한승우 MDRT' },
      { platform: 'instagram', accountName: '@sw.insurance.pro' },
    ],
  },
  {
    slug: 'demo-freelancer',
    name: '김하늘 디자이너',
    profession: 'freelancer' as const,
    primaryColor: '#16325C',
    secondaryColor: '#3B82F6',
    bio: 'UI/UX 디자이너 & 브랜드 컨설턴트. 스타트업 30개+ 브랜딩. 전 카카오 프로덕트 디자이너. 프리랜서 3년차.',
    courses: [
      { title: 'Figma 마스터 클래스', type: 'online' as const, price: 149000, description: '오토 레이아웃, 컴포넌트, 프로토타이핑 완전 정복' },
      { title: '브랜드 아이덴티티 워크숍', type: 'offline' as const, price: 450000, description: '로고 + 컬러시스템 + 타이포그래피 + 가이드라인 (2일)' },
    ],
    sns: [
      { platform: 'instagram', accountName: '@haneul.design' },
      { platform: 'twitter', accountName: '@haneul_ux' },
    ],
  },
];

async function seedDemoTenants() {
  console.log('🎯 직종별 데모 테넌트 시드 시작...\n');

  for (const demo of DEMO_TENANTS) {
    // 기존 데모 테넌트 삭제 (FK 순서: 자식 → 부모)
    const existing = await db.select().from(tenants).where(eq(tenants.slug, demo.slug)).get();
    if (existing) {
      await db.delete(courses).where(eq(courses.tenantId, existing.id));
      await db.delete(snsAccounts).where(eq(snsAccounts.tenantId, existing.id));
      await db.delete(tenants).where(eq(tenants.slug, demo.slug));
    }

    // 테넌트 생성 (데모용 clerkUserId)
    const [tenant] = await db.insert(tenants).values({
      clerkUserId: `demo_${demo.slug}`,
      name: demo.name,
      slug: demo.slug,
      profession: demo.profession,
      primaryColor: demo.primaryColor,
      secondaryColor: demo.secondaryColor,
      plan: 'pro',
      status: 'active',
      settings: JSON.stringify({ bio: demo.bio }),
    }).returning();

    console.log(`  ✅ ${demo.name} (${demo.slug}) — ID: ${tenant.id}`);

    // 교육과정 시드
    for (const course of demo.courses) {
      await db.insert(courses).values({
        tenantId: tenant.id,
        title: course.title,
        type: course.type,
        price: course.price,
        description: course.description,
        published: true,
      });
    }
    console.log(`     📚 교육과정 ${demo.courses.length}개`);

    // SNS 계정 시드
    for (const sns of demo.sns) {
      await db.insert(snsAccounts).values({
        tenantId: tenant.id,
        platform: sns.platform,
        accountName: sns.accountName,
        accessToken: 'demo-token',
        isActive: true,
      });
    }
    console.log(`     🔗 SNS 계정 ${demo.sns.length}개`);
  }

  console.log(`\n🎉 완료: ${DEMO_TENANTS.length}개 데모 테넌트 생성`);
  console.log('   접속: /p/demo-pd, /p/demo-shopowner, /p/demo-realtor, /p/demo-educator, /p/demo-insurance, /p/demo-freelancer');
}

seedDemoTenants().catch(console.error);
