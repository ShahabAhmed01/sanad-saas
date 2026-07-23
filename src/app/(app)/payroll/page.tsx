"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Wallet } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

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

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
}

async function fetchStaff(schoolId: string): Promise<StaffMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("staff").select("id, full_name, role").eq("school_id", schoolId).eq("status", "active");
  if (error) throw error;
  return (data || []) as StaffMember[];
}

async function fetchPayroll(schoolId: string): Promise<StaffPayroll[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("payroll").select("*").eq("school_id", schoolId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data || [];
}

export default function PayrollPage() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [period, setPeriod] = useState("");
  const [staffSalaries, setStaffSalaries] = useState<StaffSalary[]>([]);

  const { data: staffList = [], isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: queryKeys.school.staff(schoolId),
    queryFn: () => fetchStaff(schoolId),
    enabled: !!schoolId,
  });

  const { data: payroll = [], isLoading: payrollLoading, error: payrollError } = useQuery({
    queryKey: queryKeys.school.payroll(schoolId),
    queryFn: () => fetchPayroll(schoolId),
    enabled: !!schoolId,
  });

  const loading = staffLoading || payrollLoading;

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && staffList.length > 0) {
      initializedRef.current = true;
      setStaffSalaries(
        staffList.map((s: StaffMember) => ({
          staff_id: s.id,
          full_name: s.full_name,
          role: s.role,
          basic_salary: 0,
          allowances: 0,
          deductions: 0,
        }))
      );
    }
  }, [staffList]);

  const processPayrollMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      for (const s of staffSalaries) {
        const net = s.basic_salary + s.allowances - s.deductions;
        if (net <= 0) continue;

        await supabase.from("payroll").insert({
          school_id: schoolId,
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
    },
    onSuccess: () => {
      toast.success(t("payroll.payrollProcessed"), { description: `Salaries processed for ${staffSalaries.length} staff members` });
      queryClient.invalidateQueries({ queryKey: queryKeys.school.payroll(schoolId) });
    },
    onError: (error) => {
      toast.error(t("common.error"), { description: error.message });
    },
  });

  function updateSalary(staffId: string, field: keyof StaffSalary, value: number) {
    setStaffSalaries((prev) =>
      prev.map((s) => (s.staff_id === staffId ? { ...s, [field]: value } : s))
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t("payroll.title") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("payroll.title")}
        description={t("payroll.processPayroll")}
        action={
          <div className="flex gap-2">
            <Input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder={t("payroll.payPeriod")}
              className="w-40"
            />
            <Button onClick={() => { if (!window.confirm(t("payroll.process.confirmMessage"))) return; processPayrollMutation.mutate(); }} isLoading={processPayrollMutation.isPending} disabled={!period || staffSalaries.length === 0} className="bg-accent hover:bg-accent/90 text-white">
              <Wallet className="h-4 w-4 mr-2" />
              {t("payroll.processPayrollBtn")}
            </Button>
          </div>
        }
      />

      {(staffError || payrollError) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
          <p className="text-xs text-slate mt-1">{(staffError || payrollError)?.message}</p>
        </div>
      )}

      {!staffError && !payrollError && loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-paper-raised rounded-lg animate-skeleton" />)}
        </div>
      ) : staffSalaries.length > 0 ? (
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("payroll.payrollManagement")}</CardTitle>
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
                    <Label htmlFor={`basic-salary-${s.staff_id}`} className="text-xs text-slate">{t("payroll.baseSalary")}</Label>
                    <Input
                      id={`basic-salary-${s.staff_id}`}
                      type="number"
                      value={s.basic_salary || ""}
                      onChange={(e) => updateSalary(s.staff_id, "basic_salary", Number(e.target.value) || 0)}
                      placeholder={t("payroll.process.amountPlaceholder")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`allowances-${s.staff_id}`} className="text-xs text-slate">{t("payroll.bonuses")}</Label>
                    <Input
                      id={`allowances-${s.staff_id}`}
                      type="number"
                      value={s.allowances || ""}
                      onChange={(e) => updateSalary(s.staff_id, "allowances", Number(e.target.value) || 0)}
                      placeholder={t("payroll.process.amountPlaceholder")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`deductions-${s.staff_id}`} className="text-xs text-slate">{t("payroll.deductions")}</Label>
                    <Input
                      id={`deductions-${s.staff_id}`}
                      type="number"
                      value={s.deductions || ""}
                      onChange={(e) => updateSalary(s.staff_id, "deductions", Number(e.target.value) || 0)}
                      placeholder={t("payroll.process.amountPlaceholder")}
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
            <p className="text-slate">{t("payroll.noPayroll")}</p>
          </CardContent>
        </Card>
      )}

      {payroll.length > 0 && (
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("payroll.payrollManagement")}</CardTitle>
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
    </>
  );
}
