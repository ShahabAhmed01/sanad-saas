"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle, Bell, Check, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  link_to: string;
  created_at: string;
}

const typeIcons: Record<string, string> = {
  fee_due: "💰",
  attendance_absent: "📋",
  exam_result: "📝",
  announcement: "📢",
  system: "⚙️",
};

async function fetchNotifications(schoolId: string): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function NotificationsPage() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data: notifications = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.school.notifications(schoolId),
    queryFn: () => fetchNotifications(schoolId),
    enabled: !!schoolId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.school.notifications(schoolId) });

      const previous = queryClient.getQueryData(queryKeys.school.notifications(schoolId));

      queryClient.setQueryData(queryKeys.school.notifications(schoolId), (old: Notification[] | undefined) =>
        (old || []).map(n => n.id === id ? { ...n, is_read: true } : n)
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(queryKeys.school.notifications(schoolId), context?.previous);
      toast.error(t("notifications.count.failedMarkRead"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.notifications(schoolId) });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.school.notifications(schoolId) });

      const previous = queryClient.getQueryData(queryKeys.school.notifications(schoolId));

      queryClient.setQueryData(queryKeys.school.notifications(schoolId), (old: Notification[] | undefined) =>
        (old || []).map(n => ({ ...n, is_read: true }))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.school.notifications(schoolId), context?.previous);
      toast.error(t("notifications.count.failedMarkAll"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.notifications(schoolId) });
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <Breadcrumbs items={[{ label: t("notifications.title") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("notifications.title")}
        description={
          unreadCount > 0 ? (unreadCount === 1 ? t("notifications.count.one", { count: String(unreadCount) }) : t("notifications.count.other", { count: String(unreadCount) })) : t("leave.allCaughtUp")
        }
        action={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={() => markAllAsReadMutation.mutate()}>
              <CheckCheck className="h-4 w-4 mr-2" />
              {t("notifications.markAllRead")}
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
          <p className="text-xs text-slate mt-1">{error.message}</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t("notifications.noNotifications")}
          description={t("notifications.notificationsAppear")}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-colors",
                notification.is_read
                  ? "bg-paper-raised border-slate-light"
                  : "bg-accent/5 border-accent/20"
              )}
            >
              <span className="text-xl mt-0.5">
                {typeIcons[notification.type] || "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", notification.is_read ? "text-slate" : "text-ink")}>
                  {notification.title}
                </p>
                {notification.body && (
                  <p className="text-sm text-slate mt-0.5 line-clamp-2">
                    {notification.body}
                  </p>
                )}
                <p className="text-xs text-slate mt-1">
                  {new Date(notification.created_at).toLocaleString("en-PK")}
                </p>
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => markAsReadMutation.mutate(notification.id)}
                  className="text-slate hover:text-accent hover:bg-muted rounded-lg p-1.5 transition-colors"
                  title={t("notifications.markAllRead")}
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
