"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle, CalendarCheck, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useUserId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface LeaveRequest {
  id: string;
  leave_type: string;
  starts_on: string;
  ends_on: string;
  reason: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  approved: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};

async function fetchLeaves(userId: string): Promise<LeaveRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("staff_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function LeavePage() {
  const router = useRouter();
  const userId = useUserId();
  const { t } = useI18n();

  const { data: leaves = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.user.leaves(userId),
    queryFn: () => fetchLeaves(userId),
    enabled: !!userId,
  });

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.leave") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("leave.title")}
        description={t("leave.description")}
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("leave.request_leave")}
          </Button>
        }
      />

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("common.failed_to_load")}</p>
          <p className="text-xs text-slate mt-1">{error.message}</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={t("leave.no_requests")}
          description={t("leave.no_requests_description")}
          action={{ label: t("leave.request_leave"), onClick: () => router.push("/leave/pending") }}
        />
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-paper-raised rounded-xl border border-slate-light p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink capitalize">
                    {t("leave.typeLeave", { type: leave.leave_type })}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      statusColors[leave.status] || "bg-slate/10 text-slate"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
                <p className="text-sm text-slate mt-1">
                  {new Date(leave.starts_on).toLocaleDateString("en-PK")} —{" "}
                  {new Date(leave.ends_on).toLocaleDateString("en-PK")}
                </p>
                {leave.reason && (
                  <p className="text-xs text-slate mt-1">{leave.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
