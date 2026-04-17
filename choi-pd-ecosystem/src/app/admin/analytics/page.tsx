'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Download,
  Activity,
  Calendar,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  BarChart3,
} from 'lucide-react';

interface Analytics {
  distributorStats: any;
  planDistribution: any;
  regionDistribution: any;
  businessTypeDistribution: any;
  totalRevenue: number;
  resourceStats: any;
  topResources: any[];
  activityStats: any;
  monthlySignups: Record<string, number>;
  avgActivityFrequency: number;
  period: number;
  generatedAt: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error(`서버 오류 (${response.status})`);
      }
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || '분석 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F2F2]">
        <header className="border-b bg-white/80 backdrop-blur">
          <div className="container flex h-16 items-center gap-4">
            <div className="h-8 w-8 animate-pulse bg-gray-200 rounded" />
            <div>
              <div className="h-5 w-32 animate-pulse bg-gray-200 rounded mb-1" />
              <div className="h-3 w-48 animate-pulse bg-gray-200 rounded" />
            </div>
          </div>
        </header>
        <main className="container py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 animate-pulse bg-gray-200 rounded" />
                  <div className="h-4 w-4 animate-pulse bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-7 w-16 animate-pulse bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-32 animate-pulse bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardHeader>
                  <div className="h-5 w-36 animate-pulse bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-48 animate-pulse bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] animate-pulse bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F2F2] flex items-center justify-center">
        <Card className="max-w-md border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              데이터 로드 실패
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchAnalytics} className="border-gray-300">
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/dashboard')} className="border-gray-300">
                <ArrowLeft className="mr-2 h-4 w-4" />
                대시보드로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#F3F2F2] flex items-center justify-center">
        <Card className="max-w-md border-gray-200">
          <CardHeader className="items-center text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mb-2" strokeWidth={1.5} />
            <CardTitle>분석 데이터 없음</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">선택한 기간에 해당하는 분석 데이터가 없습니다.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={fetchAnalytics} className="border-gray-300">
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </Button>
              <Button onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                대시보드로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 차트 데이터 준비
  const monthlySignupsData = Object.entries(analytics.monthlySignups).map(([month, count]) => ({
    month,
    count,
  }));

  const planDistributionData = [
    { name: 'Basic', value: analytics.planDistribution.basic },
    { name: 'Premium', value: analytics.planDistribution.premium },
    { name: 'Enterprise', value: analytics.planDistribution.enterprise },
    { name: '미정', value: analytics.planDistribution.none },
  ];

  const businessTypeData = [
    { name: '개인', value: analytics.businessTypeDistribution.individual },
    { name: '법인', value: analytics.businessTypeDistribution.company },
    { name: '기관', value: analytics.businessTypeDistribution.organization },
  ];

  const regionData = Object.entries(analytics.regionDistribution)
    .map(([region, count]) => ({
      region,
      count: count as number,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">통계 및 분석</h1>
              <p className="text-sm text-gray-600">비즈니스 인사이트 대시보드</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">최근 7일</SelectItem>
                <SelectItem value="30">최근 30일</SelectItem>
                <SelectItem value="90">최근 3개월</SelectItem>
                <SelectItem value="365">최근 1년</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={fetchAnalytics}>
              새로고침
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* 주요 지표 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 수요자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.distributorStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                활성: {analytics.distributorStats.active} | 대기: {analytics.distributorStats.pending}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(analytics.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">누적 매출액</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">리소스 다운로드</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.resourceStats.totalDownloads}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                전체 리소스: {analytics.resourceStats.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 활동 빈도</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.avgActivityFrequency}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                회/수요자 (최근 {period}일)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 차트 그리드 */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* 월별 신규 가입 추이 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                월별 신규 가입 추이
              </CardTitle>
              <CardDescription>최근 6개월 신규 수요자 등록</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySignupsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="신규 가입"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 구독 플랜 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>구독 플랜 분포</CardTitle>
              <CardDescription>플랜별 수요자 수</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 사업 유형별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>사업 유형별 분포</CardTitle>
              <CardDescription>수요자 사업 유형</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={businessTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="수요자 수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 지역별 TOP 10 */}
          <Card>
            <CardHeader>
              <CardTitle>지역별 분포 TOP 10</CardTitle>
              <CardDescription>수요자가 많은 지역</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="region" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="수요자 수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 인기 리소스 TOP 10 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              인기 리소스 TOP 10
            </CardTitle>
            <CardDescription>다운로드 수 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topResources.map((resource, index) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge style={{ background: '#3b82f6', color: 'white' }} className="text-sm">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{resource.title}</div>
                      <div className="text-xs text-gray-500">{resource.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-gray-400" />
                    <span className="font-bold">{resource.downloads}</span>
                  </div>
                </div>
              ))}
              {analytics.topResources.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  아직 다운로드된 리소스가 없습니다
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 생성 시간 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          마지막 업데이트: {new Date(analytics.generatedAt).toLocaleString('ko-KR')}
        </div>
      </main>
    </div>
  );
}
