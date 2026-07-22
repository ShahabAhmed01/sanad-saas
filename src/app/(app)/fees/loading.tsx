export default function FeesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-muted rounded-lg animate-skeleton mb-2" />
          <div className="h-4 w-56 bg-muted rounded animate-skeleton" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted rounded-lg animate-skeleton" />
          <div className="h-9 w-36 bg-muted rounded-lg animate-skeleton" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 ring-1 ring-foreground/10">
            <div className="h-4 w-20 bg-muted rounded animate-skeleton mb-2" />
            <div className="h-7 w-28 bg-muted rounded animate-skeleton" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <div className="flex gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 bg-muted rounded animate-skeleton" style={{ width: `${60 + i * 10}px` }} />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-8">
              <div className="h-4 w-24 bg-muted rounded animate-skeleton" />
              <div className="h-4 w-20 bg-muted rounded animate-skeleton" />
              <div className="h-4 w-20 bg-muted rounded animate-skeleton" />
              <div className="h-5 w-16 bg-muted rounded-full animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
