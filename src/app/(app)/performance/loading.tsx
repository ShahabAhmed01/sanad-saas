import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-[200px]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}
