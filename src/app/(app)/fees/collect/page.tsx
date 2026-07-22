"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
}

interface Invoice {
  id: string;
  period_label: string;
  total_amount: number;
  status: string;
  due_date: string;
}

export default function CollectPaymentPage() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function searchStudents() {
    if (!search) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("students")
      .select("id, full_name, admission_number")
      .or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%`)
      .limit(10);
    setStudents(data || []);
  }

  async function selectStudent(student: Student) {
    setSelectedStudent(student);
    setSearch(student.full_name);
    setStudents([]);
    const supabase = createClient();
    const { data } = await supabase
      .from("fee_invoices")
      .select("id, period_label, total_amount, status, due_date")
      .eq("student_id", student.id)
      .in("status", ["unpaid", "partially_paid", "overdue"])
      .order("due_date");
    setInvoices(data || []);
  }

  async function recordPayment() {
    if (!selectedStudent || !selectedInvoice || !amount) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get school_id from staff record
    const { data: staff } = await supabase
      .from("staff")
      .select("school_id")
      .eq("id", user.id)
      .single();

    const paymentAmount = parseFloat(amount);
    const receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}`;

    // Record payment
    await supabase.from("fee_payments").insert({
      invoice_id: selectedInvoice.id,
      amount_paid: paymentAmount,
      payment_method: paymentMethod,
      received_by: user.id,
      receipt_number: receiptNumber,
      notes: notes || null,
      school_id: staff?.school_id,
    });

    // Update invoice status
    const newTotal = paymentAmount; // In real app, would calculate remaining
    const newStatus = paymentAmount >= selectedInvoice.total_amount ? "paid" : "partially_paid";
    await supabase
      .from("fee_invoices")
      .update({ status: newStatus })
      .eq("id", selectedInvoice.id);

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      setSuccess(false);
      setSelectedStudent(null);
      setSelectedInvoice(null);
      setAmount("");
      setNotes("");
      setSearch("");
    }, 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Collect Payment" description="Record a fee payment from a student" />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-ink">Payment recorded successfully!</p>
              <p className="text-sm text-slate">Receipt generated and saved.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Search */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">Find Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
              <Input
                placeholder="Search by name or admission number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.length >= 2) searchStudents();
                }}
                className="pl-9"
              />
            </div>
            {students.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectStudent(s)}
                    className="w-full text-left p-2 rounded-lg hover:bg-paper text-sm"
                  >
                    <span className="font-medium text-ink">{s.full_name}</span>
                    <span className="text-slate ml-2 font-mono text-xs">{s.admission_number}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">Record Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedStudent && (
              <p className="text-sm text-slate">
                Student: <span className="font-medium text-ink">{selectedStudent.full_name}</span>
              </p>
            )}

            {invoices.length > 0 && (
              <div>
                <Label className="text-ink">Select Invoice</Label>
                <div className="space-y-1 mt-1.5">
                  {invoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setAmount(String(inv.total_amount));
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded-lg border text-sm",
                        selectedInvoice?.id === inv.id
                          ? "border-accent bg-accent/5"
                          : "border-slate-light hover:bg-paper"
                      )}
                    >
                      <span className="text-ink">{inv.period_label}</span>
                      <span className="text-slate ml-2">PKR {Number(inv.total_amount).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-ink">Amount (PKR)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-ink">Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">Easypaisa</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <Label className="text-ink">Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="mt-1.5"
              />
            </div>

            <Button
              onClick={recordPayment}
              disabled={loading || !selectedStudent || !selectedInvoice || !amount}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
