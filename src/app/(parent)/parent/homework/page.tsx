"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/provider";

interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

async function fetchHomework(childId: string | null): Promise<HomeworkItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let sectionId: string | undefined;

  if (childId) {
    const { data: student } = await supabase
      .from("students")
      .select("section_id")
      .eq("id", childId)
      .single();
    sectionId = student?.section_id;
  } else {
    const { data: guardian } = await supabase
      .from("guardians")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!guardian) return [];

    const { data: sgList } = await supabase
      .from("student_guardians")
      .select("student_id, students!inner (section_id)")
      .eq("guardian_id", guardian.id)
      .limit(1);

    if (!sgList || sgList.length === 0) return [];

    const studentData = Array.isArray(sgList[0].students)
      ? (sgList[0].students as { section_id: string }[])[0]
      : null;
    sectionId = studentData?.section_id;
  }

  if (!sectionId) return [];

  const { data } = await supabase
    .from("homework")
    .select("id, title, description, due_date, created_at")
    .eq("section_id", sectionId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

function ParentHomeworkContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const { data: homework = [], isLoading: loading, error } = useQuery<HomeworkItem[]>({
    queryKey: ["parent-homework", childId],
    queryFn: () => fetchHomework(childId),
    enabled: !!childId,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("parent.homework")} description={t("parent.upcomingHomework")} />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : homework.length === 0 ? (
        <EmptyState icon={FileText} title={t("parent.noHomework")} description={t("common.noData")} />
      ) : (
        <div className="space-y-3">
          {homework.map((hw) => (
            <div key={hw.id} className="bg-paper-raised rounded-xl border border-slate-light p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink">{hw.title}</h3>
                  {hw.description && (
                    <p className="text-sm text-slate mt-1">{hw.description}</p>
                  )}
                </div>
                {hw.due_date && (
                  <span className="text-xs text-slate whitespace-nowrap">
                    Due: {new Date(hw.due_date).toLocaleDateString("en-PK")}
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

export default function ParentHomework() {
  return (
    <Suspense fallback={
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-paper-raised rounded-lg animate-skeleton" />
        ))}
      </div>
    }>
      <ParentHomeworkContent />
    </Suspense>
  );
}
