/**
 * D9 E2E seed: choi-pd 회원 + peer 3명 + MD 3개 파싱 → 갭 리포트 생성까지.
 * 실행: npx tsx scripts/seed-talent-e2e.ts
 */
import { db } from '../src/lib/db';
import { members, memberDocuments, memberSkills, skills, memberGapReports } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ingestDocument } from '../src/lib/skills/ingest';
import { generateGapReport } from '../src/lib/skills/gap-report';

const CHOI_BIO = `---
title: 최범희 PD 이력서
category: bio
tags: [방송, PD, 환경]
---

# 최범희 PD

방송 PD · 한국환경저널 발행인 · 1인 크리에이터

## 경력
- 2010~2015 방송사 PD — 콘텐츠 기획, 영상 편집, 촬영
- 2016~2020 독립 PD — 프리미엄 다큐 제작, 스토리텔링
- 2020~현재 한국환경저널 발행인 — 환경 저널리즘, 기획
- 15년 경력 PD + 환경 저널 발행인

## 역량
- 영상 편집 (프리미어 프로, DaVinci), 10년
- 콘텐츠 기획 및 연출
- 스토리텔링, 인터뷰
- 50~60대 대상 강의 운영
- 유튜브 채널 운영
- 네트워킹, 협상

## 주요 작품
- "환경저널 시즌 1" (2021)
- "스마트폰 창업" 강의 시리즈 (2022)
`;

const CHOI_PORTFOLIO = `---
title: 포트폴리오 2025
category: portfolio
---

# 최범희 PD 포트폴리오

## 대표 작품
1. 「환경저널 다큐 시리즈」 (2021) — 주식회사 한국환경저널
2. 「스마트폰으로 시작하는 제2의 인생」 강의 (2022) — 개인 프로젝트
3. 「50대 유튜브 크리에이터」 영상편집 코칭 (2023)

## 고객사
- 한국환경저널㈜ (자사)
- 서울시 50+재단
- (주)미래교육

## 매출 (2024)
- 강의: ₩24,000,000
- 영상 제작: ₩38,000,000
- 컨설팅: ₩12,000,000
`;

const CHOI_CURRICULUM = `---
title: 스마트폰 창업 커리큘럼
category: curriculum
---

# 스마트폰으로 시작하는 1인 창업

대상: 50~60대 시니어
기간: 8주 과정

## 커리큘럼
1. 스마트폰 촬영 기초
2. 영상 편집 입문
3. SNS 마케팅 기본
4. 유튜브 채널 개설
5. 콘텐츠 기획
6. 고객 상담 스킬
7. 세금계산서 발행 / 정산
8. 수익화 전략

## 강사 역량
- 영상 편집 전문가
- 콘텐츠 기획 10년
- SNS 운영, 유튜브 채널 운영
- 50대 교육 5년 경력
`;

const PEER_DOCS: Array<{ slug: string; name: string; profession: string; docs: Array<{ filename: string; content: string }> }> = [
  {
    slug: 'demo-pd-a',
    name: '김영진 PD',
    profession: 'creator',
    docs: [
      {
        filename: 'bio.md',
        content: `# 김영진 PD
방송 PD 8년. 영상 편집, 촬영, 콘텐츠 기획, SNS 마케팅, 예약 시스템 운영, 후기 관리, 세금계산서 발행.
8년 경력. 유튜브 채널 운영, 스토리텔링.`,
      },
    ],
  },
  {
    slug: 'demo-pd-b',
    name: '이수아 크리에이터',
    profession: 'creator',
    docs: [
      {
        filename: 'bio.md',
        content: `# 이수아 PD
10년 경력. 영상 편집, 콘텐츠 기획, SNS 마케팅, 유튜브 채널 운영, 인스타그램 운영, 예약 시스템 운영, 후기 관리, 데이터 분석, 스토리텔링.`,
      },
    ],
  },
  {
    slug: 'demo-pd-c',
    name: '박준호 PD',
    profession: 'creator',
    docs: [
      {
        filename: 'bio.md',
        content: `# 박준호 PD
5년 경력. 영상 편집, 촬영, SNS 마케팅, 예약 시스템 운영, 후기 관리, 커뮤니티 운영.`,
      },
    ],
  },
];

async function ensureMember(slug: string, name: string, email: string, profession: string) {
  const existing = await db.select().from(members).where(eq(members.slug, slug)).get();
  if (existing) return existing;

  const [row] = await db
    .insert(members)
    .values({
      tenantId: 1,
      slug,
      name,
      email,
      profession,
      status: 'approved',
      businessType: 'individual',
      subscriptionPlan: 'basic',
      enabledModules: '[]',
      themeConfig: '{}',
    })
    .returning();
  return row;
}

async function main() {
  console.log('[seed] ensuring members...');
  const choi = await ensureMember('choi-pd', '최범희 PD', 'choi@impd.me', 'creator');

  // 기존 seed 문서/달란트/리포트 초기화
  await db.delete(memberGapReports).where(eq(memberGapReports.memberId, choi.id));
  await db.delete(memberSkills).where(eq(memberSkills.memberId, choi.id));
  await db.delete(memberDocuments).where(eq(memberDocuments.memberId, choi.id));

  for (const [i, md] of [
    { filename: 'choi-bio.md', content: CHOI_BIO },
    { filename: 'choi-portfolio.md', content: CHOI_PORTFOLIO },
    { filename: 'choi-curriculum.md', content: CHOI_CURRICULUM },
  ].entries()) {
    const res = await ingestDocument(1, choi.id, md.filename, md.content, md.content.length);
    console.log(`[seed] choi doc #${i + 1} ${md.filename} → extracted=${res.extracted} (${res.source || 'existing'})`);
  }

  for (const peer of PEER_DOCS) {
    const row = await ensureMember(peer.slug, peer.name, `${peer.slug}@impd.me`, peer.profession);
    await db.delete(memberSkills).where(eq(memberSkills.memberId, row.id));
    await db.delete(memberDocuments).where(eq(memberDocuments.memberId, row.id));
    for (const d of peer.docs) {
      const res = await ingestDocument(1, row.id, d.filename, d.content, d.content.length);
      console.log(`[seed] ${peer.slug} doc ${d.filename} → extracted=${res.extracted}`);
    }
  }

  console.log('[seed] generating gap report for choi-pd...');
  const report = await generateGapReport(choi.id);
  console.log(
    `[seed] report generated: completeness=${report.completenessScore}%, peers=${report.peerSampleSize}, gaps=${JSON.parse(report.gapsJson).length}`
  );

  // 전수 검증
  const choiSkills = await db.select().from(memberSkills).where(eq(memberSkills.memberId, choi.id)).all();
  const choiDocs = await db.select().from(memberDocuments).where(eq(memberDocuments.memberId, choi.id)).all();
  const allSkills = await db.select().from(skills).all();

  console.log('\n━━━ E2E 검증 결과 ━━━');
  console.log(`  최범희 PD: 문서 ${choiDocs.length}개, 달란트 ${choiSkills.length}개`);
  console.log(`  전역 skills 카탈로그: ${allSkills.length}개`);
  console.log(`  완성도: ${report.completenessScore}%`);
  console.log(`  레이더(나): ${report.radarSelf}`);
  console.log(`  갭: ${report.gapsJson.slice(0, 200)}...`);

  if (choiDocs.length === 3 && choiSkills.length >= 7) {
    console.log('\n✅ PASS — MVP 완료 기준 충족');
  } else {
    console.log(`\n⚠️  NEEDS REVIEW — 달란트=${choiSkills.length} (7 필요), 문서=${choiDocs.length} (3 필요)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] FAILED:', err);
    process.exit(1);
  });
