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

export default function SubjectsPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const { data: subjects = [] } = useQuery({
    queryKey: queryKeys.school.subjects(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("subjects").select("*").eq("school_id", schoolId).order("name");
      return data || [];
    },
    enabled: !!schoolId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !name || !code) return;
      const { error } = await supabase.from("subjects").insert({ school_id: schoolId, name, code });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.subjects(schoolId || "") });
      toast.success(t("settingsSubjects.subjectCreated"));
      setName(""); setCode("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.school.subjects(schoolId || "") }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("settingsSubjects.title")} description={t("settingsSubjects.description")} />

      <Card>
        <CardHeader><CardTitle>{t("settingsSubjects.addSubject")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("settingsSubjects.subjectName")} required className="flex-1" />
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("settingsSubjects.subjectCode")} required className="w-32" />
            <Button type="submit" disabled={createMutation.isPending}><Plus className="h-4 w-4" /></Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="text-left p-3">{t("settingsSubjects.subjectName")}</th><th className="text-left p-3">{t("settingsSubjects.subjectCode")}</th><th className="text-right p-3">{t("common.actions")}</th></tr></thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 font-mono text-xs">{s.code}</td>
                  <td className="p-3 text-right"><Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
