import { Card, CardContent, CardHeader } from '@/components/ui/card';

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

function FeatureCardSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="h-5 w-28 animate-pulse bg-gray-200 rounded mb-1" />
        <div className="h-3 w-44 animate-pulse bg-gray-200 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-9 w-full animate-pulse bg-gray-200 rounded" />
        <div className="h-9 w-full animate-pulse bg-gray-200 rounded" />
        <div className="h-9 w-full animate-pulse bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-48 animate-pulse bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 animate-pulse bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 animate-pulse bg-gray-200 rounded" />
          <div className="h-9 w-24 animate-pulse bg-gray-200 rounded" />
        </div>
      </div>

      {/* KPI 카드 스켈레톤 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>

      {/* 기능 카드 스켈레톤 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCardSkeleton />
        <FeatureCardSkeleton />
        <FeatureCardSkeleton />
      </div>
    </div>
  );
}
