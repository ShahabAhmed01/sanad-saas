"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  spent_on: string;
}

async function fetchExpenses(schoolId: string): Promise<Expense[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("expenses").select("*").eq("school_id", schoolId).order("spent_on", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function ExpensesPage() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("utilities");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState(new Date().toISOString().split("T")[0]);

  const { data: expenses = [], isLoading: loading, error: expensesError } = useQuery({
    queryKey: queryKeys.school.expenses(schoolId),
    queryFn: () => fetchExpenses(schoolId),
    enabled: !!schoolId,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("expenses").insert({
        school_id: schoolId,
        category,
        description: description || null,
        amount: parseFloat(amount),
        spent_on: spentOn,
        recorded_by: user.id,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.school.expenses(schoolId) });

      const previous = queryClient.getQueryData(queryKeys.school.expenses(schoolId));

      const optimisticItem: Expense = {
        id: crypto.randomUUID(),
        category,
        description: description || "",
        amount: parseFloat(amount),
        spent_on: spentOn,
      };

      queryClient.setQueryData(queryKeys.school.expenses(schoolId), (old: Expense[] | undefined) => [
        optimisticItem,
        ...(old || []),
      ]);

      return { previous };
    },
    onError: (_err, _newItem, context) => {
      queryClient.setQueryData(queryKeys.school.expenses(schoolId), context?.previous);
      toast.error(t("common.error"));
    },
    onSuccess: () => {
      toast.success(t("expenses.expenseAdded"), { description: `PKR ${parseFloat(amount).toLocaleString()} ${category} expense added` });
      queryClient.invalidateQueries({ queryKey: queryKeys.school.expenses(schoolId) });
      setShowForm(false);
      setAmount("");
      setDescription("");
    },
  });

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const columns = [
    { key: "category", header: t("expenses.columns.category"), render: (item: Expense) => <span className="capitalize">{item.category}</span> },
    { key: "description", header: t("expenses.columns.description") },
    {
      key: "amount",
      header: t("expenses.columns.amount"),
      className: "text-right",
      render: (item: Expense) => <span className="tabular-nums font-medium">PKR {Number(item.amount).toLocaleString()}</span>,
    },
    {
      key: "spent_on",
      header: t("expenses.columns.date"),
      render: (item: Expense) => new Date(item.spent_on).toLocaleDateString("en-PK"),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: t("expenses.title") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("expenses.title")}
        description={t("expenses.trackExpenses")}
        action={
          <Button onClick={() => setShowForm(!showForm)} className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("expenses.addExpense")}
          </Button>
        }
      />

      {expensesError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
          <p className="text-xs text-slate mt-1">{expensesError.message}</p>
        </div>
      )}

      {/* Total */}
      <Card className="border-slate-light">
        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm text-slate">{t("expenses.totalExpenses")}</span>
          <span className="text-xl font-bold text-ink tabular-nums">PKR {total.toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showForm && (
        <Card className="border-slate-light max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("expenses.addExpense")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-ink">{t("expenses.expenseCategory")}</Label>
              <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder={t("expenses.form.categoryPlaceholder")} options={[
                { value: "utilities", label: t("expenses.utilities") },
                { value: "maintenance", label: t("expenses.maintenance") },
                { value: "salaries", label: t("expenses.salary") },
                { value: "supplies", label: t("expenses.supplies") },
                { value: "other", label: t("expenses.other") },
              ]} />
            </div>
            <div>
              <Label htmlFor="description" className="text-ink">{t("expenses.expenseDescription")}</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("expenses.form.descriptionPlaceholder")} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-ink">{t("expenses.expenseAmount")}</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="date" className="text-ink">{t("expenses.expenseDate")}</Label>
                <Input id="date" type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <Button onClick={() => addExpenseMutation.mutate()} disabled={!amount} isLoading={addExpenseMutation.isPending} className="w-full bg-accent hover:bg-accent/90 text-white">
              {t("expenses.addExpense")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />)}
        </div>
      ) : (
        <DataTable data={expenses} columns={columns} searchKeys={["category", "description"]} searchPlaceholder={t("common.search")} />
      )}
    </div>
    </>
  );
}
