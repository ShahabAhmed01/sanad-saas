"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";

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
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("leave_requests")
        .select("*, staff!inner(full_name, role)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setRequests((data || []) as any);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDecision(id: string, status: "approved" | "rejected") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("leave_requests")
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Leave Requests" description="Review and approve/reject staff leave requests" />

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-paper-raised rounded-lg animate-skeleton" />)}
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-slate-light">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-slate">No pending leave requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="border-slate-light">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">{(req.staff as any)?.full_name}</p>
                    <p className="text-sm text-slate capitalize">{req.leave_type} Leave</p>
                    <p className="text-xs text-slate mt-1">
                      {new Date(req.starts_on).toLocaleDateString("en-PK")} — {new Date(req.ends_on).toLocaleDateString("en-PK")}
                    </p>
                    {req.reason && <p className="text-xs text-slate mt-1">{req.reason}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleDecision(req.id, "approved")} className="bg-success hover:bg-success/90 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecision(req.id, "rejected")} className="text-danger border-danger hover:bg-danger/10">
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
