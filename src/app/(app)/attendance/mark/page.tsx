"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";
import { AlertCircle, Check, X, Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { logAuditEvent } from "@/lib/audit-client";
import { useI18n } from "@/i18n/provider";

interface Section {
  id: string;
  name: string;
  class_name: string;
}

type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "leave";

function getStatusConfig(t: (key: string) => string): Record<AttendanceStatus, { icon: React.ElementType; color: string; bg: string; label: string }> {
  return {
    present: { icon: Check, color: "text-success", bg: "bg-success/10 border-success", label: t("attendance.present") },
    absent: { icon: X, color: "text-danger", bg: "bg-danger/10 border-danger", label: t("attendance.absent") },
    late: { icon: Clock, color: "text-accent", bg: "bg-accent/10 border-accent", label: t("attendance.late") },
    half_day: { icon: Clock, color: "text-accent", bg: "bg-accent/10 border-accent", label: t("attendance.half_day") },
    leave: { icon: Clock, color: "text-slate", bg: "bg-slate/10 border-slate", label: t("attendance.leave") },
  };
}

async function fetchSections(schoolId: string): Promise<Section[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("sections")
    .select("id, name, classes!inner(name)")
    .eq("classes.school_id", schoolId)
    .order("name");
  return (data || []).map((s: { id: string; name: string; classes: { name: string }[] }) => ({
    id: s.id,
    name: s.name,
    class_name: s.classes[0]?.name || "",
  }));
}

async function fetchStudentsAndAttendance(sectionId: string, date: string) {
  const supabase = createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, admission_number")
    .eq("section_id", sectionId)
    .eq("status", "active")
    .order("full_name");

  const { data: existing } = await supabase
    .from("student_attendance")
    .select("student_id, status")
    .eq("section_id", sectionId)
    .eq("date", date);

  const existingMap: Record<string, AttendanceStatus> = {};
  (existing || []).forEach((e) => {
    existingMap[e.student_id] = e.status as AttendanceStatus;
  });

  const defaultAttendance: Record<string, AttendanceStatus> = {};
  (students || []).forEach((s) => {
    defaultAttendance[s.id] = existingMap[s.id] || "present";
  });

  return { students: students || [], attendance: defaultAttendance };
}

export default function MarkAttendancePage() {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const today = new Date().toISOString().split("T")[0];

  const { data: sections = [], error: sectionsError } = useQuery({
    queryKey: queryKeys.school.attendance(schoolId, "sections"),
    queryFn: () => fetchSections(schoolId),
    enabled: !!schoolId,
  });

  const { data: studentData, isLoading: loading, error: studentDataError } = useQuery({
    queryKey: queryKeys.school.attendance(schoolId, `${selectedSection}-${today}`),
    queryFn: () => fetchStudentsAndAttendance(selectedSection, today),
    enabled: !!selectedSection,
  });

  const students = studentData?.students || [];
  const attendance = { ...studentData?.attendance, ...overrides };

  function toggleStatus(studentId: string, status: AttendanceStatus) {
    setOverrides((prev) => ({ ...prev, [studentId]: status }));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        section_id: selectedSection,
        date: today,
        status,
        marked_by: user.id,
        school_id: schoolId,
      }));

      const { error } = await supabase
        .from("student_attendance")
        .upsert(records, { onConflict: "student_id,date" });

      if (error) throw error;
      return records;
    },
    onSuccess: () => {
      setSaved(true);
      toast.success(t("attendance.toast_saved"), { description: t("toast_records_updated").replace("{count}", String(students.length)) });
      logAuditEvent("attendance_mark", {
        entityType: "student_attendance",
        metadata: {
          section_id: selectedSection,
          date: today,
          student_count: students.length,
        },
      });
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: queryKeys.school.attendance(schoolId, `${selectedSection}-${today}`) });
    },
    onError: (error: Error) => {
      toast.error(t("attendance.toast_failed"), { description: error.message || t("toast_try_again") });
    },
  });

  const stats = {
    total: students.length,
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
  };

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.attendance"), href: "/attendance" }, { label: t("attendance.mark_attendance") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("attendance.mark_attendance")}
        description={new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        action={
          selectedSection && students.length > 0 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const allPresent: Record<string, AttendanceStatus> = {};
                  students.forEach((s) => { allPresent[s.id] = "present"; });
                  setOverrides(allPresent);
                  toast.success(t("attendance.marked_all_present"), { description: `${students.length} ${t("attendance.students_set_to_present")}` });
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                {t("attendance.mark_all_present")}
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                isLoading={saveMutation.isPending}
                className={cn(
                  "text-white",
                  saved ? "bg-success" : "bg-accent hover:bg-accent/90"
                )}
              >
                <Save className="h-4 w-4 mr-2" />
                {saved ? t("attendance.saved") : t("attendance.save_attendance")}
              </Button>
            </div>
          ) : undefined
        }
      />

      {(sectionsError || studentDataError) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("attendance.failed_to_load")}</p>
          <p className="text-xs text-slate mt-1">{(sectionsError || studentDataError)?.message}</p>
        </div>
      )}

      {/* Section Selector */}
      <Card className="border-slate-light">
        <CardContent className="p-4">
          <label htmlFor="section-select" className="text-sm font-medium text-ink block mb-2">{t("attendance.select_class_section")}</label>
          <Select
            id="section-select"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
            placeholder={t("attendance.choose_section")}
            options={sections.map((s) => ({ value: s.id, label: `${s.class_name} — ${s.name}` }))}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-paper-raised border border-slate-light">
            <p className="text-xs text-slate">{t("attendance.total")}</p>
            <p className="text-xl font-bold text-ink tabular-nums">{stats.total}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/5 border border-success/20">
            <p className="text-xs text-success">{t("attendance.present")}</p>
            <p className="text-xl font-bold text-success tabular-nums">{stats.present}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-danger/5 border border-danger/20">
            <p className="text-xs text-danger">{t("attendance.absent")}</p>
            <p className="text-xl font-bold text-danger tabular-nums">{stats.absent}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs text-accent">{t("attendance.late")}</p>
            <p className="text-xl font-bold text-accent tabular-nums">{stats.late}</p>
          </div>
        </div>
      )}

      {/* Student Roster */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : students.length === 0 && selectedSection ? (
        <Card className="border-slate-light">
          <CardContent className="py-8 text-center">
            <p className="text-slate">{t("attendance.no_students_in_section")}</p>
          </CardContent>
        </Card>
      ) : students.length > 0 ? (
        <div className="space-y-2">
          {students.map((student) => {
            const currentStatus = attendance[student.id] || "present";
            const statusConfig = getStatusConfig(t);
            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-paper-raised rounded-lg border border-slate-light"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-ink">
                    {student.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{student.full_name}</p>
                    <p className="text-xs text-slate font-mono">{student.admission_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
                    const sc = statusConfig[status];
                    const ScIcon = sc.icon;
                    const isActive = currentStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => toggleStatus(student.id, status)}
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-all border",
                          isActive
                            ? sc.bg + " border-current"
                            : "border-transparent hover:bg-muted"
                        )}
                        title={sc.label}
                      >
                        <ScIcon className={cn("h-4 w-4", isActive ? sc.color : "text-slate")} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
    </>
  );
}
