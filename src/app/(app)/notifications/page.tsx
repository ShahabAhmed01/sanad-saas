"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, Check, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const supabase = createClient();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      setNotifications(data || []);
      setLoading(false);
    }
    loadNotifications();
  }, []);

  async function markAsRead(id: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function markAllAsRead() {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"
        }
        action={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications for attendance, fees, and announcements will appear here."
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
                  onClick={() => markAsRead(notification.id)}
                  className="text-slate hover:text-accent transition-colors"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
