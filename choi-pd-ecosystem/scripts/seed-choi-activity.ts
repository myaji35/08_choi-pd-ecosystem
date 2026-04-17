/**
 * choi-pd "분양 사례" 활동 시뮬레이션 시드.
 * - 14일간 페이지 조회 이벤트 (요일별 랜덤)
 * - 문의 7건 (3건 미처리)
 * - 포스트 2개, 포트폴리오 3개
 *
 * 실행: DATABASE_URL="file:./data/database.db" npx tsx scripts/seed-choi-activity.ts
 */
import { db } from '../src/lib/db';
import {
  members,
  analyticsEvents,
  memberInquiries,
  memberPosts,
  memberPortfolioItems,
} from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const SAMPLE_INQUIRIES = [
  { name: '이현수', email: 'hyunsoo@example.com', message: '50대 창업 강의 B2B 제안 드립니다. 교육청 연계 가능합니다.', unread: true },
  { name: '박지원', email: 'park@startup.co', message: '영상 편집 외주 문의드려요. 월 4~5건 꾸준히 있을 예정입니다.', unread: true },
  { name: '최민서', email: 'minseo@gmail.com', message: '유튜브 컨설팅 일정 문의드립니다.', unread: false },
  { name: '강수연', email: 'kang@church.org', message: '시니어 대상 스마트폰 강의 일정 조율 가능할까요?', unread: false },
  { name: '윤서진', email: 'yoon@edu.kr', message: '교육 커리큘럼 저작권 라이센싱 관련 문의입니다.', unread: false },
  { name: '정해윤', email: 'jung@corp.com', message: '임직원 디지털 리터러시 교육 프로그램 제안받고 싶습니다.', unread: true },
  { name: '한도윤', email: 'han@example.com', message: '개인 코칭 가능하신가요? 시간 조율 부탁드립니다.', unread: false },
];

const SAMPLE_POSTS = [
  { title: '50대, 스마트폰으로 시작하는 1인 창업의 3가지 원칙', content: '오늘은 50대 분들이 스마트폰 하나로 시작할 수 있는 창업 아이템 3가지를 공유합니다...' },
  { title: '한국환경저널 시즌 2 제작 비하인드', content: '시즌 2 촬영을 마쳤습니다. 이번 시즌의 핵심 키워드는 "지속가능성"입니다...' },
];

const SAMPLE_PORTFOLIO = [
  { title: '환경저널 다큐 시리즈', description: '2021~2023 제작', imageUrl: '/images/portfolio/eco-1.jpg' },
  { title: '시니어 창업 강의 영상', description: '2022 50+재단 협력', imageUrl: '/images/portfolio/senior.jpg' },
  { title: '모바일 스케치 전시', description: '2024 서울시립미술관', imageUrl: '/images/portfolio/sketch.jpg' },
];

function daysAgo(n: number, hoursOffset = 0): Date {
  const d = new Date(Date.now() - n * 86400000);
  d.setHours(9 + hoursOffset, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

async function main() {
  const member = await db.select().from(members).where(eq(members.slug, 'choi-pd')).get();
  if (!member) throw new Error('choi-pd member not found (seed-talent-e2e 먼저 실행)');
  const memberId = member.id;
  const tenantId = member.tenantId || 1;

  console.log('[seed-activity] 기존 활동 데이터 삭제...');
  await db.delete(memberInquiries).where(eq(memberInquiries.memberId, memberId));
  await db.delete(memberPosts).where(eq(memberPosts.memberId, memberId));
  await db.delete(memberPortfolioItems).where(eq(memberPortfolioItems.memberId, memberId));

  // 14일간 방문 이벤트 (일별 3~25회 랜덤)
  console.log('[seed-activity] 방문 이벤트 생성...');
  const events: Array<typeof analyticsEvents.$inferInsert> = [];
  for (let d = 13; d >= 0; d--) {
    const weekday = new Date(Date.now() - d * 86400000).getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const base = isWeekend ? 5 : 15;
    const count = base + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const sessionId = `sess-${d}-${Math.floor(i / 2)}`;
      events.push({
        tenantId,
        sessionId,
        userType: 'visitor',
        eventName: 'page_view',
        eventCategory: 'navigation',
        eventAction: 'view',
        pagePath: `/member/${member.slug}`,
        pageTitle: `${member.name} - imPD`,
        referrer: i % 3 === 0 ? 'https://www.instagram.com/' : i % 3 === 1 ? 'https://www.google.com/' : null,
        createdAt: daysAgo(d, i % 8),
      });
    }
  }
  await db.insert(analyticsEvents).values(events);
  console.log(`[seed-activity] 방문 이벤트 ${events.length}건 삽입`);

  // 문의 7건 (최근 30일 분포)
  console.log('[seed-activity] 문의 생성...');
  const inquiryRows: Array<typeof memberInquiries.$inferInsert> = SAMPLE_INQUIRIES.map((q, i) => ({
    tenantId,
    memberId,
    senderName: q.name,
    senderEmail: q.email,
    message: q.message,
    isRead: q.unread ? 0 : 1,
    createdAt: daysAgo(Math.floor(Math.random() * 28) + 1, i),
  }));
  await db.insert(memberInquiries).values(inquiryRows);

  // 포스트 2개
  console.log('[seed-activity] 포스트 생성...');
  for (const [i, p] of SAMPLE_POSTS.entries()) {
    await db.insert(memberPosts).values({
      tenantId,
      memberId,
      title: p.title,
      content: p.content,
      createdAt: daysAgo((i + 1) * 7),
    });
  }

  // 포트폴리오 3개
  console.log('[seed-activity] 포트폴리오 생성...');
  for (const [i, p] of SAMPLE_PORTFOLIO.entries()) {
    await db.insert(memberPortfolioItems).values({
      tenantId,
      memberId,
      title: p.title,
      description: p.description,
      mediaUrl: p.imageUrl,
      mediaType: 'image',
      sortOrder: i,
    });
  }

  console.log('\n✅ choi-pd 분양 사례 활동 데이터 시딩 완료');
  console.log(`   · 방문 이벤트: ${events.length}건`);
  console.log(`   · 문의: ${inquiryRows.length}건 (미처리 ${inquiryRows.filter((r) => r.isRead === 0).length})`);
  console.log(`   · 포스트: ${SAMPLE_POSTS.length}개`);
  console.log(`   · 포트폴리오: ${SAMPLE_PORTFOLIO.length}개`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed-activity] FAILED:', err);
    process.exit(1);
  });
