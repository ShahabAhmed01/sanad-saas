"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Section {
  id: string;
  name: string;
}

export default function ClassesPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.school.classes(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("classes").select("*, sections(*)").eq("school_id", schoolId).order("display_order");
      return data || [];
    },
    enabled: !!schoolId,
  });

  const createClassMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !className) return;
      const { error } = await supabase.from("classes").insert({ school_id: schoolId, name: className, display_order: classes.length });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.classes(schoolId || "") });
      toast.success(t("settingsClasses.classCreated"));
      setClassName("");
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !selectedClassId || !sectionName) return;
      const { error } = await supabase.from("sections").insert({ school_id: schoolId, class_id: selectedClassId, name: sectionName });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.classes(schoolId || "") });
      toast.success(t("settingsClasses.sectionCreated"));
      setSectionName("");
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.school.classes(schoolId || "") }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("settingsClasses.title")} description={t("settingsClasses.description")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t("settingsClasses.addClass")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); createClassMutation.mutate(); }} className="flex gap-2">
              <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder={t("settingsClasses.className")} required />
              <Button type="submit" disabled={createClassMutation.isPending}><Plus className="h-4 w-4" /></Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("settingsClasses.addSection")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
              <option value="">{t("students.create.selectClass")}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <form onSubmit={(e) => { e.preventDefault(); createSectionMutation.mutate(); }} className="flex gap-2">
              <Input value={sectionName} onChange={(e) => setSectionName(e.target.value)} placeholder={t("settingsClasses.sectionName")} required disabled={!selectedClassId} />
              <Button type="submit" disabled={!selectedClassId || createSectionMutation.isPending}><Plus className="h-4 w-4" /></Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="text-left p-3">{t("settingsClasses.className")}</th><th className="text-left p-3">{t("settingsClasses.sectionName")}</th><th className="text-right p-3">{t("common.actions")}</th></tr></thead>
            <tbody>
              {classes.map((c) => (
                c.sections?.length > 0 ? c.sections.map((s: Section) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3 text-right"><Button variant="ghost" size="sm" onClick={() => deleteClassMutation.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                  </tr>
                )) : (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3 text-muted-foreground">-</td>
                    <td className="p-3 text-right"><Button variant="ghost" size="sm" onClick={() => deleteClassMutation.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
