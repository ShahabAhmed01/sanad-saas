"use client";

import { useState, useEffect, Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

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

function ParentMarksContent() {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let studentId = childId;

      if (!studentId) {
        const { data: guardian } = await supabase
          .from("guardians")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!guardian) { setLoading(false); return; }

        const { data: sgList } = await supabase
          .from("student_guardians")
          .select("student_id")
          .eq("guardian_id", guardian.id)
          .limit(1);

        if (!sgList || sgList.length === 0) { setLoading(false); return; }
        studentId = sgList[0].student_id;
      }

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
        .eq("student_id", studentId)
        .eq("exam_subject_schedule.exams.status", "published");

      setMarks((data as unknown as MarkRecord[]) || []);
      setLoading(false);
    }
    load();
  }, [childId]);

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
                    {m.exam_subject_schedule?.subjects?.name || "—"}
                </p>
                <p className="text-xs text-slate">
                    {m.exam_subject_schedule?.exams?.name || "—"}
                </p>
              </div>
              <div className="text-right">
                {m.is_absent ? (
                  <span className="text-sm text-danger">Absent</span>
                ) : (
                  <span className="text-sm font-bold text-ink tabular-nums">
                    {Number(m.marks_obtained)} / {Number(m.exam_subject_schedule?.max_marks || 100)}
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

export default function ParentMarks() {
  return (
    <Suspense fallback={
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
        ))}
      </div>
    }>
      <ParentMarksContent />
    </Suspense>
  );
}
