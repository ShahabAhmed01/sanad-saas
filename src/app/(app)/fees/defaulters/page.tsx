"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/provider";
import { Download, AlertTriangle } from "lucide-react";

type DefaulterRow = {
  id: string;
  period_label: string;
  total_amount: number;
  due_date: string;
  status: string;
  students: { id: string; full_name: string; admission_number: string; sections: { name: string; classes: { name: string }[] }[] }[];
};

function resolveStudent(d: DefaulterRow) {
  const s = Array.isArray(d.students) ? d.students[0] : d.students;
  const section = Array.isArray(s?.sections) ? s.sections[0] : s?.sections;
  const className = Array.isArray(section?.classes) ? section.classes[0]?.name : (section?.classes as unknown as { name?: string })?.name;
  return { ...s, className: className || "", sectionName: section?.name || "" };
}

export default function FeeDefaultersPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const supabase = createClient();

  const { data: defaulters = [], isLoading } = useQuery({
    queryKey: queryKeys.school.feeDefaulters(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase
        .from("fee_invoices")
        .select(`
          id, period_label, total_amount, due_date, status,
          students!inner(id, full_name, admission_number, sections!inner(name, classes!inner(name)))
        `)
        .eq("school_id", schoolId)
        .in("status", ["unpaid", "partially_paid", "overdue"])
        .order("due_date", { ascending: true });
      return (data || []) as DefaulterRow[];
    },
    enabled: !!schoolId,
  });

  function exportCsv() {
    const headers = ["Student", "Admission No", "Class", "Section", "Period", "Amount", "Due Date", "Status"];
    const rows = defaulters.map((d) => {
      const student = resolveStudent(d);
      return [
        student.full_name,
        student.admission_number,
        student.className,
        student.sectionName,
        d.period_label,
        String(d.total_amount),
        d.due_date,
        d.status,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee-defaulters.csv";
    a.click();
  }

  const totalOutstanding = defaulters.reduce((sum, d) => sum + (d.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("feeDefaulters.title")}
        description={t("feeDefaulters.description")}
        action={
          defaulters.length > 0 ? (
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" />
              {t("feeDefaulters.exportCsv")}
            </Button>
          ) : undefined
        }
      />

      {defaulters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">PKR {totalOutstanding.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t("feeDefaulters.totalOutstanding")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{defaulters.length}</p>
              <p className="text-sm text-muted-foreground">{t("feeDefaulters.studentCount")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Card key={i} className="h-16 animate-pulse" />)}
        </div>
      ) : defaulters.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("feeDefaulters.noDefaulters")}
          description={t("feeDefaulters.allFeesPaid")}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3">{t("students.studentName")}</th>
                    <th className="text-left p-3">{t("students.class")}</th>
                    <th className="text-left p-3">{t("fees.feeType")}</th>
                    <th className="text-right p-3">{t("common.amount")}</th>
                    <th className="text-left p-3">{t("fees.dueDate")}</th>
                    <th className="text-left p-3">{t("common.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulters.map((d) => {
                    const student = resolveStudent(d);
                    return (
                      <tr key={d.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                        </td>
                        <td className="p-3">{student.className} - {student.sectionName}</td>
                        <td className="p-3">{d.period_label}</td>
                        <td className="p-3 text-right">PKR {d.total_amount?.toLocaleString()}</td>
                        <td className="p-3">{d.due_date}</td>
                        <td className="p-3">
                          <Badge variant={d.status === "overdue" ? "destructive" : "secondary"}>
                            {d.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
