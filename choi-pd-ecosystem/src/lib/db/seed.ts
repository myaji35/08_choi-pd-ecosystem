/**
 * pt0 t¤ ÜÜ ¤l½¸
 * 0 ˆ´\ tøÀ pt0 ½…
 */

import { db } from './index';
import { heroImages } from './schema';

async function seedHeroImages() {
  console.log('<1 Seeding hero images...');

  // 0ø ˆ´\ tøÀ pt0 (fallback tøÀ)
  const defaultHeroImage = {
    filename: 'hero-default.jpg',
    url: '/uploads/hero/hero-default.jpg',
    altText: '\”l PDX P!, ø´, ‘ˆ \ÙD ÁÕX” tøÀ',
    fileSize: 1048576, // 1MB (Ü)
    width: 1920,
    height: 1080,
    uploadStatus: 'completed' as const,
    isActive: true,
  };

  try {
    const result = await db.insert(heroImages).values(defaultHeroImage).returning();
    console.log(' Hero image seeded:', result[0]);
  } catch (error) {
    console.error('L Error seeding hero images:', error);
  }
}

async function main() {
  console.log('=€ Starting database seeding...\n');

  await seedHeroImages();

  console.log('\n( Database seeding completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
