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

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  spent_on: string;
}

async function fetchExpenses(schoolId: string): Promise<Expense[]> {
  const supabase = createClient();
  const { data } = await supabase.from("expenses").select("*").eq("school_id", schoolId).order("spent_on", { ascending: false });
  return data || [];
}

export default function ExpensesPage() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
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
      toast.error("Failed to record expense");
    },
    onSuccess: () => {
      toast.success("Expense recorded", { description: `PKR ${parseFloat(amount).toLocaleString()} ${category} expense added` });
      queryClient.invalidateQueries({ queryKey: queryKeys.school.expenses(schoolId) });
      setShowForm(false);
      setAmount("");
      setDescription("");
    },
  });

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const columns = [
    { key: "category", header: "Category", render: (item: Expense) => <span className="capitalize">{item.category}</span> },
    { key: "description", header: "Description" },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (item: Expense) => <span className="tabular-nums font-medium">PKR {Number(item.amount).toLocaleString()}</span>,
    },
    {
      key: "spent_on",
      header: "Date",
      render: (item: Expense) => new Date(item.spent_on).toLocaleDateString("en-PK"),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Expenses" }]} />
      <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and manage school expenses"
        action={
          <Button onClick={() => setShowForm(!showForm)} className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        }
      />

      {expensesError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">Failed to load data</p>
          <p className="text-xs text-slate mt-1">{expensesError.message}</p>
        </div>
      )}

      {/* Total */}
      <Card className="border-slate-light">
        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm text-slate">Total Expenses</span>
          <span className="text-xl font-bold text-ink tabular-nums">PKR {total.toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showForm && (
        <Card className="border-slate-light max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">New Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-ink">Category</Label>
              <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder="Utilities" options={[
                { value: "utilities", label: "Utilities" },
                { value: "maintenance", label: "Maintenance" },
                { value: "salaries", label: "Salaries" },
                { value: "supplies", label: "Supplies" },
                { value: "other", label: "Other" },
              ]} />
            </div>
            <div>
              <Label htmlFor="description" className="text-ink">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Electricity bill" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-ink">Amount (PKR)</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="date" className="text-ink">Date</Label>
                <Input id="date" type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <Button onClick={() => addExpenseMutation.mutate()} disabled={!amount} isLoading={addExpenseMutation.isPending} className="w-full bg-accent hover:bg-accent/90 text-white">
              Add Expense
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
        <DataTable data={expenses} columns={columns} searchKeys={["category", "description"]} searchPlaceholder="Search expenses..." />
      )}
    </div>
    </>
  );
}
