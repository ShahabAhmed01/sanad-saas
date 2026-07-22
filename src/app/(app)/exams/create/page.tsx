"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ClipboardList, AlertTriangle } from "lucide-react";
import { z } from "zod";

const examSchema = z.object({
  name: z.string().min(3, "Exam name must be at least 3 characters"),
});

export default function CreateExamPage() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  async function handleCreate() {
    const result = examSchema.safeParse({ name });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setValidationErrors(fieldErrors);
      return;
    }
    setValidationErrors({});
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: staff } = await supabase.from("staff").select("school_id").eq("id", user.id).single();
    if (!staff) return;

    const { data: year } = await supabase
      .from("academic_years")
      .select("id")
      .eq("school_id", staff.school_id)
      .eq("is_current", true)
      .single();

    await supabase.from("exams").insert({
      name,
      starts_on: startDate || null,
      ends_on: endDate || null,
      academic_year_id: year?.id,
      status: "scheduled",
      school_id: staff.school_id,
    });

    setSuccess(true);
    setLoading(false);
    setTimeout(() => { setSuccess(false); setName(""); setStartDate(""); setEndDate(""); }, 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Exam" description="Schedule a new exam" />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">Exam created!</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">New Exam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-ink">Exam Name</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setValidationErrors((p) => ({ ...p, name: "" })); }} placeholder="Mid-Term Examination" className="mt-1.5" />
            {validationErrors.name && <p className="text-xs text-danger mt-1">{validationErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-ink">Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-ink">End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={loading || !name} className="w-full bg-accent hover:bg-accent/90 text-white">
            <ClipboardList className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Exam"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
