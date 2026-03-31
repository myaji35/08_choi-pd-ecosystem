import { db } from '@/lib/db';
import { courses, posts, settings } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { HeroSection } from '@/components/home/HeroSection';
import { ServiceHubSection } from '@/components/home/ServiceHubSection';
import { LatestCoursesSection } from '@/components/home/LatestCoursesSection';
import { WhyImpdSection } from '@/components/home/WhyImpdSection';
import { PricingSection } from '@/components/home/PricingSection';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { FAQSection } from '@/components/home/FAQSection';
import { CostCalculatorSection } from '@/components/home/CostCalculatorSection';
import { InteractiveDemoSection } from '@/components/home/InteractiveDemoSection';
import { CTABandSection } from '@/components/home/CTABandSection';
import { StickyMobileCTA } from '@/components/home/StickyMobileCTA';
import { StructuredData } from '@/components/seo/StructuredData';
import { getSocialLinks } from '@/lib/db/queries/socialLinks';
import { generatePersonSchema, generateOrganizationSchema } from '@/lib/seo';
import { stat } from 'fs/promises';
import { join } from 'path';

export const revalidate = 60; // ISR: 1분마다 재생성 (프로필 이미지 업데이트 반영)

export default async function HomePage() {
  // 최신 교육 과정 3개 조회
  const latestCourses = await db.query.courses.findMany({
    where: eq(courses.published, true),
    orderBy: [desc(courses.createdAt)],
    limit: 3,
  });

  // 프로필 이미지 파일의 수정 시간을 가져와서 캐시 버스팅
  let profileImageTimestamp = Date.now();
  try {
    const profilePath = join(process.cwd(), 'public', 'images', 'profile.jpg');
    const stats = await stat(profilePath);
    profileImageTimestamp = stats.mtimeMs;
  } catch (error) {
    console.error('Failed to get profile image timestamp:', error);
  }

  // Hero 이미지 가져오기
  const heroImagesSettings = await db.query.settings.findFirst({
    where: eq(settings.key, 'hero_images'),
  });

  const heroImages = heroImagesSettings?.value
    ? JSON.parse(heroImagesSettings.value)
    : [];

  // 백그라운드: 소셜 링크 가져와서 구조화 데이터에 자동 반영
  const socialLinks = await getSocialLinks();

  // SoftwareApplication JSON-LD (GEO/SEO)
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'imPD',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: '1인 사업자/프리랜서를 위한 AI 브랜드 매니저. SNS 콘텐츠 자동 생성, 멀티채널 예약 발행, 성과 분석을 하나의 플랫폼에서 제공합니다.',
    url: 'https://impd.com',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'KRW', name: 'Free', description: '기본 브랜드 페이지 1개, AI 콘텐츠 생성 월 5회, SNS 채널 1개' },
      { '@type': 'Offer', price: '19000', priceCurrency: 'KRW', name: 'Pro', description: '브랜드 페이지 무제한, AI 콘텐츠 무제한, SNS 채널 5개, 예약 발행' },
      { '@type': 'Offer', price: '59000', priceCurrency: 'KRW', name: 'Biz', description: 'Pro 모든 기능 + 팀 멤버 5명, 전담 매니저, SLA 99.9%' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '500',
      bestRating: '5',
    },
    featureList: [
      'AI 콘텐츠 자동 생성',
      '11개 SNS/블로그 채널 동시 발행',
      '브랜드 페이지 빌더',
      '성과 분석 대시보드',
      '뉴스레터 발송',
      '예약 발행 자동화',
    ],
    inLanguage: 'ko',
  };

  return (
    <>
      {/* 네이버 인물정보 + Google Knowledge Panel용 구조화 데이터 */}
      <StructuredData data={generatePersonSchema(socialLinks)} />
      <StructuredData data={generateOrganizationSchema(socialLinks)} />
      <StructuredData data={softwareAppSchema} />
      <HeroSection
        profileImageTimestamp={profileImageTimestamp}
        heroImages={heroImages}
      />
      <InteractiveDemoSection />
      <ServiceHubSection />
      <WhyImpdSection />
      <SocialProofSection />
      <LatestCoursesSection courses={latestCourses} />
      <CostCalculatorSection />
      <PricingSection />
      <FAQSection />
      <CTABandSection />
      <StickyMobileCTA />
    </>
  );
}
