import { db } from '../src/lib/db';
import { courses, posts, works, adminUsers } from '../src/lib/db/schema';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('🌱 Seeding database...');

  // 관리자 계정 추가
  console.log('👤 Adding admin users...');
  await db.insert(adminUsers).values([
    {
      username: 'admin',
      password: hashPassword('admin123'),
      role: 'admin',
    },
    {
      username: 'superadmin',
      password: hashPassword('gmldnjs!00'),
      role: 'superadmin',
    },
  ]);

  // 샘플 교육 과정 추가
  console.log('📚 Adding sample courses...');
  await db.insert(courses).values([
    {
      title: '스마트폰 창업 기초 과정',
      description: '5060 베이비부머를 위한 스마트폰 활용 창업 교육. 기초부터 실전까지 체계적으로 배웁니다.',
      type: 'online',
      price: 100000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
      published: true,
    },
    {
      title: '소상공인 디지털 마케팅',
      description: '소상공인을 위한 실전 디지털 마케팅 전략. SNS, 블로그, 영상 제작까지.',
      type: 'offline',
      price: 150000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop',
      published: true,
    },
    {
      title: '기업 맞춤형 미디어 리터러시',
      description: '기업 임직원을 위한 스마트폰 활용 교육 및 미디어 리터러시 향상 과정.',
      type: 'b2b',
      price: null, // 견적 문의
      thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
      published: true,
    },
  ]);

  // 샘플 공지사항 추가
  console.log('📢 Adding sample posts...');
  await db.insert(posts).values([
    {
      title: '2025년 1기 스마트폰 창업 과정 모집',
      content: `2025년 1기 스마트폰 창업 과정 수강생을 모집합니다.

## 모집 대상
- 제2의 인생을 준비하는 5060 세대
- 스마트폰으로 창업을 꿈꾸는 분
- 디지털 전환이 필요한 소상공인

## 과정 개요
- 기간: 8주 (주 2회)
- 장소: 온라인 ZOOM
- 수강료: 100,000원

많은 관심 부탁드립니다!`,
      category: 'notice',
      published: true,
    },
    {
      title: '[수강 후기] 60대도 유튜버가 될 수 있습니다',
      content: '처음에는 스마트폰 사용도 서툴렀는데, 최 PD님의 차근차근한 설명 덕분에 이제는 제 채널을 운영하고 있습니다. 감사합니다!',
      category: 'review',
      published: true,
    },
    {
      title: '한국환경저널 창간 1주년',
      content: '한국환경저널이 창간 1주년을 맞이했습니다. 그동안 응원해주신 모든 분들께 감사드립니다.',
      category: 'media',
      published: true,
    },
    {
      title: '소상공인 무료 컨설팅 안내',
      content: '어려운 시기를 겪고 있는 소상공인을 위한 무료 디지털 마케팅 컨설팅을 진행합니다. 신청 기한은 12월 31일까지입니다.',
      category: 'notice',
      published: true,
    },
    {
      title: '[언론 보도] MBC 뉴스데스크 출연',
      content: '5060 스마트폰 창업 열풍에 대한 인터뷰로 MBC 뉴스데스크에 출연했습니다.',
      category: 'media',
      published: true,
    },
  ]);

  // 샘플 갤러리 및 언론 보도 추가
  console.log('🖼️ Adding sample works...');
  await db.insert(works).values([
    {
      title: '제주도 풍경 스케치',
      description: '스마트폰으로 그린 제주도 바다 풍경',
      imageUrl: '/images/gallery-1.jpg',
      category: 'gallery',
    },
    {
      title: '서울 도심 야경',
      description: '남산에서 바라본 서울 도심의 야경',
      imageUrl: '/images/gallery-2.jpg',
      category: 'gallery',
    },
    {
      title: '조선일보 - 5060 창업 열풍',
      description: '조선일보에 실린 스마트폰 창업 교육 관련 기사',
      imageUrl: '/images/press-1.jpg',
      category: 'press',
    },
    {
      title: 'KBS 뉴스 - 시니어 유튜버 시대',
      description: 'KBS 저녁 뉴스에 소개된 시니어 유튜버 양성 프로그램',
      imageUrl: '/images/press-2.jpg',
      category: 'press',
    },
  ]);

  console.log('✅ Seeding completed successfully!');
  console.log('📊 Summary:');
  console.log('   - Admin Users: 2');
  console.log('   - Courses: 3');
  console.log('   - Posts: 5');
  console.log('   - Works: 4');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('🏁 Seed process finished');
    process.exit(0);
  });
