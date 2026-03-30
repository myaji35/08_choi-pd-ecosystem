import { db } from '@/lib/db';
import { courses, posts, settings } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { HeroSection } from '@/components/home/HeroSection';
import { ServiceHubSection } from '@/components/home/ServiceHubSection';
import { LatestCoursesSection } from '@/components/home/LatestCoursesSection';
import { WhyImpdSection } from '@/components/home/WhyImpdSection';
import { PricingSection } from '@/components/home/PricingSection';
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

  return (
    <>
      {/* 네이버 인물정보 + Google Knowledge Panel용 구조화 데이터 */}
      <StructuredData data={generatePersonSchema(socialLinks)} />
      <StructuredData data={generateOrganizationSchema(socialLinks)} />
      <HeroSection
        profileImageTimestamp={profileImageTimestamp}
        heroImages={heroImages}
      />
      <ServiceHubSection />
      <WhyImpdSection />
      <LatestCoursesSection courses={latestCourses} />
      <PricingSection />
    </>
  );
}
