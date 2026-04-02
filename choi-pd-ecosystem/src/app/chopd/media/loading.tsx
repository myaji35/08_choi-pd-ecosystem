export default function MediaLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="border-b bg-gradient-to-b from-green-50 to-background py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 h-12 w-56 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-7 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mt-6 h-6 w-80 max-w-full animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mt-8 h-11 w-40 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </section>

      {/* Features Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mx-auto h-9 w-56 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-gray-200" />
                <div className="mx-auto mb-3 h-6 w-32 animate-pulse rounded bg-gray-200" />
                <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Skeleton */}
      <section className="border-y bg-muted/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto mb-8 h-9 w-32 animate-pulse rounded bg-gray-200" />
            <div className="space-y-4">
              <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-4/6 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Activities Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto mb-12 h-9 w-32 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-4 h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                <div className="mb-2 h-6 w-40 animate-pulse rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="mt-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="border-t bg-gradient-to-b from-background to-green-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto h-9 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mt-4 h-6 w-80 max-w-full animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mt-8 h-11 w-44 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
