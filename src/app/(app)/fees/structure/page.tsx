"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface FeeHead {
  id: string;
  name: string;
}

interface FeeStructure {
  id: string;
  class_id: string;
  class_name: string;
  fee_head_id: string;
  fee_head_name: string;
  amount: number;
  frequency: string;
}

async function fetchFeeHeads(schoolId: string): Promise<FeeHead[]> {
  const supabase = createClient();
  const { data } = await supabase.from("fee_heads").select("id, name").eq("school_id", schoolId).order("name");
  return data || [];
}

async function fetchStructures(schoolId: string): Promise<FeeStructure[]> {
  const supabase = createClient();
  const { data } = await supabase.from("fee_structures").select("*, classes!inner(name), fee_heads!inner(name)").eq("school_id", schoolId);
  return (data || []).map((s: Record<string, unknown>) => ({
    ...s,
    class_name: (s.classes as { name: string } | null)?.name || "",
    fee_head_name: (s.fee_heads as { name: string } | null)?.name || "",
  })) as FeeStructure[];
}

async function fetchClasses(schoolId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("classes").select("id, name").eq("school_id", schoolId).order("name");
  return data || [];
}

export default function FeeStructurePage() {
  const [newHeadName, setNewHeadName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedHead, setSelectedHead] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [success, setSuccess] = useState("");
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data: feeHeads = [], error: feeHeadsError } = useQuery({
    queryKey: queryKeys.school.fees(schoolId).concat("heads"),
    queryFn: () => fetchFeeHeads(schoolId),
    enabled: !!schoolId,
  });

  const { data: structures = [], error: structuresError } = useQuery({
    queryKey: queryKeys.school.fees(schoolId).concat("structures"),
    queryFn: () => fetchStructures(schoolId),
    enabled: !!schoolId,
  });

  const { data: classes = [], error: classesError } = useQuery({
    queryKey: queryKeys.school.fees(schoolId).concat("classes"),
    queryFn: () => fetchClasses(schoolId),
    enabled: !!schoolId,
  });

  const addFeeHeadMutation = useMutation({
    mutationFn: async () => {
      if (!newHeadName) throw new Error("Name required");
      const supabase = createClient();
      const { error } = await supabase.from("fee_heads").insert({ name: newHeadName, school_id: schoolId });
      if (error) throw error;
      return newHeadName;
    },
    onSuccess: (name) => {
      toast.success(t("fees.fee_head_added"), { description: `"${name}" ${t("common.created_successfully")}` });
      setSuccess("Fee head added");
      setNewHeadName("");
      setTimeout(() => setSuccess(""), 2000);
      queryClient.invalidateQueries({ queryKey: queryKeys.school.fees(schoolId).concat("heads") });
    },
    onError: (error) => {
      toast.error(t("fees.failed_to_add_fee_head"), { description: error.message });
    },
  });

  const addStructureMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !selectedHead || !amount) throw new Error("All fields required");
      const supabase = createClient();

      const { data: year } = await supabase
        .from("academic_years")
        .select("id")
        .eq("school_id", schoolId)
        .eq("is_current", true)
        .single();

      const { error } = await supabase.from("fee_structures").insert({
        class_id: selectedClass,
        fee_head_id: selectedHead,
        amount: parseFloat(amount),
        frequency,
        academic_year_id: year?.id,
        school_id: schoolId,
      });
      if (error) throw error;
      return { amount, frequency };
    },
    onSuccess: ({ amount, frequency }) => {
      toast.success(t("fees.fee_structure_saved"), { description: `PKR ${parseFloat(amount).toLocaleString()} ${t(`fees.${frequency}`)} ${t("fees.fee_added")}` });
      setSuccess("Fee structure added");
      setSelectedClass("");
      setSelectedHead("");
      setAmount("");
      setTimeout(() => setSuccess(""), 2000);
      queryClient.invalidateQueries({ queryKey: queryKeys.school.fees(schoolId).concat("structures") });
    },
    onError: (error) => {
      toast.error(t("fees.failed_to_add_structure"), { description: error.message });
    },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.fees"), href: "/fees" }, { label: t("fees.fee_structure") }]} />
      <div className="space-y-6">
      <PageHeader title={t("fees.fee_structure")} description={t("fees.fee_structure_description")} />

      {(feeHeadsError || structuresError || classesError) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("common.failed_to_load")}</p>
          <p className="text-xs text-slate mt-1">{(feeHeadsError || structuresError || classesError)?.message}</p>
        </div>
      )}

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">{success}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fee Heads */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("fees.fee_heads")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newHeadName} onChange={(e) => setNewHeadName(e.target.value)} placeholder={t("fees.fee_head_placeholder")} />
              <Button onClick={() => addFeeHeadMutation.mutate()} isLoading={addFeeHeadMutation.isPending} disabled={!newHeadName} className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {feeHeads.map((head) => (
                <div key={head.id} className="flex items-center justify-between p-2 rounded-lg bg-paper">
                  <span className="text-sm text-ink">{head.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Structure */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("fees.add_fee_structure")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="class" className="text-ink">{t("common.class")}</Label>
              <Select id="class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder={t("fees.select_class")} options={classes.map((c) => ({ value: c.id, label: c.name }))} />
            </div>
            <div>
              <Label htmlFor="fee-head" className="text-ink">{t("fees.fee_head")}</Label>
              <Select id="fee-head" value={selectedHead} onChange={(e) => setSelectedHead(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder={t("fees.select_fee_head")} options={feeHeads.map((h) => ({ value: h.id, label: h.name }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-ink">{t("fees.amount_pkr")}</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t("fees.structure.amountPlaceholder")} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="frequency" className="text-ink">{t("fees.frequency")}</Label>
                <Select id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder={t("fees.monthly")} options={[
                  { value: "monthly", label: t("fees.monthly") },
                  { value: "quarterly", label: t("fees.quarterly") },
                  { value: "annual", label: t("fees.annual") },
                  { value: "one_time", label: t("fees.one_time") },
                ]} />
              </div>
            </div>
            <Button onClick={() => addStructureMutation.mutate()} isLoading={addStructureMutation.isPending} disabled={!selectedClass || !selectedHead || !amount} className="w-full bg-accent hover:bg-accent/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t("fees.add_fee_structure")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Structures */}
      {structures.length > 0 && (
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("fees.current_fee_structures")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {structures.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-paper border border-slate-light">
                  <div>
                    <p className="text-sm font-medium text-ink">{s.class_name} — {s.fee_head_name}</p>
                    <p className="text-xs text-slate capitalize">{s.frequency}</p>
                  </div>
                  <span className="text-sm font-bold text-ink tabular-nums">PKR {Number(s.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
