"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Plus, Trash2 } from "lucide-react";

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

export default function FeeStructurePage() {
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [newHeadName, setNewHeadName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedHead, setSelectedHead] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [headsRes, structsRes, classesRes] = await Promise.all([
        supabase.from("fee_heads").select("id, name").order("name"),
        supabase.from("fee_structures").select("*, classes!inner(name), fee_heads!inner(name)"),
        supabase.from("classes").select("id, name").order("name"),
      ]);
      setFeeHeads(headsRes.data || []);
      setStructures((structsRes.data || []).map((s: Record<string, unknown>) => ({
        ...s,
        class_name: (s.classes as { name: string } | null)?.name || "",
        fee_head_name: (s.fee_heads as { name: string } | null)?.name || "",
      })) as FeeStructure[]);
      setClasses(classesRes.data || []);
    }
    load();
  }, []);

  async function addFeeHead() {
    if (!newHeadName) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: staff } = await supabase.from("staff").select("school_id").eq("id", user?.id).single();
    if (!staff) return;

    await supabase.from("fee_heads").insert({ name: newHeadName, school_id: staff.school_id });
    setSuccess("Fee head added");
    setNewHeadName("");
    setLoading(false);
    setTimeout(() => setSuccess(""), 2000);
  }

  async function addStructure() {
    if (!selectedClass || !selectedHead || !amount) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: staff } = await supabase.from("staff").select("school_id").eq("id", user?.id).single();
    if (!staff) return;

    const { data: year } = await supabase
      .from("academic_years")
      .select("id")
      .eq("school_id", staff.school_id)
      .eq("is_current", true)
      .single();

    await supabase.from("fee_structures").insert({
      class_id: selectedClass,
      fee_head_id: selectedHead,
      amount: parseFloat(amount),
      frequency,
      academic_year_id: year?.id,
      school_id: staff.school_id,
    });

    setSuccess("Fee structure added");
    setSelectedClass("");
    setSelectedHead("");
    setAmount("");
    setLoading(false);
    setTimeout(() => setSuccess(""), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Fee Structure" description="Configure fee heads and fee structures per class" />

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
            <CardTitle className="text-lg font-display">Fee Heads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newHeadName} onChange={(e) => setNewHeadName(e.target.value)} placeholder="e.g. Tuition Fee" />
              <Button onClick={addFeeHead} disabled={loading || !newHeadName} className="bg-accent hover:bg-accent/90 text-white">
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
            <CardTitle className="text-lg font-display">Add Fee Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-ink">Class</Label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
                <option value="">Select class...</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-ink">Fee Head</Label>
              <select value={selectedHead} onChange={(e) => setSelectedHead(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
                <option value="">Select fee head...</option>
                {feeHeads.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-ink">Amount (PKR)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-ink">Frequency</Label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="one_time">One Time</option>
                </select>
              </div>
            </div>
            <Button onClick={addStructure} disabled={loading || !selectedClass || !selectedHead || !amount} className="w-full bg-accent hover:bg-accent/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Adding..." : "Add Fee Structure"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Structures */}
      {structures.length > 0 && (
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">Current Fee Structures</CardTitle>
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
  );
}
