import { db } from '@/lib/db';
import { posts, leads } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { CommunityHeroSection } from '@/components/community/CommunityHeroSection';
import { AnnouncementsSection } from '@/components/community/AnnouncementsSection';
import { NewsletterSection } from '@/components/community/NewsletterSection';
import { ContactSection } from '@/components/community/ContactSection';

export const revalidate = 60; // ISR: 1분마다 재생성

export const metadata = {
  title: '커뮤니티',
  description: '공지사항 및 소식을 확인하고, 뉴스레터를 구독하세요',
};

export default async function CommunityPage() {
  // 공지사항 조회 (최근 10개)
  const announcements = await db.query.posts.findMany({
    where: eq(posts.published, true),
    orderBy: [desc(posts.createdAt)],
    limit: 10,
  });

  return (
    <div className="min-h-screen">
      <CommunityHeroSection />
      <AnnouncementsSection posts={announcements} />
      <ContactSection />
      <NewsletterSection />
    </div>
  );
}
