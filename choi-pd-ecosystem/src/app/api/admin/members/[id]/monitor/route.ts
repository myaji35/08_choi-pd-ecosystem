import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  members,
  memberInquiries,
  memberPosts,
  memberPortfolioItems,
  memberServices,
  memberDocuments,
  memberSkills,
  memberGapReports,
  analyticsEvents,
  payments,
} from '@/lib/db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function resolveMember(idOrSlug: string) {
  const asInt = parseInt(idOrSlug);
  if (!isNaN(asInt) && String(asInt) === idOrSlug) {
    return db.select().from(members).where(eq(members.id, asInt)).get();
  }
  return db.select().from(members).where(eq(members.slug, idOrSlug)).get();
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400000);
}

function since(row: { createdAt?: Date | null }) {
  return row.createdAt ? new Date(row.createdAt) : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await resolveMember(id);
    if (!member) {
      return NextResponse.json({ success: false, error: 'member not found' }, { status: 404 });
    }

    const slug = member.slug;
    const memberId = member.id;
    const now = new Date();
    const d7 = daysAgo(7);
    const d30 = daysAgo(30);
    const d60 = daysAgo(60);

    // === 1. 활동성 (analytics_events 기반) — member 페이지 방문 ===
    const pathLike = sql`${analyticsEvents.pagePath} LIKE ${'/member/' + slug + '%'}`;

    const [pv7d, pv30d, pvTotal, uniqVisitors30d, lastEvent] = await Promise.all([
      db.select({ c: sql<number>`count(*)` }).from(analyticsEvents)
        .where(and(pathLike, gte(analyticsEvents.createdAt, d7))).get(),
      db.select({ c: sql<number>`count(*)` }).from(analyticsEvents)
        .where(and(pathLike, gte(analyticsEvents.createdAt, d30))).get(),
      db.select({ c: sql<number>`count(*)` }).from(analyticsEvents)
        .where(pathLike).get(),
      db.select({ c: sql<number>`count(DISTINCT ${analyticsEvents.sessionId})` })
        .from(analyticsEvents)
        .where(and(pathLike, gte(analyticsEvents.createdAt, d30))).get(),
      db.select().from(analyticsEvents)
        .where(pathLike)
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(1).get(),
    ]);

    // 일별 방문 추이 (14일)
    const trend = await db
      .select({
        day: sql<string>`strftime('%Y-%m-%d', ${analyticsEvents.createdAt}, 'unixepoch')`,
        c: sql<number>`count(*)`,
      })
      .from(analyticsEvents)
      .where(and(pathLike, gte(analyticsEvents.createdAt, daysAgo(14))))
      .groupBy(sql`strftime('%Y-%m-%d', ${analyticsEvents.createdAt}, 'unixepoch')`)
      .all();

    // === 2. 콘텐츠 운영 ===
    const [postsCnt, portfolioCnt, servicesCnt, docsCnt, skillsCnt, lastPost] = await Promise.all([
      db.select({ c: sql<number>`count(*)` }).from(memberPosts).where(eq(memberPosts.memberId, memberId)).get(),
      db.select({ c: sql<number>`count(*)` }).from(memberPortfolioItems).where(eq(memberPortfolioItems.memberId, memberId)).get(),
      db.select({ c: sql<number>`count(*)` }).from(memberServices).where(eq(memberServices.memberId, memberId)).get(),
      db.select({ c: sql<number>`count(*)` }).from(memberDocuments).where(eq(memberDocuments.memberId, memberId)).get(),
      db.select({ c: sql<number>`count(*)` }).from(memberSkills).where(eq(memberSkills.memberId, memberId)).get(),
      db.select().from(memberPosts).where(eq(memberPosts.memberId, memberId))
        .orderBy(desc(memberPosts.createdAt)).limit(1).get(),
    ]);

    // === 3. 고객 전환 ===
    const [inq7d, inq30d, inqTotal, inqUnread, recentInquiries] = await Promise.all([
      db.select({ c: sql<number>`count(*)` }).from(memberInquiries)
        .where(and(eq(memberInquiries.memberId, memberId), gte(memberInquiries.createdAt, d7))).get(),
      db.select({ c: sql<number>`count(*)` }).from(memberInquiries)
        .where(and(eq(memberInquiries.memberId, memberId), gte(memberInquiries.createdAt, d30))).get(),
      db.select({ c: sql<number>`count(*)` }).from(memberInquiries)
        .where(eq(memberInquiries.memberId, memberId)).get(),
      db.select({ c: sql<number>`count(*)` }).from(memberInquiries)
        .where(and(eq(memberInquiries.memberId, memberId), eq(memberInquiries.isRead, 0))).get(),
      db.select().from(memberInquiries)
        .where(eq(memberInquiries.memberId, memberId))
        .orderBy(desc(memberInquiries.createdAt))
        .limit(5).all(),
    ]);

    // === 4. 성장 (MoM) ===
    const growth = {
      inquiriesThisMonth: Number(inq30d?.c || 0),
      inquiriesPrevMonth: Number(
        (
          await db
            .select({ c: sql<number>`count(*)` })
            .from(memberInquiries)
            .where(
              and(
                eq(memberInquiries.memberId, memberId),
                gte(memberInquiries.createdAt, d60),
                sql`${memberInquiries.createdAt} < ${Math.floor(d30.getTime() / 1000)}`
              )
            )
            .get()
        )?.c || 0
      ),
    };
    const inquiriesGrowth = growth.inquiriesPrevMonth
      ? Math.round(((growth.inquiriesThisMonth - growth.inquiriesPrevMonth) / growth.inquiriesPrevMonth) * 100)
      : growth.inquiriesThisMonth > 0 ? 100 : 0;

    const latestReport = await db
      .select()
      .from(memberGapReports)
      .where(eq(memberGapReports.memberId, memberId))
      .orderBy(desc(memberGapReports.generatedAt))
      .limit(1)
      .get();

    // === 5. 건강도·이탈 리스크 시그널 ===
    const signals: Array<{ level: 'ok' | 'warn' | 'critical'; label: string; detail: string }> = [];

    const lastEventAt = lastEvent?.createdAt ? new Date(lastEvent.createdAt) : null;
    const daysSinceLastActivity = lastEventAt
      ? Math.floor((now.getTime() - lastEventAt.getTime()) / 86400000)
      : 999;

    if (daysSinceLastActivity > 30) {
      signals.push({
        level: 'critical',
        label: '30일 이상 페이지 비활동',
        detail: `마지막 방문: ${lastEventAt ? lastEventAt.toLocaleDateString('ko-KR') : '기록 없음'}`,
      });
    } else if (daysSinceLastActivity > 7) {
      signals.push({
        level: 'warn',
        label: '7일 이상 비활동',
        detail: `마지막 방문: ${lastEventAt ? lastEventAt.toLocaleDateString('ko-KR') : '기록 없음'}`,
      });
    } else if (lastEventAt) {
      signals.push({
        level: 'ok',
        label: '최근 활동 있음',
        detail: `${daysSinceLastActivity}일 전 방문`,
      });
    }

    const unread = Number(inqUnread?.c || 0);
    const total = Number(inqTotal?.c || 0);
    if (total > 0) {
      const unreadRatio = unread / total;
      if (unreadRatio >= 0.5) {
        signals.push({
          level: 'critical',
          label: '문의 방치율 높음',
          detail: `미처리 ${unread} / 전체 ${total} (${Math.round(unreadRatio * 100)}%)`,
        });
      } else if (unreadRatio >= 0.3) {
        signals.push({
          level: 'warn',
          label: '미처리 문의 다수',
          detail: `${unread}건 / ${total}건`,
        });
      }
    }

    if (!Number(postsCnt?.c || 0) && !Number(portfolioCnt?.c || 0)) {
      signals.push({
        level: 'warn',
        label: '공개 콘텐츠 없음',
        detail: '포스트·포트폴리오 0건 — 페이지가 비어있음',
      });
    }

    if (latestReport && (latestReport.completenessScore || 0) < 40) {
      signals.push({
        level: 'warn',
        label: '프로필 완성도 낮음',
        detail: `완성도 ${latestReport.completenessScore}% — 달란트/문서 부족`,
      });
    }

    // === 6. 결제 집계 ===
    const paymentsTotal = await db
      .select({ sum: sql<number>`COALESCE(SUM(${payments.amount}),0)` })
      .from(payments)
      .where(and(eq(payments.status, 'completed')))
      .get();

    // 일별 trend 채우기 (0 포함 14일)
    const trendMap = new Map(trend.map((t) => [t.day, Number(t.c)]));
    const fullTrend: Array<{ day: string; views: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      fullTrend.push({ day: key, views: trendMap.get(key) || 0 });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: memberId,
        slug,
        name: member.name,
        status: member.status,
        profession: member.profession,
        createdAt: member.createdAt,
      },
      activity: {
        pageViews7d: Number(pv7d?.c || 0),
        pageViews30d: Number(pv30d?.c || 0),
        pageViewsTotal: Number(pvTotal?.c || 0),
        uniqueVisitors30d: Number(uniqVisitors30d?.c || 0),
        lastActivityAt: lastEventAt,
        daysSinceLastActivity,
        trend: fullTrend,
      },
      content: {
        postsCount: Number(postsCnt?.c || 0),
        portfolioCount: Number(portfolioCnt?.c || 0),
        servicesCount: Number(servicesCnt?.c || 0),
        documentsCount: Number(docsCnt?.c || 0),
        skillsCount: Number(skillsCnt?.c || 0),
        lastPostAt: lastPost ? since(lastPost) : null,
      },
      conversion: {
        inquiries7d: Number(inq7d?.c || 0),
        inquiries30d: Number(inq30d?.c || 0),
        inquiriesTotal: total,
        inquiriesUnread: unread,
        recentInquiries,
        paymentsCompletedSum: Number(paymentsTotal?.sum || 0),
      },
      growth: {
        ...growth,
        inquiriesGrowthPct: inquiriesGrowth,
        completenessScore: latestReport?.completenessScore ?? null,
        lastReportAt: latestReport?.generatedAt ?? null,
      },
      signals,
    });
  } catch (error) {
    console.error('[monitor] failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'monitor failed' },
      { status: 500 }
    );
  }
}
