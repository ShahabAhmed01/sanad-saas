import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-[200px]" />
      <Skeleton className="h-8 w-[300px]" />
      <Skeleton className="h-[500px] w-full" />
    </div>
  );
}
