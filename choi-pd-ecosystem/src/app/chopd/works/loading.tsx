export default function WorksLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0E2340 35%, #16325C 60%, #0080B8 100%)' }}>
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 h-8 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mb-4 h-12 w-72 animate-pulse rounded bg-white/10" />
            <div className="mx-auto h-6 w-80 max-w-full animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </section>

      {/* Books Section Skeleton */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-auto mb-4 h-9 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-5 w-56 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="h-64 w-full animate-pulse bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section Skeleton */}
      <section className="py-20" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-auto mb-4 h-9 w-52 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-5 w-64 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </section>

      {/* Press Section Skeleton */}
      <section className="border-t border-gray-200 py-20 bg-white">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-auto mb-4 h-9 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="h-48 w-full animate-pulse bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
