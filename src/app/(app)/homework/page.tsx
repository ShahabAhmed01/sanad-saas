"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  section_id: string;
  subject_id: string;
  created_at: string;
}

export default function HomeworkPage() {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomework() {
      const supabase = createClient();
      const { data } = await supabase
        .from("homework")
        .select("*")
        .order("created_at", { ascending: false });

      setHomework(data || []);
      setLoading(false);
    }
    loadHomework();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        description="Manage homework assignments for your classes"
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Assign Homework
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : homework.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No homework assigned"
          description="Create homework assignments for your students."
          action={{ label: "Assign Homework", onClick: () => {} }}
        />
      ) : (
        <div className="space-y-3">
          {homework.map((hw) => (
            <div
              key={hw.id}
              className="bg-paper-raised rounded-xl border border-slate-light p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink">{hw.title}</h3>
                  {hw.description && (
                    <p className="text-sm text-slate mt-1 line-clamp-2">
                      {hw.description}
                    </p>
                  )}
                </div>
                {hw.due_date && (
                  <span className="text-xs text-slate whitespace-nowrap">
                    Due: {new Date(hw.due_date).toLocaleDateString("en-PK")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
