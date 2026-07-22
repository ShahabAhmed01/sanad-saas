"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  gender: string;
  status: string;
  admission_date: string;
  section_id: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudents() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      const { data: staff, error: staffErr } = await supabase
        .from("staff")
        .select("school_id")
        .eq("id", user.id)
        .single();
      if (staffErr || !staff) { setError("Failed to load school info"); setLoading(false); return; }

      const { data, error: queryErr } = await supabase
        .from("students")
        .select("*")
        .eq("school_id", staff.school_id)
        .order("created_at", { ascending: false });

      if (queryErr) { setError("Failed to load students"); setLoading(false); return; }
      setStudents(data || []);
      setLoading(false);
    }
    loadStudents();
  }, []);

  const columns = [
    {
      key: "admission_number",
      header: "Adm. No.",
      render: (item: Student) => (
        <span className="font-mono text-xs">{item.admission_number}</span>
      ),
    },
    { key: "full_name", header: "Name" },
    {
      key: "gender",
      header: "Gender",
      render: (item: Student) => (
        <span className="capitalize">{item.gender || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Student) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            item.status === "active"
              ? "bg-success/10 text-success"
              : "bg-slate/10 text-slate"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "admission_date",
      header: "Admission Date",
      render: (item: Student) =>
        item.admission_date
          ? new Date(item.admission_date).toLocaleDateString("en-PK")
          : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="Manage your school's students"
        action={
          <div className="flex gap-2">
            <Button variant="outline">Import CSV</Button>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        }
      />

      {error ? (
        <Card className="border-danger bg-danger/5">
          <CardContent className="p-4">
            <p className="text-danger font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-paper-raised rounded-lg animate-skeleton"
            />
          ))}
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students yet"
          description="Add your first student or import a CSV file with your student data."
          action={{ label: "Add Student", onClick: () => router.push("/students/import") }}
        />
      ) : (
        <DataTable
          data={students}
          columns={columns}
          searchKeys={["full_name", "admission_number"]}
          searchPlaceholder="Search by name or admission number..."
        />
      )}
    </div>
  );
}
