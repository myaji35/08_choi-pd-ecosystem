import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { HeroImagesManager } from '@/components/admin/HeroImagesManager';

export default async function AdminHeroImagesPage() {
  // Hero 이미지 설정 가져오기
  const heroImagesSettings = await db.query.settings.findFirst({
    where: (settings, { eq }) => eq(settings.key, 'hero_images'),
  });

  const heroImages = heroImagesSettings?.value
    ? JSON.parse(heroImagesSettings.value)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hero 이미지 관리</h1>
        <p className="text-muted-foreground">
          랜딩 페이지 배경에 표시될 이미지들을 관리합니다 (최대 5개)
        </p>
      </div>

      <HeroImagesManager initialImages={heroImages} />
    </div>
  );
}
