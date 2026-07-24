"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/provider";
import { AlertCircle } from "lucide-react";

interface AbsentStudent {
  status: string;
  remarks: string | null;
  students: {
    id: string;
    full_name: string;
    admission_number: string;
    contact: string | null;
    sections: { name: string; classes: { name: string }[] }[];
  }[];
}

export default function AbsentStudentsPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const supabase = createClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: absentStudents = [], isLoading } = useQuery({
    queryKey: ["absentStudents", schoolId, date],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase
        .from("student_attendance")
        .select(`
          status, remarks,
          students!inner(id, full_name, admission_number, contact, sections!inner(name, classes!inner(name)))
        `)
        .eq("school_id", schoolId)
        .eq("date", date)
        .in("status", ["absent", "late"]);
      return (data || []) as AbsentStudent[];
    },
    enabled: !!schoolId,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("absentStudents.title")}
        description={t("absentStudents.description")}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium">{t("common.date")}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Card key={i} className="h-16 animate-pulse" />)}
        </div>
      ) : absentStudents.length === 0 ? (
        <EmptyState icon={AlertCircle} title={t("absentStudents.noAbsent")} description={t("common.noData")} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3">{t("students.studentName")}</th>
                    <th className="text-left p-3">{t("students.class")}</th>
                    <th className="text-left p-3">{t("common.status")}</th>
                    <th className="text-left p-3">{t("absentStudents.parentContact")}</th>
                  </tr>
                </thead>
                <tbody>
                  {absentStudents.map((s, i) => {
                    const student = Array.isArray(s.students) ? s.students[0] : s.students;
                    const section = student?.sections?.[0];
                    const className = section?.classes?.[0]?.name || "";
                    const sectionName = section?.name || "";
                    return (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <p className="font-medium">{student?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{student?.admission_number}</p>
                        </td>
                        <td className="p-3">{className} - {sectionName}</td>
                        <td className="p-3">
                          <Badge variant={s.status === "absent" ? "destructive" : "secondary"}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="p-3">{student?.contact || "-"}</td>
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
