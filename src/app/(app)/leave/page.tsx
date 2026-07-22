"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export default function LeavePage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaves() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("staff_id", user.id)
        .order("created_at", { ascending: false });

      setLeaves(data || []);
      setLoading(false);
    }
    loadLeaves();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Submit and track your leave requests"
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No leave requests"
          description="Submit a leave request when you need time off."
          action={{ label: "Request Leave", onClick: () => router.push("/leave/pending") }}
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
                    {leave.leave_type} Leave
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
  );
}
