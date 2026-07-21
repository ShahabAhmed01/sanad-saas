"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

export default function ParentHomework() {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: guardian } = await supabase
        .from("guardians")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!guardian) { setLoading(false); return; }

      const { data: sg } = await supabase
        .from("student_guardians")
        .select("student_id, students!inner (section_id)")
        .eq("guardian_id", guardian.id)
        .limit(1)
        .single();

      if (!sg) { setLoading(false); return; }

      const sectionId = (sg.students as any).section_id;

      const { data } = await supabase
        .from("homework")
        .select("id, title, description, due_date, created_at")
        .eq("section_id", sectionId)
        .order("created_at", { ascending: false })
        .limit(20);

      setHomework(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Homework" description="Your child's assignments" />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : homework.length === 0 ? (
        <EmptyState icon={FileText} title="No homework yet" description="Assignments from teachers will appear here." />
      ) : (
        <div className="space-y-3">
          {homework.map((hw) => (
            <div key={hw.id} className="bg-paper-raised rounded-xl border border-slate-light p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink">{hw.title}</h3>
                  {hw.description && (
                    <p className="text-sm text-slate mt-1">{hw.description}</p>
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
