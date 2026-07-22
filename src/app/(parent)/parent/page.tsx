"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, ClipboardCheck, Banknote, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

interface ChildInfo {
  id: string;
  full_name: string;
  admission_number: string;
}

function ParentDashboardContent() {
  const [child, setChild] = useState<ChildInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  useEffect(() => {
    async function loadChild() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get guardian record
      const { data: guardian } = await supabase
        .from("guardians")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!guardian) { setLoading(false); return; }

      // Build query - if childId is specified, fetch that specific child
      let query = supabase
        .from("student_guardians")
        .select("student_id, students!inner (id, full_name, admission_number)")
        .eq("guardian_id", guardian.id);

      if (childId) {
        query = query.eq("student_id", childId);
      }

      const { data: sgList } = await query;

      if (sgList && sgList.length > 0) {
        const sg = childId ? sgList[0] : sgList[0];
        const student = sg.students as unknown as ChildInfo;
        setChild({
          id: student.id,
          full_name: student.full_name,
          admission_number: student.admission_number,
        });
      }
      setLoading(false);
    }
    loadChild();
  }, [childId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-paper-raised rounded-xl animate-skeleton" />
        ))}
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-slate">No student linked to your account.</p>
        <p className="text-sm text-slate mt-1">
          Contact your school to link your child&apos;s record.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome, Parent
        </h1>
        <p className="text-slate">
          Viewing information for <strong>{child.full_name}</strong> ({child.admission_number})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a href="/parent/attendance">
          <Card className="border-slate-light hover:border-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Attendance</p>
                <p className="text-xs text-slate">View history</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="/parent/marks">
          <Card className="border-slate-light hover:border-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Marks</p>
                <p className="text-xs text-slate">Exam results</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="/parent/fees">
          <Card className="border-slate-light hover:border-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-danger" />
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Fees</p>
                <p className="text-xs text-slate">Pay & view history</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="/parent/homework">
          <Card className="border-slate-light hover:border-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-ink/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-ink" />
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Homework</p>
                <p className="text-xs text-slate">View assignments</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-paper-raised rounded-xl animate-skeleton" />
        ))}
      </div>
    }>
      <ParentDashboardContent />
    </Suspense>
  );
}
