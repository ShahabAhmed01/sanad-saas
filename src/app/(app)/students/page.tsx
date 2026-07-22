"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { GraduationCap, Plus, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  gender: string;
  status: string;
  admission_date: string;
  section_id: string;
}

async function fetchStudents(schoolId: string): Promise<Student[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to load students");
  return data || [];
}

export default function StudentsPage() {
  const router = useRouter();
  const schoolId = useSchoolId();

  const { data: students = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKeys.school.students(schoolId),
    queryFn: () => fetchStudents(schoolId),
    enabled: !!schoolId,
  });

  const error = queryError ? queryError.message : null;

  const columns = [
    {
      key: "admission_number",
      header: "Adm. No.",
      render: (item: Student) => (
        <span className="font-mono text-xs">{item.admission_number}</span>
      ),
    },
    { 
      key: "full_name", 
      header: "Name",
      renderPreview: (item: Student) => (
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-foreground">{item.full_name}</p>
            <p className="text-xs text-muted-foreground">#{item.admission_number}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{item.gender || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{item.status}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Admitted</p>
              <p className="font-medium">
                {item.admission_date
                  ? new Date(item.admission_date).toLocaleDateString("en-PK")
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      ),
    },
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
              : item.status === "inactive"
              ? "bg-danger/10 text-danger"
              : "bg-muted text-muted-foreground"
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
      <Breadcrumbs items={[{ label: "Students" }]} />

      <PageHeader
        title="Student Management"
        description="Manage your school's students"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/students/import")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => router.push("/students/create")}
            >
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
          onRowClick={(item) => {
            toast.info(`Viewing ${item.full_name}`, {
              description: `Admission #${item.admission_number}`,
            });
          }}
        />
      )}
    </div>
  );
}
