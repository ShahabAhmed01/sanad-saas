export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome Card Skeleton */}
      <div className="bg-gradient-to-r from-accent/10 via-paper-raised to-success/10 rounded-2xl p-6 md:p-8 border border-slate-light">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="h-8 w-64 bg-muted rounded-lg animate-skeleton mb-2" />
            <div className="h-4 w-48 bg-muted rounded animate-skeleton" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-36 bg-muted rounded-lg animate-skeleton" />
            <div className="h-9 w-28 bg-muted rounded-lg animate-skeleton" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-skeleton" />
              <div className="h-9 w-9 bg-muted rounded-xl animate-skeleton" />
            </div>
            <div className="h-7 w-16 bg-muted rounded animate-skeleton mt-2" />
            <div className="h-3 w-20 bg-muted rounded animate-skeleton mt-2" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 ring-1 ring-foreground/10">
          <div className="h-5 w-28 bg-muted rounded animate-skeleton mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-xl animate-skeleton" />
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 ring-1 ring-foreground/10">
          <div className="h-5 w-28 bg-muted rounded animate-skeleton mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 bg-muted rounded-lg animate-skeleton" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded animate-skeleton w-3/4" />
                  <div className="h-2.5 bg-muted rounded animate-skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
