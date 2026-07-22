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

async function fetchSections(schoolId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("sections").select("id, name").eq("classes.school_id", schoolId).order("name");
  return data || [];
}

async function fetchFeeHeads(schoolId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("fee_heads").select("id, name").eq("school_id", schoolId);
  return data || [];
}

export default function GenerateInvoicesPage() {
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
      toast.success("Invoices generated", { description: `${result.count} invoices created totaling PKR ${result.total.toLocaleString()}` });
      queryClient.invalidateQueries({ queryKey: queryKeys.school.fees(schoolId) });
    },
    onError: (error) => {
      toast.error("Failed to generate invoices", { description: error.message });
    },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "Fees", href: "/fees" }, { label: "Generate Invoices" }]} />
      <div className="space-y-6">
      <PageHeader
        title="Generate Invoices"
        description="Create fee invoices for students in a class"
      />

      {(classesError || feeHeadsError) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">Failed to load data</p>
          <p className="text-xs text-slate mt-1">{(classesError || feeHeadsError)?.message}</p>
        </div>
      )}

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="section" className="text-ink">Section</Label>
            <Select
              id="section"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              placeholder="Select section..."
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period" className="text-ink">Period</Label>
              <Input
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. August 2026"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="due-date" className="text-ink">Due Date</Label>
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
              No fee heads configured. Set up fee heads in Settings first.
            </p>
          )}

          <Button
            onClick={() => generateMutation.mutate()}
            isLoading={generateMutation.isPending}
            disabled={!selectedClass || !period || !dueDate || feeHeads.length === 0}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            Generate Invoices
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-ink">
                {result.count} invoices generated
              </p>
              <p className="text-sm text-slate">
                Total amount: PKR {result.total.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
