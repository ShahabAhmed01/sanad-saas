"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, FileText } from "lucide-react";

export default function CreateHomeworkPage() {
  const [sections, setSections] = useState<{ id: string; name: string; class_name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [secRes, subRes] = await Promise.all([
        supabase.from("sections").select("id, name, classes!inner(name)").order("name"),
        supabase.from("subjects").select("id, name").order("name"),
      ]);
      setSections((secRes.data || []).map((s: any) => ({ id: s.id, name: s.name, class_name: s.classes?.name || "" })));
      setSubjects(subRes.data || []);
    }
    load();
  }, []);

  async function handleCreate() {
    if (!sectionId || !subjectId || !title) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("homework").insert({
      section_id: sectionId,
      subject_id: subjectId,
      title,
      description: description || null,
      due_date: dueDate || null,
      created_by: user.id,
    });

    setSuccess(true);
    setLoading(false);
    setTimeout(() => { setSuccess(false); setTitle(""); setDescription(""); setDueDate(""); }, 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Homework" description="Assign homework to a class section" />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">Homework assigned!</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">New Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-ink">Section</Label>
            <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
              <option value="">Select section...</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.class_name} — {s.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-ink">Subject</Label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
              <option value="">Select subject...</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-ink">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter 5 Exercises" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-ink">Description</Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details..." rows={3} className="mt-1.5 flex w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" />
          </div>
          <div>
            <Label className="text-ink">Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1.5" />
          </div>
          <Button onClick={handleCreate} disabled={loading || !sectionId || !subjectId || !title} className="w-full bg-accent hover:bg-accent/90 text-white">
            <FileText className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Assign Homework"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
