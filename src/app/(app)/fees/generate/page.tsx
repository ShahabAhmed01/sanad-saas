"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

async function fetchSections(schoolId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("sections").select("id, name").eq("classes.school_id", schoolId).order("name");
  if (error) throw error;
  return data || [];
}

async function fetchFeeHeads(schoolId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("fee_heads").select("id, name").eq("school_id", schoolId);
  if (error) throw error;
  return data || [];
}

export default function GenerateInvoicesPage() {
  const { t } = useI18n();
  const [selectedClass, setSelectedClass] = useState("");
  const [period, setPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [result, setResult] = useState<{ count: number; total: number } | null>(null);
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();

  const { data: classes = [], error: classesError } = useQuery({
    queryKey: queryKeys.school.fees(schoolId).concat("sections"),
    queryFn: () => fetchSections(schoolId),
    enabled: !!schoolId,
  });

  const { data: feeHeads = [], error: feeHeadsError } = useQuery({
    queryKey: queryKeys.school.fees(schoolId).concat("heads"),
    queryFn: () => fetchFeeHeads(schoolId),
    enabled: !!schoolId,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !period || !dueDate) throw new Error("All fields required");
      const supabase = createClient();

      const { data: students } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("section_id", selectedClass)
        .eq("status", "active");

      const { data: section } = await supabase
        .from("sections")
        .select("class_id")
        .eq("id", selectedClass)
        .single();

      if (!section) throw new Error("Section not found");

      const { data: structures } = await supabase
        .from("fee_structures")
        .select("id, fee_head_id, amount, class_id")
        .eq("class_id", section.class_id);

      if (!students || !structures || students.length === 0) throw new Error("No students or structures found");

      let totalInvoices = 0;
      let totalAmount = 0;

      for (const student of students) {
        const totalAmountForStudent = structures.reduce(
          (sum, s) => sum + Number(s.amount),
          0
        );

        if (totalAmountForStudent === 0) continue;

        const { data: invoice, error } = await supabase
          .from("fee_invoices")
          .insert({
            student_id: student.id,
            period_label: period,
            due_date: dueDate,
            total_amount: totalAmountForStudent,
            status: "unpaid",
          })
          .select()
          .single();

        if (error || !invoice) continue;

        const items = structures.map((s) => ({
          invoice_id: invoice.id,
          fee_head_id: s.fee_head_id,
          amount: s.amount,
        }));

        await supabase.from("fee_invoice_items").insert(items);

        totalInvoices++;
        totalAmount += totalAmountForStudent;
      }

      return { count: totalInvoices, total: totalAmount };
    },
    onSuccess: (result) => {
      setResult(result);
      toast.success(t("fees.generate.invoicesGenerated", { count: String(result.count) }), { description: t("fees.generate.totalAmount", { amount: result.total.toLocaleString() }) });
      queryClient.invalidateQueries({ queryKey: queryKeys.school.fees(schoolId) });
    },
    onError: (error) => {
      toast.error(t("fees.generate.failedToGenerate"), { description: error.message });
    },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: t("fees.title"), href: "/fees" }, { label: t("fees.generate.title") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("fees.generate.title")}
        description={t("fees.generate.description")}
      />

      {(classesError || feeHeadsError) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
          <p className="text-xs text-slate mt-1">{(classesError || feeHeadsError)?.message}</p>
        </div>
      )}

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">{t("fees.generate.invoiceDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="section" className="text-ink">{t("fees.generate.section")}</Label>
            <Select
              id="section"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              placeholder={t("fees.generate.selectSection")}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period" className="text-ink">{t("fees.generate.period")}</Label>
              <Input
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder={t("fees.generate.periodExample")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="due-date" className="text-ink">{t("fees.generate.dueDate")}</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          {feeHeads.length === 0 && (
            <p className="text-xs text-danger">
              {t("fees.generate.noFeeHeads")}
            </p>
          )}

          <Button
            onClick={() => { if (!window.confirm(t("fees.generate.confirmMessage"))) return; generateMutation.mutate(); }}
            isLoading={generateMutation.isPending}
            disabled={!selectedClass || !period || !dueDate || feeHeads.length === 0}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            {t("fees.generate.generateBtn")}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-ink">
                {t("fees.generate.invoicesGenerated", { count: String(result.count) })}
              </p>
              <p className="text-sm text-slate">
                {t("fees.generate.totalAmount", { amount: result.total.toLocaleString() })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
