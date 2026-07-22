"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Shield } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";

interface AuditLog {
  id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export default function AuditLogPage() {
  const schoolId = useSchoolId();

  const { data: logs = [], isLoading: loading, error } = useQuery<AuditLog[], Error>({
    queryKey: ["audit-logs", schoolId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">Failed to load data</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  const columns = [
    { key: "actor_name", header: "Actor" },
    { key: "action", header: "Action" },
    { key: "entity_type", header: "Entity" },
    {
      key: "created_at",
      header: "Time",
      render: (item: AuditLog) =>
        new Date(item.created_at).toLocaleString("en-PK"),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Audit Log" }]} />
      <div className="space-y-6">
      <PageHeader title="Audit Log" description="Track all significant actions across the school" />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />)}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No audit logs yet"
          description="Actions performed by staff will be logged here for accountability."
        />
      ) : (
        <DataTable
          data={logs}
          columns={columns}
          searchKeys={["actor_name", "action", "entity_type"]}
          searchPlaceholder="Search by actor or action..."
        />
      )}
    </div>
    </>
  );
}
