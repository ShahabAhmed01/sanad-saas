"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { InlineEdit } from "@/components/ui/inline-edit";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { logAuditEvent } from "@/lib/audit-client";
import { useI18n } from "@/i18n/provider";

interface ExamSchedule {
  id: string;
  exam_name: string;
  subject_name: string;
  class_name: string;
  max_marks: number;
  passing_marks: number;
}

interface StudentMark {
  student_id: string;
  student_name: string;
  marks_obtained: string;
  is_absent: boolean;
}

async function fetchSchedules(schoolId: string): Promise<ExamSchedule[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("exam_subject_schedule")
    .select("id, max_marks, passing_marks, exams!inner(name), subjects!inner(name), classes!inner(name)")
    .eq("school_id", schoolId);
  return (data || []).map((s: { id: string; max_marks: number; passing_marks: number; exams: { name: string }[]; subjects: { name: string }[]; classes: { name: string }[] }) => ({
    id: s.id,
    exam_name: s.exams[0]?.name || "",
    subject_name: s.subjects[0]?.name || "",
    class_name: s.classes[0]?.name || "",
    max_marks: s.max_marks,
    passing_marks: s.passing_marks,
  }));
}

async function fetchStudentsAndMarks(selectedSchedule: string): Promise<StudentMark[]> {
  const supabase = createClient();
  const { data: studentsData } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("status", "active")
    .order("full_name");

  const { data: existingMarks } = await supabase
    .from("marks")
    .select("student_id, marks_obtained, is_absent")
    .eq("exam_subject_schedule_id", selectedSchedule);

  const marksMap: Record<string, { marks: string; absent: boolean }> = {};
  (existingMarks || []).forEach((m) => {
    marksMap[m.student_id] = {
      marks: m.marks_obtained?.toString() || "",
      absent: m.is_absent,
    };
  });

  return (studentsData || []).map((s) => ({
    student_id: s.id,
    student_name: s.full_name,
    marks_obtained: marksMap[s.id]?.marks || "",
    is_absent: marksMap[s.id]?.absent || false,
  }));
}

export default function MarksEntryPage() {
  const { t } = useI18n();
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [overrides, setOverrides] = useState<Record<string, Partial<StudentMark>>>({});
  const [saved, setSaved] = useState(false);
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: queryKeys.school.gradebook(schoolId),
    queryFn: () => fetchSchedules(schoolId),
    enabled: !!schoolId,
  });

  const { data: loadedStudents, isLoading: loading } = useQuery({
    queryKey: queryKeys.school.gradebook(schoolId).concat("marks", selectedSchedule),
    queryFn: () => fetchStudentsAndMarks(selectedSchedule),
    enabled: !!selectedSchedule,
  });

  const students = (loadedStudents || []).map((s) => ({
    ...s,
    ...(overrides[s.student_id] || {}),
  }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = students
        .filter((s) => s.marks_obtained !== "" || s.is_absent)
        .map((s) => ({
          exam_subject_schedule_id: selectedSchedule,
          student_id: s.student_id,
          marks_obtained: s.is_absent ? null : parseFloat(s.marks_obtained),
          is_absent: s.is_absent,
          entered_by: user.id,
        }));

      const { error } = await supabase
        .from("marks")
        .upsert(records, { onConflict: "exam_subject_schedule_id,student_id" });

      if (error) throw error;
      return records;
    },
    onSuccess: (records) => {
      toast.success(t("gradebook.toast_saved"), { description: `${records.length} student marks recorded` });
      logAuditEvent("marks_entry", {
        entityType: "marks",
        metadata: {
          schedule_id: selectedSchedule,
          student_count: records.length,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({
        queryKey: queryKeys.school.gradebook(schoolId).concat("marks", selectedSchedule),
      });
    },
    onError: (error) => {
      toast.error(t("gradebook.toast_save_failed"), { description: error.message });
    },
  });

  function updateMark(studentId: string, field: "marks_obtained" | "is_absent", value: string | boolean) {
    setOverrides((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value },
    }));
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.gradebook") }, { label: t("gradebook.marks_entry") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("gradebook.marks_entry")}
        description={t("gradebook.marks_entry_description")}
        action={
          selectedSchedule && students.length > 0 ? (
            <Button onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending} className={cn("text-white", saved ? "bg-success" : "bg-accent hover:bg-accent/90")}>
              <Save className="h-4 w-4 mr-2" />
              {saved ? t("gradebook.saved") : t("gradebook.save_marks")}
            </Button>
          ) : undefined
        }
      />

      <Card className="border-slate-light max-w-lg">
        <CardContent className="p-4">
          <Label htmlFor="exam-subject" className="text-ink">{t("gradebook.select_exam_subject")}</Label>
          <Select
            id="exam-subject"
            value={selectedSchedule}
            onChange={(e) => setSelectedSchedule(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
            placeholder={t("gradebook.choose_exam_subject")}
            options={schedules.map((s) => ({ value: s.id, label: `${s.exam_name} — ${s.subject_name} (${s.class_name}) [Max: ${s.max_marks}]` }))}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />)}
        </div>
      ) : students.length > 0 ? (
        <div className="space-y-2">
          {students.map((s) => (
            <div key={s.student_id} className="flex items-center gap-3 p-3 bg-paper-raised rounded-lg border border-slate-light">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-ink shrink-0">
                {s.student_name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-ink flex-1 truncate">{s.student_name}</span>
              <InlineEdit
                value={s.marks_obtained}
                onSave={(val) => updateMark(s.student_id, "marks_obtained", String(val))}
                type="number"
                className="w-20 text-center"
                placeholder="—"
                min={0}
                max={schedules.find((sc) => sc.id === selectedSchedule)?.max_marks || 100}
              />
              <label htmlFor={`absent-${s.student_id}`} className="flex items-center gap-1 text-xs text-slate">
                <input
                  id={`absent-${s.student_id}`}
                  type="checkbox"
                  checked={s.is_absent}
                  onChange={(e) => updateMark(s.student_id, "is_absent", e.target.checked)}
                  className="rounded"
                />
                {t("gradebook.absent")}
              </label>
            </div>
          ))}
        </div>
      ) : null}
    </div>
    </>
  );
}
