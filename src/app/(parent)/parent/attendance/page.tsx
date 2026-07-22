"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle, CalendarCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
}

const statusColors: Record<string, string> = {
  present: "text-success",
  absent: "text-danger",
  late: "text-accent",
  half_day: "text-accent",
  leave: "text-slate",
};

async function fetchAttendance(childId: string | null): Promise<AttendanceRecord[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let studentId = childId;

  if (!studentId) {
    const { data: guardian } = await supabase
      .from("guardians")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!guardian) return [];

    const { data: sgList } = await supabase
      .from("student_guardians")
      .select("student_id")
      .eq("guardian_id", guardian.id)
      .limit(1);

    if (!sgList || sgList.length === 0) return [];
    studentId = sgList[0].student_id;
  }

  const { data } = await supabase
    .from("student_attendance")
    .select("id, date, status")
    .eq("student_id", studentId)
    .order("date", { ascending: false })
    .limit(30);

  return data || [];
}

function ParentAttendanceContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const { data: records = [], isLoading: loading, error } = useQuery<AttendanceRecord[]>({
    queryKey: ["parent-attendance", childId],
    queryFn: () => fetchAttendance(childId),
    enabled: !!childId,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">Failed to load data</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Your child's attendance history" />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance records" description="No attendance has been recorded yet." />
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-paper-raised rounded-lg border border-slate-light">
              <span className="text-sm text-ink">
                {new Date(r.date).toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span className={`text-sm font-medium capitalize ${statusColors[r.status] || "text-slate"}`}>
                {r.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ParentAttendance() {
  return (
    <Suspense fallback={
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
        ))}
      </div>
    }>
      <ParentAttendanceContent />
    </Suspense>
  );
}
