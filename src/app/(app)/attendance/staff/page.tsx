"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId, useUserId } from "@/hooks/use-user-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";
import { toast } from "sonner";

type AttendanceStatus = "present" | "absent" | "late" | "leave";

export default function StaffAttendancePage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});

  const { data: staff = [] } = useQuery({
    queryKey: ["staff-list", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase
        .from("staff")
        .select("id, full_name, role")
        .eq("school_id", schoolId)
        .eq("status", "active");
      return data || [];
    },
    enabled: !!schoolId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !userId) return;
      const records = Object.entries(statuses).map(([staffId, status]) => ({
        school_id: schoolId,
        staff_id: staffId,
        date,
        status,
        marked_by: userId,
      }));

      const { error } = await supabase
        .from("staff_attendance")
        .upsert(records, { onConflict: "staff_id,date" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.staffAttendance(schoolId || "", date) });
      toast.success(t("staffAttendance.saved"));
    },
  });

  function markAllPresent() {
    const newStatuses: Record<string, AttendanceStatus> = {};
    for (const s of staff) {
      newStatuses[s.id] = "present";
    }
    setStatuses(newStatuses);
  }

  const statusColors: Record<string, string> = {
    present: "bg-green-100 text-green-800 border-green-300",
    absent: "bg-red-100 text-red-800 border-red-300",
    late: "bg-yellow-100 text-yellow-800 border-yellow-300",
    leave: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("staffAttendance.title")}
        description={t("staffAttendance.description")}
        action={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? t("common.loading") : t("common.save")}
          </Button>
        }
      />

      <div className="flex gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("common.date")}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
          />
        </div>
        <Button variant="outline" size="sm" onClick={markAllPresent}>
          {t("staffAttendance.markAllPresent")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">{t("staff.staffName")}</th>
                  <th className="text-left p-3">{t("staff.role")}</th>
                  <th className="text-center p-3">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{s.full_name}</td>
                    <td className="p-3">{s.role}</td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-center">
                        {(["present", "absent", "late", "leave"] as AttendanceStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatuses({ ...statuses, [s.id]: status })}
                            className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                              statuses[s.id] === status
                                ? statusColors[status]
                                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                            }`}
                          >
                            {t(`common.${status}`)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
