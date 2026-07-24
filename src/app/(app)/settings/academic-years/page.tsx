"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";
import { toast } from "sonner";

export default function AcademicYearsPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: years = [] } = useQuery({
    queryKey: queryKeys.school.academicYears(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("academic_years").select("*").eq("school_id", schoolId).order("starts_on", { ascending: false });
      return data || [];
    },
    enabled: !!schoolId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !name || !startDate || !endDate) return;
      const { error } = await supabase.from("academic_years").insert({
        school_id: schoolId,
        name,
        starts_on: startDate,
        ends_on: endDate,
        is_current: years.length === 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.academicYears(schoolId || "") });
      toast.success(t("academicYears.yearCreated"));
      setName(""); setStartDate(""); setEndDate("");
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!schoolId) return;
      await supabase.from("academic_years").update({ is_current: false }).eq("school_id", schoolId);
      const { error } = await supabase.from("academic_years").update({ is_current: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.academicYears(schoolId || "") });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("academicYears.title")} description={t("academicYears.description")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("academicYears.addYear")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="flex gap-4 items-end">
            <div className="space-y-1 flex-1">
              <Label>{t("academicYears.yearName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="2026-2027" required />
            </div>
            <div className="space-y-1">
              <Label>{t("academicYears.startDate")}</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>{t("academicYears.endDate")}</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>{t("common.add")}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">{t("academicYears.yearName")}</th>
                <th className="text-left p-3">{t("common.startDate")}</th>
                <th className="text-left p-3">{t("common.endDate")}</th>
                <th className="text-left p-3">{t("common.status")}</th>
                <th className="text-right p-3">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.id} className="border-b">
                  <td className="p-3 font-medium">{y.name}</td>
                  <td className="p-3">{y.starts_on}</td>
                  <td className="p-3">{y.ends_on}</td>
                  <td className="p-3">
                    {y.is_current ? <Badge>{t("academicYears.isCurrent")}</Badge> : <Badge variant="secondary">{t("common.inactive")}</Badge>}
                  </td>
                  <td className="p-3 text-right">
                    {!y.is_current && (
                      <Button variant="outline" size="sm" onClick={() => setCurrentMutation.mutate(y.id)}>
                        {t("academicYears.setCurrent")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
