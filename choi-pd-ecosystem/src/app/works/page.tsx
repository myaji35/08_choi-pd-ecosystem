import { db } from '@/lib/db';
import { works } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { WorksHeroSection } from '@/components/works/WorksHeroSection';
import { BooksSection } from '@/components/works/BooksSection';
import { GallerySection } from '@/components/works/GallerySection';
import { PressSection } from '@/components/works/PressSection';

export const revalidate = 60; // ISR: 1분마다 재생성

export default async function WorksPage() {
  // 갤러리 작품 조회
  const galleryWorks = await db.query.works.findMany({
    where: eq(works.category, 'gallery'),
    orderBy: (works, { desc }) => [desc(works.createdAt)],
  });

  // 언론 보도 조회
  const pressWorks = await db.query.works.findMany({
    where: eq(works.category, 'press'),
    orderBy: (works, { desc }) => [desc(works.createdAt)],
  });

  return (
    <div className="min-h-screen">
      <WorksHeroSection />
      <BooksSection />
      <GallerySection works={galleryWorks} />
      <PressSection works={pressWorks} />
    </div>
  );
}
