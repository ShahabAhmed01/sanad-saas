"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck, Check, X, Clock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: string;
  marked_by: string;
}

async function fetchAttendance(schoolId: string, date: string): Promise<AttendanceRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_attendance")
    .select("*")
    .eq("date", date)
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to load attendance");
  return data || [];
}

export default function AttendancePage() {
  const router = useRouter();
  const schoolId = useSchoolId();
  const { t } = useI18n();
  const today = new Date().toISOString().split("T")[0];

  const { data: records = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKeys.school.attendance(schoolId, today),
    queryFn: () => fetchAttendance(schoolId, today),
    enabled: !!schoolId,
  });

  const error = queryError ? queryError.message : null;

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
  };

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.attendance") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("nav.attendance")}
        description={t("attendance.tracking_for").replace("{date}", new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" }))}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/attendance/reports")}>
              {t("nav.attendanceReports")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/attendance/absent")}>
              {t("nav.absentStudents")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/attendance/staff")}>
              {t("nav.staffAttendance")}
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={() => router.push("/attendance/mark")}>
              {t("attendance.markAttendance")}
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="border-danger bg-danger/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <p className="text-danger font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {!error && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate">{t("attendance.total")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink tabular-nums">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-success">{t("attendance.present")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success tabular-nums">{stats.present}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-danger">{t("attendance.absent")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger tabular-nums">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-accent">{t("attendance.late")}</CardTitle>
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
          title={t("attendance.no_attendance_today")}
          description={t("attendance.select_class_description")}
          action={{ label: t("attendance.take_attendance"), onClick: () => router.push("/attendance/mark") }}
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
                      {t(`attendance.${record.status}`)}
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
    </>
  );
}
