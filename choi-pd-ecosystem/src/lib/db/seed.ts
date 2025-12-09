/**
 * 데이터베이스 시드 스크립트
 * 기본 히어로 이미지 데이터 추가
 */

import { db } from './index';
import { heroImages } from './schema';

async function seedHeroImages() {
  console.log('Seeding hero images...');

  // 기본 히어로 이미지 데이터 (fallback 이미지)
  const defaultHeroImage = {
    filename: 'hero-default.jpg',
    url: '/uploads/hero/hero-default.jpg',
    altText: '최범희 PD의 교육, 미디어, 작품 활동을 소개하는 이미지',
    fileSize: 1048576, // 1MB (예시)
    width: 1920,
    height: 1080,
    uploadStatus: 'completed' as const,
    isActive: true,
  };

  try {
    const result = await db.insert(heroImages).values(defaultHeroImage).returning();
    console.log('Hero image seeded:', result[0]);
  } catch (error) {
    console.error('Error seeding hero images:', error);
  }
}

async function main() {
  console.log('Starting database seeding...\n');

  await seedHeroImages();

  console.log('\nDatabase seeding completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
