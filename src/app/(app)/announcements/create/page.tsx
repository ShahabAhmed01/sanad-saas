"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Megaphone, AlertTriangle } from "lucide-react";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  body: z.string().min(10, "Message must be at least 10 characters"),
});

export default function CreateAnnouncementPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  async function handleCreate() {
    const result = announcementSchema.safeParse({ title, body });
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

    await supabase.from("announcements").insert({
      title,
      body,
      audience,
      created_by: user.id,
      school_id: staff.school_id,
    });

    setSuccess(true);
    setLoading(false);
    setTimeout(() => { setSuccess(false); setTitle(""); setBody(""); }, 2000);
  }

  return (
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
            <Label className="text-ink">Title</Label>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); setValidationErrors((p) => ({ ...p, title: "" })); }} placeholder="Annual Day Celebration" className="mt-1.5" />
            {validationErrors.title && <p className="text-xs text-danger mt-1">{validationErrors.title}</p>}
          </div>
          <div>
            <Label className="text-ink">Message</Label>
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setValidationErrors((p) => ({ ...p, body: "" })); }}
              placeholder="Write your announcement..."
              rows={4}
              className="mt-1.5 flex w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
            />
            {validationErrors.body && <p className="text-xs text-danger mt-1">{validationErrors.body}</p>}
          </div>
          <div>
            <Label className="text-ink">Audience</Label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
            >
              <option value="all">Everyone (Staff + Parents)</option>
              <option value="staff">Staff Only</option>
              <option value="parents">Parents Only</option>
            </select>
          </div>
          <Button onClick={handleCreate} disabled={loading || !title || !body} className="w-full bg-accent hover:bg-accent/90 text-white">
            <Megaphone className="h-4 w-4 mr-2" />
            {loading ? "Publishing..." : "Publish Announcement"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
