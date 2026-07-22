export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Nav Skeleton */}
      <header className="sticky top-0 z-50 bg-paper-raised/80 backdrop-blur-md border-b border-slate-light">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted animate-skeleton" />
            <div className="h-5 w-16 bg-muted rounded animate-skeleton" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-14 bg-muted rounded animate-skeleton" />
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="h-9 w-16 bg-muted rounded-lg animate-skeleton" />
            <div className="h-9 w-28 bg-muted rounded-lg animate-skeleton" />
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-8 w-64 bg-muted rounded-full animate-skeleton mx-auto mb-6" />
          <div className="h-12 w-96 bg-muted rounded-lg animate-skeleton mx-auto mb-4" />
          <div className="h-12 w-72 bg-muted rounded-lg animate-skeleton mx-auto mb-6" />
          <div className="h-5 w-80 bg-muted rounded animate-skeleton mx-auto mb-8" />
          <div className="flex items-center justify-center gap-4">
            <div className="h-11 w-40 bg-muted rounded-lg animate-skeleton" />
            <div className="h-11 w-32 bg-muted rounded-lg animate-skeleton" />
          </div>
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="py-12 px-4 bg-paper-raised border-y border-slate-light">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-20 bg-muted rounded animate-skeleton mx-auto mb-2" />
              <div className="h-4 w-24 bg-muted rounded animate-skeleton mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* Features Skeleton */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 w-72 bg-muted rounded-lg animate-skeleton mx-auto mb-4" />
            <div className="h-5 w-96 bg-muted rounded animate-skeleton mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-paper-raised rounded-xl p-6 border border-slate-light">
                <div className="w-12 h-12 rounded-xl bg-muted animate-skeleton mb-4" />
                <div className="h-5 w-32 bg-muted rounded animate-skeleton mb-2" />
                <div className="h-4 w-full bg-muted rounded animate-skeleton" />
                <div className="h-4 w-3/4 bg-muted rounded animate-skeleton mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
