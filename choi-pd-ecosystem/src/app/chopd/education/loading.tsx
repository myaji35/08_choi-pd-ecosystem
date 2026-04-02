export default function EducationLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0E2340 35%, #16325C 60%, #0080B8 100%)' }}>
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 h-8 w-36 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mb-4 h-12 w-80 animate-pulse rounded bg-white/10" />
            <div className="mx-auto h-12 w-64 animate-pulse rounded bg-white/10" />
            <div className="mx-auto mt-5 h-6 w-96 max-w-full animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </section>

      {/* Features Skeleton */}
      <section className="border-b border-gray-200 py-12" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Skeleton */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="h-9 w-40 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-5 w-28 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="h-48 w-full animate-pulse bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="border-t border-gray-200 py-16" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-full bg-gray-200" />
            <div className="mx-auto h-9 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mt-4 h-5 w-72 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
