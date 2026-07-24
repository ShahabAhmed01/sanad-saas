"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";
import { toast } from "sonner";

export default function StudentPromotionPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [sourceClassId, setSourceClassId] = useState("");
  const [sourceSectionId, setSourceSectionId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetSectionId, setTargetSectionId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.school.classes(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("classes").select("id, name").eq("school_id", schoolId).order("display_order");
      return data || [];
    },
    enabled: !!schoolId,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["sections", schoolId, sourceClassId],
    queryFn: async () => {
      if (!schoolId || !sourceClassId) return [];
      const { data } = await supabase.from("sections").select("id, name").eq("school_id", schoolId).eq("class_id", sourceClassId);
      return data || [];
    },
    enabled: !!schoolId && !!sourceClassId,
  });

  const { data: targetSections = [] } = useQuery({
    queryKey: ["sections", schoolId, targetClassId],
    queryFn: async () => {
      if (!schoolId || !targetClassId) return [];
      const { data } = await supabase.from("sections").select("id, name").eq("school_id", schoolId).eq("class_id", targetClassId);
      return data || [];
    },
    enabled: !!schoolId && !!targetClassId,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["promotion-students", schoolId, sourceSectionId],
    queryFn: async () => {
      if (!schoolId || !sourceSectionId) return [];
      const { data } = await supabase.from("students").select("id, full_name, admission_number").eq("school_id", schoolId).eq("section_id", sourceSectionId).eq("status", "active");
      return data || [];
    },
    enabled: !!schoolId && !!sourceSectionId,
  });

  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!targetSectionId || selectedStudents.length === 0) return;
      const { error } = await supabase
        .from("students")
        .update({ section_id: targetSectionId })
        .in("id", selectedStudents);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.students(schoolId || "") });
      toast.success(t("studentPromotion.promoted"));
      setSelectedStudents([]);
    },
  });

  function toggleStudent(id: string) {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedStudents(students.map((s) => s.id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("studentPromotion.title")}
        description={t("studentPromotion.description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source */}
        <Card>
          <CardHeader>
            <CardTitle>{t("studentPromotion.selectCurrentClass")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={sourceClassId}
              onChange={(e) => { setSourceClassId(e.target.value); setSourceSectionId(""); }}
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
            >
              <option value="">{t("students.create.selectClass")}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={sourceSectionId}
              onChange={(e) => setSourceSectionId(e.target.value)}
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              disabled={!sourceClassId}
            >
              <option value="">{t("students.create.selectSection")}</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </CardContent>
        </Card>

        {/* Target */}
        <Card>
          <CardHeader>
            <CardTitle>{t("studentPromotion.selectTargetClass")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={targetClassId}
              onChange={(e) => { setTargetClassId(e.target.value); setTargetSectionId(""); }}
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
            >
              <option value="">{t("students.create.selectClass")}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              disabled={!targetClassId}
            >
              <option value="">{t("students.create.selectSection")}</option>
              {targetSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      {students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("studentPromotion.selectStudents")} ({selectedStudents.length}/{students.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>{t("common.all")}</Button>
              <Button
                size="sm"
                onClick={() => {
                  if (confirm(t("studentPromotion.confirmPromotion"))) {
                    promoteMutation.mutate();
                  }
                }}
                disabled={!targetSectionId || selectedStudents.length === 0 || promoteMutation.isPending}
              >
                {t("studentPromotion.promote")} ({selectedStudents.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => toggleStudent(s.id)}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="mr-3"
                        />
                      </td>
                      <td className="p-3 font-medium">{s.full_name}</td>
                      <td className="p-3 text-muted-foreground">{s.admission_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
