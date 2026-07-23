"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle, FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useI18n } from "@/i18n/provider";

interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  section_id: string;
  subject_id: string;
  created_at: string;
}

export default function HomeworkPage() {
  const router = useRouter();
  const schoolId = useSchoolId();
  const { t } = useI18n();

  const { data: homework = [], isLoading: loading, error } = useQuery<HomeworkItem[], Error>({
    queryKey: ["homework", schoolId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("homework")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">{t("common.failed_to_load")}</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.homework") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("homework.title")}
        description={t("homework.description")}
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("homework.assign_homework")}
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : homework.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("homework.no_homework")}
          description={t("homework.no_homework_description")}
          action={{ label: t("homework.assign_homework"), onClick: () => router.push("/homework/create") }}
        />
      ) : (
        <div className="space-y-3">
          {homework.map((hw) => (
            <div
              key={hw.id}
              className="bg-paper-raised rounded-xl border border-slate-light p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink">{hw.title}</h3>
                  {hw.description && (
                    <p className="text-sm text-slate mt-1 line-clamp-2">
                      {hw.description}
                    </p>
                  )}
                </div>
                {hw.due_date && (
                  <span className="text-xs text-slate whitespace-nowrap">
                    {t("homework.due")}: {new Date(hw.due_date).toLocaleDateString("en-PK")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
