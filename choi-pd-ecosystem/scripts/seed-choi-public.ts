/**
 * choi-pd 공개 페이지 시드:
 * awards 2개 + public_trust 1개 + channels 3개 + activity timeline 8건
 * + profile_media(hero cover) + followers 2,438명 샘플
 */
import { db } from '../src/lib/db';
import {
  members,
  memberAwards,
  memberChannels,
  memberActivityTimeline,
  memberProfileMedia,
  memberFollowers,
} from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400000);
}

async function main() {
  const member = await db.select().from(members).where(eq(members.slug, 'choi-pd')).get();
  if (!member) throw new Error('choi-pd not found. seed-talent-e2e 먼저 실행.');
  const memberId = member.id;
  const tenantId = member.tenantId || 1;

  // 초기화
  console.log('[seed-public] 기존 데이터 초기화...');
  await db.delete(memberAwards).where(eq(memberAwards.memberId, memberId));
  await db.delete(memberChannels).where(eq(memberChannels.memberId, memberId));
  await db.delete(memberActivityTimeline).where(eq(memberActivityTimeline.memberId, memberId));
  await db.delete(memberProfileMedia).where(eq(memberProfileMedia.memberId, memberId));
  await db.delete(memberFollowers).where(eq(memberFollowers.memberId, memberId));

  // 수상/인증
  console.log('[seed-public] 수상·인증 4건...');
  await db.insert(memberAwards).values([
    {
      tenantId,
      memberId,
      title: '제17회 서울특별시 청소년지도자 대상 사회봉사상',
      organization: '서울특별시',
      awardedYear: 2025,
      category: 'award',
      accentColor: '#D32F2F',
      displayOrder: 0,
      description: '15년간 지속된 청소년 미디어 교육 공로',
    },
    {
      tenantId,
      memberId,
      title: '제4회 PRESS AWARDS 유튜버상',
      organization: 'PRESS AWARDS 선정위원회',
      awardedYear: 2022,
      category: 'award',
      accentColor: '#D32F2F',
      displayOrder: 1,
    },
    {
      tenantId,
      memberId,
      title: '공공기관 정식 출강',
      organization: '경찰·공무원 대상 디지털 리터러시',
      awardedYear: 2024,
      category: 'public_trust',
      accentColor: '#1A237E',
      displayOrder: 2,
      description: '2024년 상반기 정기 출강 편성',
    },
    {
      tenantId,
      memberId,
      title: 'imPD 공식 검증 회원',
      organization: 'imPD Platform',
      awardedYear: 2026,
      category: 'certification',
      accentColor: '#00A1E0',
      displayOrder: 3,
      description: '달란트 검증 + 활동 14일 지속 + 포트폴리오 3건 이상',
    },
  ]);

  // 운영 채널
  console.log('[seed-public] 채널 3개...');
  await db.insert(memberChannels).values([
    {
      tenantId,
      memberId,
      platform: 'youtube',
      displayName: '유튜브 (희스토리)',
      url: 'https://youtube.com/@choipd',
      handle: '@choipd',
      followerCount: 8200,
      activityScore: 68,
      isActive: true,
      displayOrder: 0,
    },
    {
      tenantId,
      memberId,
      platform: 'naver_cafe',
      displayName: '네이버 카페',
      url: 'https://cafe.naver.com/choipd',
      handle: 'choipd',
      followerCount: 1300,
      activityScore: 60,
      isActive: true,
      displayOrder: 1,
    },
    {
      tenantId,
      memberId,
      platform: 'facebook',
      displayName: '페이스북 페이지',
      url: 'https://facebook.com/choipd',
      handle: 'choipd',
      followerCount: 850,
      activityScore: 55,
      isActive: true,
      displayOrder: 2,
    },
  ]);

  // 타임라인 8건
  console.log('[seed-public] 타임라인 8건...');
  await db.insert(memberActivityTimeline).values([
    { tenantId, memberId, kind: 'post', title: '50대, 유튜버 되는 법 — 3단계 로드맵', summary: '장비 없이 스마트폰 하나로 시작하는 현실 가이드.', occurredAt: daysAgo(3), isPinned: true },
    { tenantId, memberId, kind: 'live', title: '라이브 · 카카오채널 운영 기초', summary: '지난 주 700명 동시 시청.', occurredAt: daysAgo(7) },
    { tenantId, memberId, kind: 'award', title: '🏅 서울특별시 청소년지도자 대상 사회봉사상', summary: '제17회 · 2025', occurredAt: daysAgo(14) },
    { tenantId, memberId, kind: 'campaign', title: '스마트폰으로 내 가게 홍보하세요 · 캠페인 오픈', summary: '소상공인·자영업자 대상 실전 커리큘럼', occurredAt: daysAgo(21) },
    { tenantId, memberId, kind: 'video', title: '30초 자기소개 · 최PD', summary: '히어로 소개 영상', occurredAt: daysAgo(25) },
    { tenantId, memberId, kind: 'press', title: '한국환경저널 시즌 2 첫 방송', summary: '전국 26개 협력 기관 인터뷰', occurredAt: daysAgo(35) },
    { tenantId, memberId, kind: 'milestone', title: '유튜브 구독자 8,000명 돌파', summary: '채널 개설 14개월만에', occurredAt: daysAgo(45) },
    { tenantId, memberId, kind: 'community', title: '네이버카페 1,000명 돌파 · 월례 모임 신설', summary: '매월 마지막 토요일 오프라인 만남', occurredAt: daysAgo(60) },
  ]);

  // 히어로 커버 (choi-brand.json과 자연 연계)
  console.log('[seed-public] 프로필 미디어...');
  await db.insert(memberProfileMedia).values([
    {
      tenantId,
      memberId,
      role: 'hero_cover',
      mediaUrl: '/images/hero-cover.jpg',
      mediaType: 'image',
      caption: '최PD의 현장 활동',
      displayOrder: 0,
    },
    {
      tenantId,
      memberId,
      role: 'hero_collage',
      mediaUrl: '/images/collage/lecture.jpg',
      mediaType: 'image',
      caption: '공공기관 강의 장면',
      displayOrder: 0,
    },
    {
      tenantId,
      memberId,
      role: 'hero_collage',
      mediaUrl: '/images/collage/youtube.jpg',
      mediaType: 'image',
      caption: '유튜브 촬영 현장',
      displayOrder: 1,
    },
    {
      tenantId,
      memberId,
      role: 'hero_collage',
      mediaUrl: '/images/collage/award.jpg',
      mediaType: 'image',
      caption: '서울시 대상 수상',
      displayOrder: 2,
    },
  ]);

  // 팔로워 2,438명 — active 2,412 + unsubscribed 26
  console.log('[seed-public] 팔로워 2,438명 생성...');
  const total = 2438;
  const rows: Array<typeof memberFollowers.$inferInsert> = [];
  for (let i = 0; i < total; i++) {
    const unsubscribed = i < 26;
    rows.push({
      tenantId,
      memberId,
      followerEmail: `follower_${i}@sample.impd.me`,
      followerName: `팔로워 ${i + 1}`,
      subscribeNewsletter: true,
      subscribeLiveAlert: i % 3 !== 0,
      status: unsubscribed ? 'unsubscribed' : 'active',
      createdAt: daysAgo(Math.floor(Math.random() * 180)),
    });
  }
  // 배치 삽입 (500건씩)
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(memberFollowers).values(rows.slice(i, i + 500));
  }

  console.log('\n✅ choi-pd 공개 페이지 시드 완료');
  console.log(`   · 수상/인증: 4건`);
  console.log(`   · 채널: 3개`);
  console.log(`   · 타임라인: 8건`);
  console.log(`   · 프로필 미디어: 4장`);
  console.log(`   · 팔로워: active ${total - 26}명 / unsubscribed 26명`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed-public] FAILED:', err);
    process.exit(1);
  });
