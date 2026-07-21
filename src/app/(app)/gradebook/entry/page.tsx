"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function MarksEntryPage() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("exam_subject_schedule")
        .select("id, max_marks, passing_marks, exams!inner(name), subjects!inner(name), classes!inner(name)");
      setSchedules((data || []).map((s: any) => ({
        id: s.id,
        exam_name: s.exams?.name || "",
        subject_name: s.subjects?.name || "",
        class_name: s.classes?.name || "",
        max_marks: s.max_marks,
        passing_marks: s.passing_marks,
      })));
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedSchedule) return;
    async function loadStudents() {
      setLoading(true);
      const supabase = createClient();
      const schedule = schedules.find((s) => s.id === selectedSchedule);
      if (!schedule) { setLoading(false); return; }

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

      setStudents((studentsData || []).map((s) => ({
        student_id: s.id,
        student_name: s.full_name,
        marks_obtained: marksMap[s.id]?.marks || "",
        is_absent: marksMap[s.id]?.absent || false,
      })));
      setLoading(false);
    }
    loadStudents();
  }, [selectedSchedule, schedules]);

  function updateMark(studentId: string, field: "marks_obtained" | "is_absent", value: string | boolean) {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId ? { ...s, [field]: value } : s
      )
    );
  }

  async function saveMarks() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const records = students
      .filter((s) => s.marks_obtained !== "" || s.is_absent)
      .map((s) => ({
        exam_subject_schedule_id: selectedSchedule,
        student_id: s.student_id,
        marks_obtained: s.is_absent ? null : parseFloat(s.marks_obtained),
        is_absent: s.is_absent,
        entered_by: user.id,
      }));

    await supabase
      .from("marks")
      .upsert(records, { onConflict: "exam_subject_schedule_id,student_id" });

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Entry"
        description="Enter marks for an exam subject"
        action={
          selectedSchedule && students.length > 0 ? (
            <Button onClick={saveMarks} disabled={saving} className={cn("text-white", saved ? "bg-success" : "bg-accent hover:bg-accent/90")}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Marks"}
            </Button>
          ) : undefined
        }
      />

      <Card className="border-slate-light max-w-lg">
        <CardContent className="p-4">
          <Label className="text-ink">Select Exam Subject</Label>
          <select
            value={selectedSchedule}
            onChange={(e) => setSelectedSchedule(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
          >
            <option value="">Choose exam subject...</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.exam_name} — {s.subject_name} ({s.class_name}) [Max: {s.max_marks}]
              </option>
            ))}
          </select>
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
              <Input
                type="number"
                value={s.marks_obtained}
                onChange={(e) => updateMark(s.student_id, "marks_obtained", e.target.value)}
                className="w-20 text-center"
                placeholder="—"
                disabled={s.is_absent}
              />
              <label className="flex items-center gap-1 text-xs text-slate">
                <input
                  type="checkbox"
                  checked={s.is_absent}
                  onChange={(e) => updateMark(s.student_id, "is_absent", e.target.checked)}
                  className="rounded"
                />
                Absent
              </label>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
