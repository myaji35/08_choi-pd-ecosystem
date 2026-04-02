'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">분양 관리 대시보드</h1>
          {user && (
            <p className="text-sm text-gray-500 mt-1">{user.email || user.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/pd/dashboard')} variant="outline" size="sm">
            PD 대시보드
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
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

        {/* 통계 카드 — empty state */}
        {!isLoading && !error && isEmpty && (
          <div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 px-4">
            <Inbox className="h-12 w-12 text-gray-300 mb-4" strokeWidth={1.5} />
            <p className="text-base font-semibold text-gray-700 mb-1">아직 등록된 수요자가 없습니다</p>
            <p className="text-sm text-gray-500 mb-4">첫 번째 수요자를 등록하여 대시보드를 활성화하세요.</p>
            <Button asChild>
              <a href="/admin/distributors/new">
                <UserPlus className="mr-2 h-4 w-4" />
                수요자 등록하기
              </a>
            </Button>
          </div>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 수요자 관리 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                수요자 관리
              </CardTitle>
              <CardDescription>
                분양 수요자 등록, 승인, 관리
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/distributors">
                  <Users className="mr-2 h-4 w-4" />
                  전체 수요자 목록
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/distributors/pending">
                  <Clock className="mr-2 h-4 w-4" />
                  승인 대기 ({stats?.pendingDistributors ?? 0})
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/distributors/new">
                  <UserPlus className="mr-2 h-4 w-4" />
                  신규 수요자 등록
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* 리소스 관리 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                리소스 관리
              </CardTitle>
              <CardDescription>
                분양자용 자료 및 템플릿 관리
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/resources">
                  <FileText className="mr-2 h-4 w-4" />
                  전체 리소스
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/resources/new">
                  <Download className="mr-2 h-4 w-4" />
                  새 자료 추가
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* 활동 로그 & 통계 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                활동 분석
              </CardTitle>
              <CardDescription>
                수요자 활동 로그 및 통계
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/activity-log">
                  <FileText className="mr-2 h-4 w-4" />
                  활동 로그
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  통계 대시보드
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/reports">
                  <Download className="mr-2 h-4 w-4" />
                  리포트 다운로드
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* 결제 & 구독 관리 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                결제 & 구독
              </CardTitle>
              <CardDescription>
                결제, 영수증, 구독 플랜 관리
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/subscription-plans">
                  <FileText className="mr-2 h-4 w-4" />
                  구독 플랜
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/payments">
                  <CreditCard className="mr-2 h-4 w-4" />
                  결제 내역
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/invoices">
                  <Receipt className="mr-2 h-4 w-4" />
                  영수증 관리
                </a>
              </Button>
            </CardContent>
          </Card>
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
                <a href="/">
                  홈페이지 보기
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/education">
                  교육 페이지
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/media">
                  미디어 페이지
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/works">
                  작품 페이지
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
