'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
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
  UserPlus
} from 'lucide-react';

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

interface DistributorStats {
  totalDistributors: number;
  activeDistributors: number;
  pendingDistributors: number;
  totalRevenue: number;
  recentActivities: number;
}

export default function AdminDistributorDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [stats, setStats] = useState<DistributorStats>({
    totalDistributors: 0,
    activeDistributors: 0,
    pendingDistributors: 0,
    totalRevenue: 0,
    recentActivities: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    if (IS_DEV_MODE) {
      document.cookie = 'dev-auth=; path=/; max-age=0';
      router.push('/admin/login');
      router.refresh();
    } else {
      await signOut();
      router.push('/');
    }
  };

  useEffect(() => {
    // TODO: Fetch distributor stats from API
    // Placeholder data for now
    setTimeout(() => {
      setStats({
        totalDistributors: 12,
        activeDistributors: 8,
        pendingDistributors: 4,
        totalRevenue: 45000000,
        recentActivities: 23,
      });
      setIsLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* 헤더 */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">imPD 분양 관리 대시보드</h1>
            {IS_DEV_MODE ? (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                개발 모드
              </Badge>
            ) : user ? (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span>{user.primaryEmailAddress?.emailAddress || user.username}</span>
              </div>
            ) : null}
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
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container py-8">
        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
                  승인 대기 ({stats.pendingDistributors})
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
      </main>
    </div>
  );
}
