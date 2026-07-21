"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
}

export default function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: guardian } = await supabase
        .from("guardians")
        .select("id, school_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!guardian) { setLoading(false); return; }

      const { data } = await supabase
        .from("announcements")
        .select("id, title, body, audience, created_at")
        .eq("school_id", guardian.school_id)
        .in("audience", ["all", "parents"])
        .order("created_at", { ascending: false });

      setAnnouncements(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" description="School announcements" />

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState icon={Bell} title="No announcements" description="School announcements will appear here." />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-paper-raised rounded-xl border border-slate-light p-4">
              <h3 className="font-medium text-ink">{ann.title}</h3>
              <p className="text-sm text-slate mt-1">{ann.body}</p>
              <p className="text-xs text-slate mt-2">
                {new Date(ann.created_at).toLocaleString("en-PK")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
