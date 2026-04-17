'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import {
  LogOut,
  Users,
  TrendingUp,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  CreditCard,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Inbox,
} from 'lucide-react';

interface DistributorStats {
  totalDistributors: number;
  activeDistributors: number;
  pendingDistributors: number;
  totalRevenue: number;
  recentActivities: number;
}

function KpiSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-20 animate-pulse bg-gray-200 rounded" />
        <div className="h-4 w-4 animate-pulse bg-gray-200 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-16 animate-pulse bg-gray-200 rounded mb-2" />
        <div className="h-3 w-32 animate-pulse bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );
}

export default function AdminDistributorDashboard() {
  const router = useRouter();
  const { user, logout } = useSession();
  const [stats, setStats] = useState<DistributorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || '통계 조회 실패');
      }
      const { distributorStats, totalRevenue, activityStats } = data.analytics;
      setStats({
        totalDistributors: distributorStats.total,
        activeDistributors: distributorStats.active,
        pendingDistributors: distributorStats.pending,
        totalRevenue: totalRevenue,
        recentActivities: activityStats.total,
      });
    } catch (err) {
      setError('통계 데이터를 불러오는 데 실패했습니다.');
      console.error('Dashboard stats fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const isEmpty = stats && stats.totalDistributors === 0 && stats.totalRevenue === 0;

  return (
    <div className="px-6 py-6 xl:px-10 2xl:px-16 w-full">
      {/* 페이지 헤더 — 그라디언트 배너 */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16325C] via-[#1E3A8A] to-[#00A1E0] p-6 md:p-8 shadow-lg">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/20">
                ADMIN
              </span>
              <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight" style={{ color: '#ffffff' }}>
              분양 관리 대시보드
            </h1>
            {user && (
              <p className="text-sm text-white/75 mt-1">
                안녕하세요, <strong className="text-white">{user.name || user.email}</strong>님. 오늘도 수고 많으십니다.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/pd/dashboard')}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              style={{ color: '#ffffff' }}
            >
              PD 대시보드
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              style={{ color: '#ffffff' }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 에러 상태 */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} className="border-red-300 text-red-700 hover:bg-red-100">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            다시 시도
          </Button>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div>
        {/* 통계 카드 — 로딩 스켈레톤 */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
        )}

        {/* 통계 카드 — empty state (KPI 4칸 placeholder + 배너) */}
        {!isLoading && !error && isEmpty && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {[
                { label: '전체 수요자', Icon: Users, accent: 'text-blue-500' },
                { label: '활성 수요자', Icon: CheckCircle, accent: 'text-green-500' },
                { label: '대기 중', Icon: Clock, accent: 'text-orange-500' },
                { label: '총 매출', Icon: TrendingUp, accent: 'text-purple-500' },
              ].map(({ label, Icon, accent }) => (
                <Card key={label} className="border-gray-200 border-dashed">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
                    <Icon className={`h-4 w-4 ${accent} opacity-40`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-300">—</div>
                    <p className="text-xs text-gray-400">데이터 없음</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mb-8 flex items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A1E0] to-[#16325C] flex items-center justify-center shrink-0">
                <Inbox className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">
                  첫 번째 수요자를 등록하면 대시보드가 깨어납니다
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  등록 후 자동으로 매출·활동·최근 접속 지표가 여기에 표시됩니다.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="border-gray-300">
                  <Link href="/admin/members">회원 목록 보기</Link>
                </Button>
                <Button asChild className="bg-[#00A1E0] hover:bg-[#0082B3]">
                  <Link href="/admin/distributors/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    수요자 등록하기
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}

        {/* 통계 카드 — 데이터 표시 */}
        {!isLoading && !error && stats && !isEmpty && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 수요자</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDistributors}</div>
                <p className="text-xs text-muted-foreground">
                  전체 등록된 분양 수요자 수
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 수요자</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeDistributors}</div>
                <p className="text-xs text-muted-foreground">
                  현재 활동 중인 수요자
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">대기 중</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingDistributors}</div>
                <p className="text-xs text-muted-foreground">
                  승인 대기 중인 신청
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 매출</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  누적 매출액
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 주요 기능 카드 */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* 수요자 관리 */}
          <Card className="group border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm shadow-blue-200 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {stats?.totalDistributors ?? 0}명
                </span>
              </div>
              <CardTitle className="text-base mt-3">수요자 관리</CardTitle>
              <CardDescription className="text-xs">분양 수요자 등록 · 승인 · 관리</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-blue-50" asChild>
                <Link href="/admin/distributors">
                  <Users className="mr-2 h-3.5 w-3.5" />
                  전체 수요자 목록
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-blue-50" asChild>
                <Link href="/admin/distributors/pending">
                  <Clock className="mr-2 h-3.5 w-3.5 text-orange-500" />
                  승인 대기
                  {!!stats?.pendingDistributors && (
                    <span className="ml-auto text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 rounded-full">
                      {stats.pendingDistributors}
                    </span>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-blue-50" asChild>
                <Link href="/admin/distributors/new">
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  신규 수요자 등록
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 리소스 관리 */}
          <Card className="group border-gray-200 hover:border-green-300 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardHeader className="pb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm shadow-emerald-200 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <CardTitle className="text-base mt-3">리소스 관리</CardTitle>
              <CardDescription className="text-xs">분양자용 자료 · 템플릿</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-emerald-50" asChild>
                <Link href="/admin/resources">
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  전체 리소스
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-emerald-50" asChild>
                <Link href="/admin/resources/new">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  새 자료 추가
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 활동 분석 */}
          <Card className="group border-gray-200 hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-fuchsia-400" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-400 flex items-center justify-center shadow-sm shadow-purple-200 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                {!!stats?.recentActivities && (
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {stats.recentActivities}건
                  </span>
                )}
              </div>
              <CardTitle className="text-base mt-3">활동 분석</CardTitle>
              <CardDescription className="text-xs">활동 로그 · 통계 · 리포트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-purple-50" asChild>
                <Link href="/admin/activity-log">
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  활동 로그
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-purple-50" asChild>
                <Link href="/admin/analytics">
                  <TrendingUp className="mr-2 h-3.5 w-3.5" />
                  통계 대시보드
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-purple-50" asChild>
                <Link href="/admin/reports">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  리포트 다운로드
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 결제 & 구독 */}
          <Card className="group border-gray-200 hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-sm shadow-amber-200 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                {!!stats?.totalRevenue && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {formatCurrency(stats.totalRevenue)}
                  </span>
                )}
              </div>
              <CardTitle className="text-base mt-3">결제 & 구독</CardTitle>
              <CardDescription className="text-xs">결제 · 영수증 · 구독 플랜</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-amber-50" asChild>
                <Link href="/admin/subscription-plans">
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  구독 플랜
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-amber-50" asChild>
                <Link href="/admin/payments">
                  <CreditCard className="mr-2 h-3.5 w-3.5" />
                  결제 내역
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-gray-700 hover:bg-amber-50" asChild>
                <Link href="/admin/invoices">
                  <Receipt className="mr-2 h-3.5 w-3.5" />
                  영수증 관리
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 피드 */}
        <div className="mt-8">
          <RecentActivityFeed
            title="최근 활동"
            description="수요자 활동 최근 10건"
            moreHref="/admin/activity-log"
          />
        </div>

        {/* 빠른 작업 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/">
                  홈페이지 보기
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/education">
                  교육 페이지
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/media">
                  미디어 페이지
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/works">
                  작품 페이지
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
