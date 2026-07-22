export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-muted rounded-lg animate-skeleton mb-2" />
          <div className="h-4 w-48 bg-muted rounded animate-skeleton" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-lg animate-skeleton" />
      </div>

      {/* Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 ring-1 ring-foreground/10">
          <div className="h-5 w-32 bg-muted rounded animate-skeleton mb-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-4 w-20 bg-muted rounded animate-skeleton mb-1.5" />
                  <div className="h-10 w-full bg-muted rounded-lg animate-skeleton" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
