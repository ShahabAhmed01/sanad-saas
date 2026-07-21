"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Wallet } from "lucide-react";

interface StaffPayroll {
  id: string;
  full_name: string;
  role: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
}

export default function PayrollPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<StaffPayroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [staffRes, payrollRes] = await Promise.all([
        supabase.from("staff").select("id, full_name, role").eq("status", "active"),
        supabase.from("payroll").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setStaff(staffRes.data || []);
      setPayroll(payrollRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function processPayroll() {
    if (!period) return;
    setProcessing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    for (const s of staff) {
      const existing = payroll.find((p) => p.id === `${s.id}-${period}`);
      if (existing) continue;

      await supabase.from("payroll").insert({
        staff_id: s.id,
        period_label: period,
        basic_salary: 0,
        allowances: 0,
        deductions: 0,
        net_salary: 0,
        status: "pending",
        processed_by: user?.id,
      });
    }

    setProcessing(false);
    const { data } = await supabase.from("payroll").select("*").order("created_at", { ascending: false }).limit(50);
    setPayroll(data || []);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Process and manage staff salaries"
        action={
          <div className="flex gap-2">
            <Input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. July 2026"
              className="w-40"
            />
            <Button onClick={processPayroll} disabled={processing || !period} className="bg-accent hover:bg-accent/90 text-white">
              <Wallet className="h-4 w-4 mr-2" />
              {processing ? "Processing..." : "Process Payroll"}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-paper-raised rounded-lg animate-skeleton" />)}
        </div>
      ) : payroll.length === 0 ? (
        <Card className="border-slate-light">
          <CardContent className="py-8 text-center">
            <Wallet className="h-8 w-8 text-slate-light mx-auto mb-2" />
            <p className="text-slate">No payroll records yet. Select a period and process payroll.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {payroll.map((p) => (
            <Card key={p.id} className="border-slate-light">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{p.full_name || "Staff"}</p>
                  <p className="text-xs text-slate capitalize">{p.period_label}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink tabular-nums">PKR {Number(p.net_salary).toLocaleString()}</p>
                  <span className={`text-xs ${p.status === "paid" ? "text-success" : "text-accent"}`}>
                    {p.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
