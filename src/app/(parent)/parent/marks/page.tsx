"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MarkRecord {
  id: string;
  marks_obtained: number;
  is_absent: boolean;
  exam_subject_schedule: {
    max_marks: number;
    subjects: { name: string };
    exams: { name: string };
  };
}

export default function ParentMarks() {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
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

      // Only published exam marks
      const { data } = await supabase
        .from("marks")
        .select(`
          id, marks_obtained, is_absent,
          exam_subject_schedule!inner (
            max_marks,
            subjects!inner (name),
            exams!inner (name, status)
          )
        `)
        .eq("student_id", sg.student_id)
        .eq("exam_subject_schedule.exams.status", "published");

      setMarks((data || []) as any);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Marks & Report Cards" description="Published exam results" />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : marks.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No published results" description="Exam results will appear here once published by your school." />
      ) : (
        <div className="space-y-2">
          {marks.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-paper-raised rounded-lg border border-slate-light">
              <div>
                <p className="text-sm font-medium text-ink">
                  {(m.exam_subject_schedule as any)?.subjects?.name || "—"}
                </p>
                <p className="text-xs text-slate">
                  {(m.exam_subject_schedule as any)?.exams?.name || "—"}
                </p>
              </div>
              <div className="text-right">
                {m.is_absent ? (
                  <span className="text-sm text-danger">Absent</span>
                ) : (
                  <span className="text-sm font-bold text-ink tabular-nums">
                    {Number(m.marks_obtained)} / {Number((m.exam_subject_schedule as any)?.max_marks || 100)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
