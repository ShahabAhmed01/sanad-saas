"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Clock, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
}

interface Section {
  id: string;
  name: string;
  class_name: string;
}

type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "leave";

const statusConfig: Record<AttendanceStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  present: { icon: Check, color: "text-success", bg: "bg-success/10 border-success", label: "Present" },
  absent: { icon: X, color: "text-danger", bg: "bg-danger/10 border-danger", label: "Absent" },
  late: { icon: Clock, color: "text-accent", bg: "bg-accent/10 border-accent", label: "Late" },
  half_day: { icon: Clock, color: "text-accent", bg: "bg-accent/10 border-accent", label: "Half Day" },
  leave: { icon: Clock, color: "text-slate", bg: "bg-slate/10 border-slate", label: "Leave" },
};

export default function MarkAttendancePage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadSections() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: staff } = await supabase
        .from("staff")
        .select("school_id")
        .eq("id", user.id)
        .single();
      if (!staff) return;

      const { data } = await supabase
        .from("sections")
        .select("id, name, classes!inner(name)")
        .eq("classes.school_id", staff.school_id)
        .order("name");
      setSections((data || []).map((s: { id: string; name: string; classes: { name: string }[] }) => ({
        id: s.id,
        name: s.name,
        class_name: s.classes[0]?.name || "",
      })));
    }
    loadSections();
  }, []);

  useEffect(() => {
    if (!selectedSection) return;
    async function loadStudents() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("students")
        .select("id, full_name, admission_number")
        .eq("section_id", selectedSection)
        .eq("status", "active")
        .order("full_name");

      // Check existing attendance for today
      const { data: existing } = await supabase
        .from("student_attendance")
        .select("student_id, status")
        .eq("section_id", selectedSection)
        .eq("date", today);

      const existingMap: Record<string, AttendanceStatus> = {};
      (existing || []).forEach((e) => {
        existingMap[e.student_id] = e.status as AttendanceStatus;
      });

      // Default all to present, override with existing
      const defaultAttendance: Record<string, AttendanceStatus> = {};
      (data || []).forEach((s) => {
        defaultAttendance[s.id] = existingMap[s.id] || "present";
      });

      setStudents(data || []);
      setAttendance(defaultAttendance);
      setLoading(false);
    }
    loadStudents();
  }, [selectedSection, today]);

  function toggleStatus(studentId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  }

  async function saveAttendance() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      section_id: selectedSection,
      date: today,
      status,
      marked_by: user.id,
      school_id: "", // Will be resolved by RLS
    }));

    // Upsert attendance records
    const { error } = await supabase
      .from("student_attendance")
      .upsert(records, { onConflict: "student_id,date" });

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const stats = {
    total: students.length,
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        description={new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        action={
          selectedSection && students.length > 0 ? (
            <Button
              onClick={saveAttendance}
              disabled={saving}
              className={cn(
                "text-white",
                saved ? "bg-success" : "bg-accent hover:bg-accent/90"
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Attendance"}
            </Button>
          ) : undefined
        }
      />

      {/* Section Selector */}
      <Card className="border-slate-light">
        <CardContent className="p-4">
          <label className="text-sm font-medium text-ink block mb-2">Select Class & Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
          >
            <option value="">Choose a section...</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.class_name} — {s.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-paper-raised border border-slate-light">
            <p className="text-xs text-slate">Total</p>
            <p className="text-xl font-bold text-ink tabular-nums">{stats.total}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/5 border border-success/20">
            <p className="text-xs text-success">Present</p>
            <p className="text-xl font-bold text-success tabular-nums">{stats.present}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-danger/5 border border-danger/20">
            <p className="text-xs text-danger">Absent</p>
            <p className="text-xl font-bold text-danger tabular-nums">{stats.absent}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs text-accent">Late</p>
            <p className="text-xl font-bold text-accent tabular-nums">{stats.late}</p>
          </div>
        </div>
      )}

      {/* Student Roster */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : students.length === 0 && selectedSection ? (
        <Card className="border-slate-light">
          <CardContent className="py-8 text-center">
            <p className="text-slate">No students in this section</p>
          </CardContent>
        </Card>
      ) : students.length > 0 ? (
        <div className="space-y-2">
          {students.map((student) => {
            const currentStatus = attendance[student.id] || "present";
            const config = statusConfig[currentStatus];
            const Icon = config.icon;
            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-paper-raised rounded-lg border border-slate-light"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-ink">
                    {student.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{student.full_name}</p>
                    <p className="text-xs text-slate font-mono">{student.admission_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
                    const sc = statusConfig[status];
                    const ScIcon = sc.icon;
                    const isActive = currentStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => toggleStatus(student.id, status)}
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-all border",
                          isActive
                            ? sc.bg + " border-current"
                            : "border-transparent hover:bg-muted"
                        )}
                        title={sc.label}
                      >
                        <ScIcon className={cn("h-4 w-4", isActive ? sc.color : "text-slate")} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
