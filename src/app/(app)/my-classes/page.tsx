"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { useUserId } from "@/hooks/use-user-profile";

interface ClassAssignment {
  id: string;
  section_id: string;
  section_name: string;
  class_name: string;
  subject_name: string;
}

export default function MyClassesPage() {
  const userId = useUserId();

  const { data: assignments = [], isLoading: loading, error } = useQuery<ClassAssignment[]>({
    queryKey: ["user", userId, "classes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("section_subject_teachers")
        .select(`
          id,
          section_id,
          sections!inner (name, class_id, classes!inner (name)),
          subjects!inner (name)
        `)
        .eq("teacher_id", userId);

      return (data || []).map((item: { id: string; section_id: string; sections: { name: string; class_id: string; classes: { name: string }[] }[]; subjects: { name: string }[] }) => ({
        id: item.id,
        section_id: item.section_id,
        section_name: item.sections[0]?.name || "",
        class_name: item.sections[0]?.classes[0]?.name || "",
        subject_name: item.subjects[0]?.name || "",
      }));
    },
    enabled: !!userId,
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "My Classes" }]} />
      <div className="space-y-6">
      <PageHeader
        title="My Classes"
        description="Your assigned classes and subjects"
      />

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">Failed to load data</p>
          <p className="text-xs text-slate mt-1">{error.message}</p>
        </div>
      ) : loading ? (
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
    </>
  );
}
