"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck, Check, X, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: string;
  marked_by: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadAttendance() {
      const supabase = createClient();
      const { data } = await supabase
        .from("student_attendance")
        .select("*")
        .eq("date", today)
        .order("created_at", { ascending: false });

      setRecords(data || []);
      setLoading(false);
    }
    loadAttendance();
  }, [today]);

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={`Tracking for ${new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            Take Attendance
          </Button>
        }
      />

      {/* Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink tabular-nums">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-success">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success tabular-nums">{stats.present}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-danger">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger tabular-nums">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-accent">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent tabular-nums">{stats.late}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance recorded today"
          description="Select a class to take attendance for today."
          action={{ label: "Take Attendance", onClick: () => {} }}
        />
      ) : (
        <Card className="border-slate-light">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-light">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {record.status === "present" && <Check className="h-4 w-4 text-success" />}
                      {record.status === "absent" && <X className="h-4 w-4 text-danger" />}
                      {record.status === "late" && <Clock className="h-4 w-4 text-accent" />}
                    </div>
                    <span className="text-sm font-medium text-ink capitalize">
                      {record.status.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-xs text-slate font-mono">{record.student_id.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
