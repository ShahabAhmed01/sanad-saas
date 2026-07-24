"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";
import { Download, BarChart3 } from "lucide-react";

export default function AttendanceReportsPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const supabase = createClient();
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: records = [] } = useQuery({
    queryKey: queryKeys.school.attendanceReports(schoolId || "", `${startDate}-${endDate}`),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase
        .from("student_attendance")
        .select("date, status")
        .eq("school_id", schoolId)
        .gte("date", startDate)
        .lte("date", endDate);
      return data || [];
    },
    enabled: !!schoolId,
  });

  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    leave: records.filter((r) => r.status === "leave").length,
  };

  const dailyBreakdown = records.reduce((acc: Record<string, Record<string, number>>, r) => {
    if (!acc[r.date]) acc[r.date] = { present: 0, absent: 0, late: 0, leave: 0 };
    acc[r.date][r.status as keyof typeof acc[string]]++;
    return acc;
  }, {});

  function exportCsv() {
    const headers = ["Date", "Present", "Absent", "Late", "Leave"];
    const rows = Object.entries(dailyBreakdown).map(([date, counts]) => [
      date, counts.present, counts.absent, counts.late, counts.leave,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-report.csv";
    a.click();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("attendanceReports.title")}
        description={t("attendanceReports.description")}
        action={
          records.length > 0 ? (
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" />
              {t("attendanceReports.exportCsv")}
            </Button>
          ) : undefined
        }
      />

      {/* Date Range Filter */}
      <div className="flex gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("common.startDate")}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("common.endDate")}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.present}</p>
              <p className="text-sm text-muted-foreground">{t("attendanceReports.presentPercentage")}</p>
              <p className="text-xs text-green-600">{summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
              <p className="text-sm text-muted-foreground">{t("attendanceReports.absentPercentage")}</p>
              <p className="text-xs text-red-600">{summary.total > 0 ? ((summary.absent / summary.total) * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
              <p className="text-sm text-muted-foreground">{t("attendanceReports.latePercentage")}</p>
              <p className="text-xs text-yellow-600">{summary.total > 0 ? ((summary.late / summary.total) * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.leave}</p>
              <p className="text-sm text-muted-foreground">{t("attendanceReports.leavePercentage")}</p>
              <p className="text-xs text-blue-600">{summary.total > 0 ? ((summary.leave / summary.total) * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm text-muted-foreground">{t("common.total")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t("attendanceReports.dailyBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(dailyBreakdown).length === 0 ? (
            <EmptyState icon={BarChart3} title={t("common.noData")} description={t("attendanceReports.noData")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t("common.date")}</th>
                    <th className="text-right p-2">{t("common.present")}</th>
                    <th className="text-right p-2">{t("common.absent")}</th>
                    <th className="text-right p-2">{t("common.late")}</th>
                    <th className="text-right p-2">{t("common.leave")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dailyBreakdown).sort().map(([date, counts]) => (
                    <tr key={date} className="border-b hover:bg-muted/50">
                      <td className="p-2">{date}</td>
                      <td className="p-2 text-right text-green-600">{counts.present}</td>
                      <td className="p-2 text-right text-red-600">{counts.absent}</td>
                      <td className="p-2 text-right text-yellow-600">{counts.late}</td>
                      <td className="p-2 text-right text-blue-600">{counts.leave}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
