"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface LeaveRequest {
  id: string;
  leave_type: string;
  starts_on: string;
  ends_on: string;
  reason: string;
  status: string;
  staff: { full_name: string; role: string };
  created_at: string;
}

export default function PendingLeavePage() {
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const { t } = useI18n();

  const { data: requests = [], isLoading: loading, error } = useQuery<LeaveRequest[]>({
    queryKey: [...queryKeys.school.leave(schoolId), "pending"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("leave_requests")
        .select("*, staff!inner(full_name, role)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return (data as LeaveRequest[]) || [];
    },
    enabled: !!schoolId,
  });

  const decisionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("leave_requests")
        .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.status === "approved" ? t("leave.toast_approved") : t("leave.toast_rejected"));
      queryClient.invalidateQueries({ queryKey: [...queryKeys.school.leave(schoolId), "pending"] });
    },
    onError: (_error, variables) => {
      toast.error(variables.status === "approved" ? t("leave.toast_approve_failed") : t("leave.toast_reject_failed"));
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">{t("common.failed_to_load")}</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.leave"), href: "/leave" }, { label: t("leave.pending_title") }]} />
      <div className="space-y-6">
      <PageHeader title={t("leave.pending_title")} description={t("leave.pending_description")} />

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-paper-raised rounded-lg animate-skeleton" />)}
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-slate-light">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-slate">{t("leave.no_pending")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="border-slate-light">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">{req.staff?.full_name}</p>
                    <p className="text-sm text-slate capitalize">{t("leave.typeLeave", { type: req.leave_type })}</p>
                    <p className="text-xs text-slate mt-1">
                      {new Date(req.starts_on).toLocaleDateString("en-PK")} — {new Date(req.ends_on).toLocaleDateString("en-PK")}
                    </p>
                    {req.reason && <p className="text-xs text-slate mt-1">{req.reason}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { if (!window.confirm(t("leave.confirm.approveMessage"))) return; decisionMutation.mutate({ id: req.id, status: "approved" }); }} className="bg-success hover:bg-success/90 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" /> {t("leave.approve")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { if (!window.confirm(t("leave.confirm.rejectMessage"))) return; decisionMutation.mutate({ id: req.id, status: "rejected" }); }} className="text-danger border-danger hover:bg-danger/10">
                      <XCircle className="h-4 w-4 mr-1" /> {t("leave.reject")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
