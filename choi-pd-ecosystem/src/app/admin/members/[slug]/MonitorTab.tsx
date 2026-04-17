'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Eye,
  Users,
  MessageSquare,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface MonitorPayload {
  member: {
    id: number;
    slug: string;
    name: string;
    status: string | null;
    profession: string | null;
    createdAt: string | null;
  };
  activity: {
    pageViews7d: number;
    pageViews30d: number;
    pageViewsTotal: number;
    uniqueVisitors30d: number;
    lastActivityAt: string | null;
    daysSinceLastActivity: number;
    trend: Array<{ day: string; views: number }>;
  };
  content: {
    postsCount: number;
    portfolioCount: number;
    servicesCount: number;
    documentsCount: number;
    skillsCount: number;
    lastPostAt: string | null;
  };
  conversion: {
    inquiries7d: number;
    inquiries30d: number;
    inquiriesTotal: number;
    inquiriesUnread: number;
    recentInquiries: Array<{
      id: number;
      senderName: string;
      senderEmail: string;
      message: string;
      isRead: number | null;
      createdAt: string | null;
    }>;
    paymentsCompletedSum: number;
  };
  growth: {
    inquiriesThisMonth: number;
    inquiriesPrevMonth: number;
    inquiriesGrowthPct: number;
    completenessScore: number | null;
    lastReportAt: string | null;
  };
  signals: Array<{
    level: 'ok' | 'warn' | 'critical';
    label: string;
    detail: string;
  }>;
}

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ko-KR');
}

function formatRelative(d: string | null) {
  if (!d) return '기록 없음';
  const date = new Date(d);
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff < 1) return '오늘';
  if (diff < 7) return `${diff}일 전`;
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`;
  return `${Math.floor(diff / 30)}개월 전`;
}

function formatKRW(n: number) {
  if (n >= 1_000_000) return `₩${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₩${(n / 1_000).toFixed(1)}k`;
  return `₩${n.toLocaleString('ko-KR')}`;
}

const signalStyles: Record<string, { bg: string; border: string; text: string; Icon: typeof CheckCircle }> = {
  ok: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', Icon: CheckCircle },
  warn: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', Icon: AlertTriangle },
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', Icon: AlertTriangle },
};

export default function MonitorTab({ slug }: { slug: string }) {
  const [data, setData] = useState<MonitorPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/members/${slug}/monitor`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || '조회 실패');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
        활동 데이터 불러오는 중...
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6">
          <p className="text-sm text-red-700 mb-2">모니터링 데이터 조회 실패: {error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  const maxTrend = Math.max(1, ...data.activity.trend.map((t) => t.views));

  return (
    <div className="space-y-6">
      {/* 이탈 리스크 시그널 */}
      {data.signals.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                건강도 시그널
              </CardTitle>
              <CardDescription>이 회원의 이탈 리스크·운영 상태 자동 분석</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              새로고침
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {data.signals.map((s, i) => {
                const style = signalStyles[s.level];
                const Icon = style.Icon;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${style.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${style.text}`}>{s.label}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{s.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI 4개 */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          icon={Eye}
          label="30일 페이지 조회"
          value={data.activity.pageViews30d.toLocaleString()}
          sub={`7일: ${data.activity.pageViews7d.toLocaleString()} · 누적 ${data.activity.pageViewsTotal.toLocaleString()}`}
          accent="text-blue-600"
        />
        <KpiCard
          icon={Users}
          label="30일 고유 방문자"
          value={data.activity.uniqueVisitors30d.toLocaleString()}
          sub={`마지막 방문: ${formatRelative(data.activity.lastActivityAt)}`}
          accent="text-cyan-600"
        />
        <KpiCard
          icon={MessageSquare}
          label="30일 문의"
          value={data.conversion.inquiries30d.toLocaleString()}
          sub={`미처리 ${data.conversion.inquiriesUnread} / 누적 ${data.conversion.inquiriesTotal}`}
          accent="text-purple-600"
          trend={data.growth.inquiriesGrowthPct}
        />
        <KpiCard
          icon={CreditCard}
          label="완성도"
          value={data.growth.completenessScore != null ? `${data.growth.completenessScore}%` : '—'}
          sub={data.growth.lastReportAt ? `마지막: ${formatDate(data.growth.lastReportAt)}` : '리포트 없음'}
          accent="text-emerald-600"
        />
      </div>

      {/* 방문 추이 — bar chart */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            14일 방문 추이
          </CardTitle>
          <CardDescription>
            공개 페이지 <code className="bg-gray-100 px-1 rounded text-[11px]">/member/{data.member.slug}</code> 조회
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {data.activity.trend.map((t) => (
              <div
                key={t.day}
                className="flex-1 flex flex-col items-center justify-end group relative"
                title={`${t.day}: ${t.views}회`}
              >
                <div
                  className="w-full rounded-t bg-gradient-to-t from-blue-500 to-cyan-400 min-h-[2px]"
                  style={{ height: `${(t.views / maxTrend) * 100}%` }}
                />
                <div className="absolute -top-5 hidden group-hover:block text-[10px] font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded shadow">
                  {t.views}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-2">
            <span>{data.activity.trend[0]?.day.slice(5)}</span>
            <span>오늘</span>
          </div>
        </CardContent>
      </Card>

      {/* 콘텐츠 운영 + 최근 문의 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              콘텐츠 운영
            </CardTitle>
            <CardDescription>
              {data.content.lastPostAt
                ? `마지막 포스트: ${formatRelative(data.content.lastPostAt)}`
                : '아직 포스트가 없습니다'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: '포스트', v: data.content.postsCount },
                { label: '포트폴리오', v: data.content.portfolioCount },
                { label: '서비스', v: data.content.servicesCount },
                { label: '문서', v: data.content.documentsCount },
                { label: '달란트', v: data.content.skillsCount },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-gray-50 py-3">
                  <div className="text-lg font-black text-gray-900">{item.v}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              최근 문의 ({data.conversion.inquiriesTotal})
            </CardTitle>
            <CardDescription>
              미처리 {data.conversion.inquiriesUnread}건 · 7일 신규 {data.conversion.inquiries7d}건
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.conversion.recentInquiries.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">아직 문의가 없습니다</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.conversion.recentInquiries.map((q) => (
                  <li key={q.id} className="py-2 flex items-start gap-2">
                    {!q.isRead ? (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    ) : (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{q.senderName}</span>
                        <span className="text-[10px] text-gray-400">{formatRelative(q.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-600 truncate">{q.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" size="sm" className="w-full mt-3">
              <Link href={`/admin/inquiries?member=${data.member.slug}`}>
                전체 문의 보기
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 성장 + 결제 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              성장 (문의 MoM)
            </CardTitle>
            <CardDescription>전월 대비 문의 증가율</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-black text-gray-900">
                  {data.growth.inquiriesThisMonth}
                </div>
                <div className="text-xs text-gray-500 mt-1">이번 달 (30일)</div>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-black ${
                    data.growth.inquiriesGrowthPct >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {data.growth.inquiriesGrowthPct >= 0 ? '↗' : '↘'} {Math.abs(data.growth.inquiriesGrowthPct)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  전월: {data.growth.inquiriesPrevMonth}건
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-600" />
              결제·매출
            </CardTitle>
            <CardDescription>플랫폼 결제 누적(같은 tenant 전체)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-900">
              {formatKRW(data.conversion.paymentsCompletedSum)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              회원별 결제 분리는 후속 작업(결제 → member 매핑 필요)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  sub: string;
  accent: string;
  trend?: number;
}) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${accent}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black text-gray-900">{value}</div>
          {typeof trend === 'number' && trend !== 0 && (
            <span
              className={`text-xs font-bold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 mt-1 leading-tight">{sub}</p>
      </CardContent>
    </Card>
  );
}
