"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useI18n } from "@/i18n/provider";
import { Download } from "lucide-react";

export default function DataExportPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const supabase = createClient();

  async function exportData(table: string, filename: string) {
    if (!schoolId) return;
    const { data } = await supabase.from(table).select("*").eq("school_id", schoolId);
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => String(row[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  const exports = [
    { table: "students", filename: "students.csv", label: t("dataExport.exportStudents") },
    { table: "fee_invoices", filename: "fees.csv", label: t("dataExport.exportFees") },
    { table: "student_attendance", filename: "attendance.csv", label: t("dataExport.exportAttendance") },
    { table: "audit_logs", filename: "audit.csv", label: t("dataExport.exportAudit") },
    { table: "marks", filename: "marks.csv", label: t("dataExport.exportMarks") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("dataExport.title")} description={t("dataExport.description")} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exports.map((exp) => (
          <Card key={exp.table}>
            <CardHeader>
              <CardTitle className="text-lg">{exp.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => exportData(exp.table, exp.filename)}>
                <Download className="mr-2 h-4 w-4" />
                {exp.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
