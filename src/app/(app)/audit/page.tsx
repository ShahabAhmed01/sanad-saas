"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { Shield } from "lucide-react";

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
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs(data || []);
      setLoading(false);
    }
    load();
  }, []);

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
  );
}
