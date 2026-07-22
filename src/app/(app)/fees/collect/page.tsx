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
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

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

async function searchStudents(search: string): Promise<Student[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("students")
    .select("id, full_name, admission_number")
    .or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%`)
    .limit(10);
  return data || [];
}

async function fetchUnpaidInvoices(studentId: string): Promise<Invoice[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("fee_invoices")
    .select("id, period_label, total_amount, status, due_date")
    .eq("student_id", studentId)
    .in("status", ["unpaid", "partially_paid", "overdue"])
    .order("due_date");
  return data || [];
}

export default function CollectPaymentPage() {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();

  const { data: students = [], error: studentsError } = useQuery({
    queryKey: queryKeys.school.students(schoolId).concat("search", search),
    queryFn: () => searchStudents(search),
    enabled: search.length >= 2,
  });

  const { data: invoices = [], error: invoicesError } = useQuery({
    queryKey: queryKeys.school.fees(schoolId).concat("invoices", selectedStudent?.id || ""),
    queryFn: () => fetchUnpaidInvoices(selectedStudent!.id),
    enabled: !!selectedStudent,
  });

  function selectStudent(student: Student) {
    setSelectedStudent(student);
    setSearch(student.full_name);
  }

  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent || !selectedInvoice || !amount) throw new Error("Missing required fields");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const paymentAmount = parseFloat(amount);
      const receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}`;

      const { error: paymentError } = await supabase.from("fee_payments").insert({
        invoice_id: selectedInvoice.id,
        amount_paid: paymentAmount,
        payment_method: paymentMethod,
        received_by: user.id,
        receipt_number: receiptNumber,
        notes: notes || null,
        school_id: schoolId,
      });

      if (paymentError) throw paymentError;

      const newStatus = paymentAmount >= selectedInvoice.total_amount ? "paid" : "partially_paid";
      await supabase
        .from("fee_invoices")
        .update({ status: newStatus })
        .eq("id", selectedInvoice.id);

      return receiptNumber;
    },
    onSuccess: (receiptNumber) => {
      toast.success("Payment recorded", { description: `Receipt ${receiptNumber} generated` });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedStudent(null);
        setSelectedInvoice(null);
        setAmount("");
        setNotes("");
        setSearch("");
      }, 2000);
      queryClient.invalidateQueries({ queryKey: queryKeys.school.fees(schoolId) });
    },
    onError: (error: Error) => {
      toast.error("Payment failed", { description: error.message || "Please try again" });
    },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "Fees", href: "/fees" }, { label: "Collect Payment" }]} />
      <div className="space-y-6">
      <PageHeader title="Collect Payment" description="Record a fee payment from a student" />

      {(studentsError || invoicesError) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">Failed to load data</p>
          <p className="text-xs text-slate mt-1">{(studentsError || invoicesError)?.message}</p>
        </div>
      )}

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
                onChange={(e) => setSearch(e.target.value)}
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
              <Label htmlFor="amount" className="text-ink">Amount (PKR)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="payment-method" className="text-ink">Payment Method</Label>
              <Select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
                placeholder="Cash"
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "jazzcash", label: "JazzCash" },
                  { value: "easypaisa", label: "Easypaisa" },
                  { value: "card", label: "Card" },
                  { value: "cheque", label: "Cheque" },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-ink">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="mt-1.5"
              />
            </div>

            <Button
              onClick={() => recordPaymentMutation.mutate()}
              disabled={!selectedStudent || !selectedInvoice || !amount}
              isLoading={recordPaymentMutation.isPending}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              Record Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
