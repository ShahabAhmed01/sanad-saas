"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, FileText } from "lucide-react";

export default function GenerateInvoicesPage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [feeHeads, setFeeHeads] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [period, setPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; total: number } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [classesRes, headsRes] = await Promise.all([
        supabase.from("classes").select("id, name").order("name"),
        supabase.from("fee_heads").select("id, name"),
      ]);
      setClasses(classesRes.data || []);
      setFeeHeads(headsRes.data || []);
    }
    load();
  }, []);

  async function generateInvoices() {
    if (!selectedClass || !period || !dueDate) return;
    setLoading(true);
    const supabase = createClient();

    // Get active students in the class
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("section_id", selectedClass)
      .eq("status", "active");

    // Get fee structures for this class
    const { data: structures } = await supabase
      .from("fee_structures")
      .select("id, fee_head_id, amount, class_id")
      .eq("class_id", selectedClass);

    if (!students || !structures || students.length === 0) {
      setLoading(false);
      return;
    }

    let totalInvoices = 0;
    let totalAmount = 0;

    for (const student of students) {
      const totalAmountForStudent = structures.reduce(
        (sum, s) => sum + Number(s.amount),
        0
      );

      if (totalAmountForStudent === 0) continue;

      // Create invoice
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

      // Create invoice items
      const items = structures.map((s) => ({
        invoice_id: invoice.id,
        fee_head_id: s.fee_head_id,
        amount: s.amount,
      }));

      await supabase.from("fee_invoice_items").insert(items);

      totalInvoices++;
      totalAmount += totalAmountForStudent;
    }

    setResult({ count: totalInvoices, total: totalAmount });
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Invoices"
        description="Create fee invoices for students in a class"
      />

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-ink">Class / Section</Label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
            >
              <option value="">Select section...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-ink">Period</Label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. August 2026"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-ink">Due Date</Label>
              <Input
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
            onClick={generateInvoices}
            disabled={loading || !selectedClass || !period || !dueDate || feeHeads.length === 0}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            {loading ? "Generating..." : "Generate Invoices"}
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
  );
}
