"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface Exam {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-accent/10 text-accent",
  in_progress: "bg-success/10 text-success",
  results_pending: "bg-slate/10 text-slate",
  published: "bg-success/10 text-success",
};

async function fetchExams(schoolId: string): Promise<Exam[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to load exams");
  return data || [];
}

export default function ExamsPage() {
  const router = useRouter();
  const schoolId = useSchoolId();
  const { t } = useI18n();

  const { data: exams = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKeys.school.exams(schoolId),
    queryFn: () => fetchExams(schoolId),
    enabled: !!schoolId,
  });

  const error = queryError ? queryError.message : null;

  const columns = [
    { key: "name", header: t("exams.exam_name") },
    {
      key: "starts_on",
      header: t("exams.start_date"),
      render: (item: Exam) =>
        item.starts_on
          ? new Date(item.starts_on).toLocaleDateString("en-PK")
          : "—",
    },
    {
      key: "ends_on",
      header: t("exams.end_date"),
      render: (item: Exam) =>
        item.ends_on
          ? new Date(item.ends_on).toLocaleDateString("en-PK")
          : "—",
    },
    {
      key: "status",
      header: t("common.status"),
      render: (item: Exam) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[item.status] || "bg-slate/10 text-slate"
          }`}
        >
          {t(`exams.${item.status}`)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.exams") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("exams.title")}
        description={t("exams.description")}
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("exams.create_exam")}
          </Button>
        }
      />

      {error ? (
        <Card className="border-danger bg-danger/5">
          <CardContent className="p-4">
            <p className="text-danger font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t("exams.no_exams")}
          description={t("exams.no_exams_description")}
          action={{ label: t("exams.create_exam"), onClick: () => router.push("/exams/create") }}
        />
      ) : (
        <DataTable
          data={exams}
          columns={columns}
          searchKeys={["name", "status"]}
          searchPlaceholder={t("exams.search_placeholder")}
        />
      )}
    </div>
    </>
  );
}
