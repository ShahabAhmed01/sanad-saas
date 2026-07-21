"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Plus, Receipt } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  spent_on: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("utilities");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("expenses").select("*").order("spent_on", { ascending: false });
      setExpenses(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function addExpense() {
    if (!amount || !spentOn) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("expenses").insert({
      category,
      description: description || null,
      amount: parseFloat(amount),
      spent_on: spentOn,
      recorded_by: user.id,
    });

    setSaving(false);
    setShowForm(false);
    setAmount("");
    setDescription("");
    // Reload
    const { data } = await supabase.from("expenses").select("*").order("spent_on", { ascending: false });
    setExpenses(data || []);
  }

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
              <Label className="text-ink">Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="salaries">Salaries</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-ink">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Electricity bill" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-ink">Amount (PKR)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-ink">Date</Label>
                <Input type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <Button onClick={addExpense} disabled={saving || !amount} className="w-full bg-accent hover:bg-accent/90 text-white">
              {saving ? "Saving..." : "Add Expense"}
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
  );
}
