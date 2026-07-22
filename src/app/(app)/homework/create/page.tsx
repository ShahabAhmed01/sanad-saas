"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, FileText } from "lucide-react";
import { z } from "zod";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId, useUserId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

const homeworkSchema = z.object({
  sectionId: z.string().min(1, "Please select a section"),
  subjectId: z.string().min(1, "Please select a subject"),
  title: z.string().min(1, "Title is required"),
});

export default function CreateHomeworkPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const userId = useUserId();
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data: sections = [] } = useQuery<{ id: string; name: string; class_name: string }[]>({
    queryKey: ["sections", schoolId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("sections")
        .select("id, name, classes!inner(name)")
        .order("name");
      return (data || []).map((s: { id: string; name: string; classes: { name: string }[] }) => ({
        id: s.id,
        name: s.name,
        class_name: s.classes[0]?.name || "",
      }));
    },
    enabled: !!schoolId,
  });

  const { data: subjects = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["subjects", schoolId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("subjects")
        .select("id, name")
        .order("name");
      return data || [];
    },
    enabled: !!schoolId,
  });

  const createHomework = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.from("homework").insert({
        section_id: sectionId,
        subject_id: subjectId,
        title,
        description: description || null,
        due_date: dueDate || null,
        created_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.homework(schoolId) });
      toast.success("Homework assigned", { description: `"${title}" assigned successfully` });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setTitle(""); setDescription(""); setDueDate(""); }, 2000);
      router.push("/homework");
    },
    onError: (error) => {
      toast.error("Failed to create homework", { description: error.message });
    },
  });

  function handleCreate() {
    const result = homeworkSchema.safeParse({ sectionId, subjectId, title });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setValidationErrors(fieldErrors);
      return;
    }
    setValidationErrors({});
    createHomework.mutate();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Homework", href: "/homework" }, { label: "Create Homework" }]} />
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
            <Label htmlFor="section" className="text-ink">Section</Label>
            <Select id="section" value={sectionId} onChange={(e) => { setSectionId(e.target.value); setValidationErrors((p) => ({ ...p, sectionId: "" })); }} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder="Select section..." options={sections.map((s) => ({ value: s.id, label: `${s.class_name} — ${s.name}` }))} />
            {validationErrors.sectionId && <p className="text-xs text-danger mt-1">{validationErrors.sectionId}</p>}
          </div>
          <div>
            <Label htmlFor="subject" className="text-ink">Subject</Label>
            <Select id="subject" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setValidationErrors((p) => ({ ...p, subjectId: "" })); }} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder="Select subject..." options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
            {validationErrors.subjectId && <p className="text-xs text-danger mt-1">{validationErrors.subjectId}</p>}
          </div>
          <div>
            <Label htmlFor="title" className="text-ink">Title</Label>
            <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); setValidationErrors((p) => ({ ...p, title: "" })); }} placeholder="Chapter 5 Exercises" className="mt-1.5" />
            {validationErrors.title && <p className="text-xs text-danger mt-1">{validationErrors.title}</p>}
          </div>
          <div>
            <Label htmlFor="description" className="text-ink">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details..." rows={3} className="mt-1.5 flex w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" />
          </div>
          <div>
            <Label htmlFor="due-date" className="text-ink">Due Date</Label>
            <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1.5" />
          </div>
          <Button onClick={handleCreate} isLoading={createHomework.isPending} disabled={!sectionId || !subjectId || !title} className="w-full bg-accent hover:bg-accent/90 text-white">
            <FileText className="h-4 w-4 mr-2" />
            Assign Homework
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
