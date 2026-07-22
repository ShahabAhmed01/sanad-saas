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
  period_label: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
}

interface StaffSalary {
  staff_id: string;
  full_name: string;
  role: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
}

export default function PayrollPage() {
  const [staffSalaries, setStaffSalaries] = useState<StaffSalary[]>([]);
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

      const staffList = staffRes.data || [];
      setStaffSalaries(
        staffList.map((s) => ({
          staff_id: s.id,
          full_name: s.full_name,
          role: s.role,
          basic_salary: 0,
          allowances: 0,
          deductions: 0,
        }))
      );
      setPayroll(payrollRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  function updateSalary(staffId: string, field: keyof StaffSalary, value: number) {
    setStaffSalaries((prev) =>
      prev.map((s) => (s.staff_id === staffId ? { ...s, [field]: value } : s))
    );
  }

  async function processPayroll() {
    if (!period || staffSalaries.length === 0) return;
    setProcessing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    for (const s of staffSalaries) {
      const net = s.basic_salary + s.allowances - s.deductions;
      if (net <= 0) continue;

      await supabase.from("payroll").insert({
        staff_id: s.staff_id,
        period_label: period,
        basic_salary: s.basic_salary,
        allowances: s.allowances,
        deductions: s.deductions,
        net_salary: net,
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
            <Button onClick={processPayroll} disabled={processing || !period || staffSalaries.length === 0} className="bg-accent hover:bg-accent/90 text-white">
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
      ) : staffSalaries.length > 0 ? (
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">Staff Salaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffSalaries.map((s) => (
                <div key={s.staff_id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 rounded-xl bg-paper-raised border border-slate-light">
                  <div>
                    <p className="text-sm font-medium text-ink">{s.full_name}</p>
                    <p className="text-xs text-slate capitalize">{s.role}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate">Basic Salary</Label>
                    <Input
                      type="number"
                      value={s.basic_salary || ""}
                      onChange={(e) => updateSalary(s.staff_id, "basic_salary", Number(e.target.value) || 0)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate">Allowances</Label>
                    <Input
                      type="number"
                      value={s.allowances || ""}
                      onChange={(e) => updateSalary(s.staff_id, "allowances", Number(e.target.value) || 0)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate">Deductions</Label>
                    <Input
                      type="number"
                      value={s.deductions || ""}
                      onChange={(e) => updateSalary(s.staff_id, "deductions", Number(e.target.value) || 0)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-light">
          <CardContent className="py-8 text-center">
            <Wallet className="h-8 w-8 text-slate-light mx-auto mb-2" />
            <p className="text-slate">No active staff found. Add staff members first.</p>
          </CardContent>
        </Card>
      )}

      {payroll.length > 0 && (
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payroll.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-paper-raised border border-slate-light">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
