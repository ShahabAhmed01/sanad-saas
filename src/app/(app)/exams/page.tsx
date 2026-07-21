"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Exam {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-accent/10 text-accent",
  in_progress: "bg-success/10 text-success",
  results_pending: "bg-slate/10 text-slate",
  published: "bg-success/10 text-success",
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      const supabase = createClient();
      const { data } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });

      setExams(data || []);
      setLoading(false);
    }
    loadExams();
  }, []);

  const columns = [
    { key: "name", header: "Exam Name" },
    {
      key: "starts_on",
      header: "Start Date",
      render: (item: Exam) =>
        item.starts_on
          ? new Date(item.starts_on).toLocaleDateString("en-PK")
          : "—",
    },
    {
      key: "ends_on",
      header: "End Date",
      render: (item: Exam) =>
        item.ends_on
          ? new Date(item.ends_on).toLocaleDateString("en-PK")
          : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (item: Exam) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[item.status] || "bg-slate/10 text-slate"
          }`}
        >
          {item.status.replace("_", " ")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams & Results"
        description="Schedule exams, manage marks, and generate report cards"
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No exams scheduled"
          description="Create your first exam to start tracking student performance."
          action={{ label: "Create Exam", onClick: () => {} }}
        />
      ) : (
        <DataTable
          data={exams}
          columns={columns}
          searchKeys={["name", "status"]}
          searchPlaceholder="Search by exam name..."
        />
      )}
    </div>
  );
}
