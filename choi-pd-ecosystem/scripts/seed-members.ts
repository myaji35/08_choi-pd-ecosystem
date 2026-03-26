import { db } from '../src/lib/db';
import { members } from '../src/lib/db/schema';

async function seedMembers() {
  console.log('👥 회원 데모 데이터 삽입...');

  // 기존 회원 삭제
  await db.delete(members);

  await db.insert(members).values([
    {
      slug: 'kim-insurance',
      name: '김보험',
      email: 'kim@demo.com',
      phone: '010-1234-5678',
      bio: '20년 경력의 종합보험 전문 설계사. 고객 맞춤 보장 분석으로 1,200건 이상의 상담을 완료했습니다.',
      profession: 'insurance_agent',
      businessType: 'individual',
      region: '서울 강남',
      status: 'approved',
      subscriptionPlan: 'premium',
      enabledModules: JSON.stringify(['services', 'reviews', 'contact', 'blog']),
      socialLinks: JSON.stringify({
        blog: 'https://blog.naver.com/demo',
        instagram: 'https://instagram.com/demo',
      }),
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
    },
    {
      slug: 'park-realtor',
      name: '박부동산',
      email: 'park@demo.com',
      phone: '010-2345-6789',
      bio: '마포/서대문 지역 전문 공인중개사. 정직한 거래, 꼼꼼한 분석으로 200건 이상의 성공적인 거래를 완료했습니다.',
      profession: 'realtor',
      businessType: 'individual',
      region: '서울 마포',
      status: 'approved',
      subscriptionPlan: 'premium',
      enabledModules: JSON.stringify(['portfolio', 'services', 'reviews', 'contact']),
      socialLinks: JSON.stringify({
        blog: 'https://blog.naver.com/demo2',
      }),
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop',
    },
    {
      slug: 'lee-teacher',
      name: '이선생',
      email: 'lee@demo.com',
      phone: '010-3456-7890',
      bio: '디지털 마케팅 전문 강사. 유튜브, 인스타그램 마케팅 교육 10년차. 수강생 5,000명 돌파.',
      profession: 'educator',
      businessType: 'individual',
      region: '서울 종로',
      status: 'approved',
      subscriptionPlan: 'enterprise',
      enabledModules: JSON.stringify(['services', 'reviews', 'blog', 'booking']),
      socialLinks: JSON.stringify({
        youtube: 'https://youtube.com/@demo',
        instagram: 'https://instagram.com/demo3',
      }),
      profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop',
    },
    {
      slug: 'choi-author',
      name: '최작가',
      email: 'choi@demo.com',
      phone: '010-4567-8901',
      bio: '베스트셀러 작가 겸 칼럼니스트. 환경, 교육 분야 저서 5권 출간. MBC, KBS 등 방송 출연.',
      profession: 'author',
      businessType: 'individual',
      region: '서울 서초',
      status: 'approved',
      subscriptionPlan: 'premium',
      enabledModules: JSON.stringify(['portfolio', 'blog', 'reviews', 'contact']),
      socialLinks: JSON.stringify({
        blog: 'https://blog.naver.com/demo4',
        youtube: 'https://youtube.com/@demo4',
      }),
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop',
    },
    {
      slug: 'jung-bakery',
      name: '정빵집',
      email: 'jung@demo.com',
      phone: '010-5678-9012',
      bio: '수제 빵과 케이크 전문점. 천연 효모와 국산 밀가루로 정성을 담아 매일 아침 구워냅니다.',
      profession: 'shopowner',
      businessType: 'company',
      region: '부산 해운대',
      status: 'approved',
      subscriptionPlan: 'basic',
      enabledModules: JSON.stringify(['services', 'portfolio', 'reviews', 'contact']),
      socialLinks: JSON.stringify({
        instagram: 'https://instagram.com/demo5',
      }),
      profileImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop',
    },
    {
      slug: 'han-designer',
      name: '한디자이너',
      email: 'han@demo.com',
      phone: '010-6789-0123',
      bio: 'UX/UI 디자인 전문 프리랜서. 스타트업부터 대기업까지 50개 이상의 프로젝트를 성공적으로 완수.',
      profession: 'freelancer',
      businessType: 'individual',
      region: '서울 성수',
      status: 'approved',
      subscriptionPlan: 'premium',
      enabledModules: JSON.stringify(['portfolio', 'services', 'reviews', 'contact']),
      socialLinks: JSON.stringify({
        website: 'https://handesigner.com',
        linkedin: 'https://linkedin.com/in/demo',
      }),
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=400&fit=crop',
    },
  ]);

  console.log('');
  console.log('✅ 회원 데모 데이터 삽입 완료!');
  console.log('📊 삽입된 회원:');
  console.log('   🏦 kim-insurance — 보험설계사');
  console.log('   🏠 park-realtor — 부동산중개사');
  console.log('   🎓 lee-teacher — 교육자/강사');
  console.log('   📚 choi-author — 저자/크리에이터');
  console.log('   🍞 jung-bakery — 소상공인/매장');
  console.log('   🎨 han-designer — 프리랜서/전문가');
  console.log('');
  console.log('🌐 확인 URL:');
  console.log('   http://localhost:3008/member/kim-insurance');
  console.log('   http://localhost:3008/member/park-realtor');
  console.log('   http://localhost:3008/member/lee-teacher');
  console.log('   http://localhost:3008/member/choi-author');
  console.log('   http://localhost:3008/member/jung-bakery');
  console.log('   http://localhost:3008/member/han-designer');
}

seedMembers()
  .catch((error) => {
    console.error('❌ 실패:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
