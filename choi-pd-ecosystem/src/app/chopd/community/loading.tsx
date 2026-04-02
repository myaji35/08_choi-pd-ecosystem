export default function CommunityLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0E2340 35%, #16325C 60%, #0080B8 100%)' }}>
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 h-8 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mb-4 h-12 w-48 animate-pulse rounded bg-white/10" />
            <div className="mx-auto h-6 w-72 max-w-full animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </section>

      {/* Announcements Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12">
            <div className="mb-4 h-9 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-56 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="mb-3 h-6 w-full animate-pulse rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section Skeleton */}
      <section className="border-t border-gray-200 py-20" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-full bg-gray-200" />
            <div className="mx-auto mb-4 h-9 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-5 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <div className="h-12 w-44 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-12 w-44 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-full bg-gray-200" />
            <div className="mx-auto mb-4 h-9 w-44 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mb-8 h-5 w-72 max-w-full animate-pulse rounded bg-gray-200" />
            <div className="flex gap-3">
              <div className="h-11 flex-1 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-11 w-24 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
