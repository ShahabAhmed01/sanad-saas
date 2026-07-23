"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ClipboardList } from "lucide-react";
import { z } from "zod";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

const examSchema = z.object({
  name: z.string().min(3, "Exam name must be at least 3 characters"),
});

export default function CreateExamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const createExam = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data: year } = await supabase
        .from("academic_years")
        .select("id")
        .eq("school_id", schoolId)
        .eq("is_current", true)
        .single();

      const { error } = await supabase.from("exams").insert({
        name,
        starts_on: startDate || null,
        ends_on: endDate || null,
        academic_year_id: year?.id,
        status: "scheduled",
        school_id: schoolId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.exams(schoolId) });
      toast.success(t("exams.exam_created"), { description: `"${name}" ${t("exams.has_been_scheduled")}` });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setName(""); setStartDate(""); setEndDate(""); }, 2000);
      router.push("/exams");
    },
    onError: (error) => {
      toast.error(t("exams.failed_to_create"), { description: error.message });
    },
  });

  function handleCreate() {
    const result = examSchema.safeParse({ name });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setValidationErrors(fieldErrors);
      return;
    }
    setValidationErrors({});
    createExam.mutate();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.exams"), href: "/exams" }, { label: t("exams.create_exam") }]} />
      <div className="space-y-6">
      <PageHeader title={t("exams.create_exam")} description={t("exams.schedule_new_exam")} />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">{t("exams.exam_created")}!</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">{t("exams.new_exam")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="exam-name" className="text-ink">{t("exams.exam_name")}</Label>
            <Input id="exam-name" value={name} onChange={(e) => { setName(e.target.value); setValidationErrors((p) => ({ ...p, name: "" })); }} placeholder={t("exams.create.namePlaceholder")} className="mt-1.5" />
            {validationErrors.name && <p className="text-xs text-danger mt-1">{validationErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date" className="text-ink">{t("exams.start_date")}</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-ink">{t("exams.end_date")}</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!name} isLoading={createExam.isPending} className="w-full bg-accent hover:bg-accent/90 text-white">
            <ClipboardList className="h-4 w-4 mr-2" />
            {t("exams.create_exam")}
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
