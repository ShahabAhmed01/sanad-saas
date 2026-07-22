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
import { CheckCircle, Megaphone } from "lucide-react";
import { z } from "zod";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId, useUserId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

const announcementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  body: z.string().min(10, "Message must be at least 10 characters"),
});

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const userId = useUserId();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.from("announcements").insert({
        title,
        body,
        audience,
        created_by: userId,
        school_id: schoolId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.announcements(schoolId) });
      toast.success("Announcement published", { description: `"${title}" sent to ${audience === "all" ? "everyone" : audience}` });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setTitle(""); setBody(""); }, 2000);
      router.push("/announcements");
    },
    onError: (error) => {
      toast.error("Failed to create announcement", { description: error.message });
    },
  });

  function handleCreate() {
    const result = announcementSchema.safeParse({ title, body });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setValidationErrors(fieldErrors);
      return;
    }
    setValidationErrors({});
    createAnnouncement.mutate();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Announcements" }, { label: "Create" }]} />
      <div className="space-y-6">
      <PageHeader title="Create Announcement" description="Send an announcement to staff and/or parents" />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">Announcement published!</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">New Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-ink">Title</Label>
            <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); setValidationErrors((p) => ({ ...p, title: "" })); }} placeholder="Annual Day Celebration" className="mt-1.5" />
            {validationErrors.title && <p className="text-xs text-danger mt-1">{validationErrors.title}</p>}
          </div>
          <div>
            <Label htmlFor="message" className="text-ink">Message</Label>
            <Textarea
              id="message"
              value={body}
              onChange={(e) => { setBody(e.target.value); setValidationErrors((p) => ({ ...p, body: "" })); }}
              placeholder="Write your announcement..."
              rows={4}
              className="mt-1.5 flex w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
            />
            {validationErrors.body && <p className="text-xs text-danger mt-1">{validationErrors.body}</p>}
          </div>
          <div>
            <Label htmlFor="audience" className="text-ink">Audience</Label>
            <Select
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              placeholder="Everyone (Staff + Parents)"
              options={[
                { value: "all", label: "Everyone (Staff + Parents)" },
                { value: "staff", label: "Staff Only" },
                { value: "parents", label: "Parents Only" },
              ]}
            />
          </div>
          <Button onClick={handleCreate} disabled={!title || !body} isLoading={createAnnouncement.isPending} className="w-full bg-accent hover:bg-accent/90 text-white">
            <Megaphone className="h-4 w-4 mr-2" />
            Publish Announcement
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
