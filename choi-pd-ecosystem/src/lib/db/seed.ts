/**
 * 데이터베이스 시드 스크립트
 * 기본 히어로 이미지 데이터 추가
 */

import { db } from './index';
import { heroImages, tenants, courses, works, posts } from './schema';

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

async function seedDefaultTenant() {
  console.log('Seeding default tenant...');
  try {
    const existing = await db.select().from(tenants).where(
      require('drizzle-orm').eq(tenants.id, 1)
    ).get();
    if (existing) {
      console.log('Default tenant already exists, skipping');
      return;
    }
    const result = await db.insert(tenants).values({
      clerkUserId: 'system',
      name: 'chopd',
      slug: 'chopd',
      profession: 'pd',
      plan: 'enterprise',
      status: 'active',
    }).returning();
    console.log('Default tenant seeded:', result[0]);
  } catch (error) {
    console.error('Error seeding default tenant:', error);
  }
}

async function seedCourses() {
  console.log('Seeding courses...');
  try {
    const sampleCourses = [
      {
        tenantId: 1,
        title: '스마트폰 창업 입문',
        description: '스마트폰 하나로 시작하는 1인 창업의 모든 것. 기초부터 실전까지 단계별로 배우는 온라인 과정입니다.',
        type: 'online' as const,
        price: 0,
        thumbnailUrl: '/images/courses/smartphone-startup.jpg',
        externalLink: null,
        published: true,
      },
      {
        tenantId: 1,
        title: 'SNS 마케팅 실전',
        description: 'Instagram, YouTube, TikTok 등 주요 SNS 채널을 활용한 마케팅 전략을 오프라인에서 직접 배워보세요.',
        type: 'offline' as const,
        price: 99000,
        thumbnailUrl: '/images/courses/sns-marketing.jpg',
        externalLink: null,
        published: true,
      },
      {
        tenantId: 1,
        title: 'B2B 디지털 전환 컨설팅',
        description: '기업 및 기관을 위한 맞춤형 디지털 전환 컨설팅 프로그램. 조직의 디지털 역량을 한 단계 끌어올립니다.',
        type: 'b2b' as const,
        price: null,
        thumbnailUrl: '/images/courses/b2b-consulting.jpg',
        externalLink: null,
        published: true,
      },
    ];

    for (const course of sampleCourses) {
      const result = await db.insert(courses).values(course).returning();
      console.log('  Course seeded:', result[0]?.title);
    }
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
}

async function seedWorks() {
  console.log('Seeding works (gallery + press)...');
  try {
    const sampleWorks = [
      // 저서 (gallery)
      {
        tenantId: 1,
        title: '스마트폰으로 시작하는 1인 창업',
        description: '스마트폰 하나로 사업을 시작하는 실전 가이드. 베이비붐 세대를 위한 친절한 창업 입문서.',
        imageUrl: '/images/books/smartphone-startup-book.jpg',
        category: 'gallery' as const,
      },
      {
        tenantId: 1,
        title: '디지털 마케팅 실전 가이드',
        description: 'SNS, 검색엔진, 이메일 마케팅의 핵심 전략을 담은 실전서. 소상공인과 1인 사업자를 위한 필독서.',
        imageUrl: '/images/books/digital-marketing-guide.jpg',
        category: 'gallery' as const,
      },
      // 언론보도 (press)
      {
        tenantId: 1,
        title: '한국환경저널, AI 브랜드 매니저 도입',
        description: '한국환경저널이 AI 기반 브랜드 매니저 시스템을 도입하여 콘텐츠 제작 효율을 혁신적으로 높였다.',
        imageUrl: '/images/press/ai-brand-manager.jpg',
        category: 'press' as const,
      },
      {
        tenantId: 1,
        title: '1인 사업자를 위한 SaaS 플랫폼 출시',
        description: 'imPD가 개인사업자와 프리랜서를 위한 통합 브랜드 허브 SaaS 플랫폼을 정식 출시했다.',
        imageUrl: '/images/press/saas-platform-launch.jpg',
        category: 'press' as const,
      },
    ];

    for (const work of sampleWorks) {
      const result = await db.insert(works).values(work).returning();
      console.log('  Work seeded:', result[0]?.title, `(${result[0]?.category})`);
    }
  } catch (error) {
    console.error('Error seeding works:', error);
  }
}

async function seedPosts() {
  console.log('Seeding posts...');
  try {
    const samplePosts = [
      {
        tenantId: 1,
        title: 'imPD 서비스 오픈 안내',
        content: '안녕하세요, imPD 서비스가 정식 오픈했습니다.\n\nimPD는 개인사업자, 프리랜서, PD를 위한 통합 브랜드 허브 플랫폼입니다. 교육 과정 관리, SNS 연동, 유통사 관리 등 다양한 기능을 제공합니다.\n\n많은 관심과 이용 부탁드립니다.',
        category: 'notice' as const,
        published: true,
      },
      {
        tenantId: 1,
        title: '3월 교육 과정 안내',
        content: '3월 새로운 교육 과정이 준비되었습니다.\n\n1. 스마트폰 창업 입문 (온라인, 무료)\n2. SNS 마케팅 실전 (오프라인, 99,000원)\n3. B2B 디지털 전환 컨설팅 (기업/기관 대상, 문의)\n\n자세한 내용은 교육 페이지에서 확인해 주세요.',
        category: 'notice' as const,
        published: true,
      },
    ];

    for (const post of samplePosts) {
      const result = await db.insert(posts).values(post).returning();
      console.log('  Post seeded:', result[0]?.title);
    }
  } catch (error) {
    console.error('Error seeding posts:', error);
  }
}

async function main() {
  console.log('Starting database seeding...\n');

  await seedDefaultTenant();
  await seedHeroImages();
  await seedCourses();
  await seedWorks();
  await seedPosts();

  console.log('\nDatabase seeding completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
