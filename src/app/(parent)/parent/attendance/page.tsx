"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export default function ParentAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: guardian } = await supabase
        .from("guardians")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!guardian) { setLoading(false); return; }

      const { data: sg } = await supabase
        .from("student_guardians")
        .select("student_id")
        .eq("guardian_id", guardian.id)
        .limit(1)
        .single();

      if (!sg) { setLoading(false); return; }

      const { data } = await supabase
        .from("student_attendance")
        .select("id, date, status")
        .eq("student_id", sg.student_id)
        .order("date", { ascending: false })
        .limit(30);

      setRecords(data || []);
      setLoading(false);
    }
    load();
  }, []);

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
