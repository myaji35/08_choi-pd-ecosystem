import { Card, CardContent, CardHeader } from '@/components/ui/card';

function CardSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="h-5 w-32 animate-pulse bg-gray-200 rounded mb-1" />
        <div className="h-3 w-48 animate-pulse bg-gray-200 rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-40 w-40 mx-auto animate-pulse bg-gray-200 rounded-full" />
        <div className="h-10 w-full animate-pulse bg-gray-200 rounded" />
        <div className="h-16 w-full animate-pulse bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );
}

function LinksCardSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="h-5 w-24 animate-pulse bg-gray-200 rounded mb-1" />
        <div className="h-3 w-40 animate-pulse bg-gray-200 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-full animate-pulse bg-gray-200 rounded" />
        ))}
      </CardContent>
    </Card>
  );
}

export default function PDDashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* 헤더 스켈레톤 */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 animate-pulse bg-gray-200 rounded" />
            <div className="h-4 w-40 animate-pulse bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-24 animate-pulse bg-gray-200 rounded" />
        </div>
      </header>

      {/* 메인 콘텐츠 스켈레톤 */}
      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <LinksCardSkeleton />
          <Card className="border-gray-200">
            <CardHeader>
              <div className="h-5 w-24 animate-pulse bg-gray-200 rounded mb-1" />
              <div className="h-3 w-20 animate-pulse bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3.5 w-12 animate-pulse bg-gray-200 rounded mb-1.5" />
                  <div className="h-3.5 w-32 animate-pulse bg-gray-200 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
