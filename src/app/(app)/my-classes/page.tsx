"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClassAssignment {
  id: string;
  section_id: string;
  section_name: string;
  class_name: string;
  subject_name: string;
}

export default function MyClassesPage() {
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get teacher's section-subject assignments
      const { data } = await supabase
        .from("section_subject_teachers")
        .select(`
          id,
          section_id,
          sections!inner (name, class_id, classes!inner (name)),
          subjects!inner (name)
        `)
        .eq("teacher_id", user.id);

      const mapped = (data || []).map((item: { id: string; section_id: string; sections: { name: string; class_id: string; classes: { name: string }[] }[]; subjects: { name: string }[] }) => ({
        id: item.id,
        section_id: item.section_id,
        section_name: item.sections[0]?.name || "",
        class_name: item.sections[0]?.classes[0]?.name || "",
        subject_name: item.subjects[0]?.name || "",
      }));

      setAssignments(mapped);
      setLoading(false);
    }
    loadClasses();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        description="Your assigned classes and subjects"
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-paper-raised rounded-xl animate-skeleton" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No class assignments"
          description="Ask your school admin to assign you to classes and subjects."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <a key={assignment.id} href={`/attendance?section=${assignment.section_id}`}>
              <Card className="border-slate-light hover:border-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base font-display text-ink">
                    {assignment.class_name} — {assignment.section_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate">
                    Subject: {assignment.subject_name}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
