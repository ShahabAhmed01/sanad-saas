"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  phone: string;
  status: string;
  date_joined: string;
}

const roleLabels: Record<string, string> = {
  school_admin: "School Admin",
  principal: "Principal",
  teacher: "Teacher",
  accountant: "Accountant",
  front_desk: "Front Desk",
  hr_manager: "HR Manager",
  librarian: "Librarian",
  transport_coordinator: "Transport Coord.",
  exam_controller: "Exam Controller",
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  on_leave: "bg-accent/10 text-accent",
  suspended: "bg-danger/10 text-danger",
  terminated: "bg-slate/10 text-slate",
};

async function fetchStaff(schoolId: string): Promise<StaffMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to load staff");
  return data || [];
}

export default function StaffPage() {
  const router = useRouter();
  const schoolId = useSchoolId();

  const { data: staff = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKeys.school.staff(schoolId),
    queryFn: () => fetchStaff(schoolId),
    enabled: !!schoolId,
  });

  const error = queryError ? queryError.message : null;

  const columns = [
    { 
      key: "full_name", 
      header: "Name",
      renderPreview: (item: StaffMember) => (
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-foreground">{item.full_name}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[item.role] || item.role}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{item.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{item.status.replace("_", " ")}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Joined</p>
              <p className="font-medium">
                {item.date_joined
                  ? new Date(item.date_joined).toLocaleDateString("en-PK")
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (item: StaffMember) => (
        <span className="text-sm">{roleLabels[item.role] || item.role}</span>
      ),
    },
    { key: "phone", header: "Phone" },
    {
      key: "status",
      header: "Status",
      render: (item: StaffMember) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[item.status] || "bg-slate/10 text-slate"
          }`}
        >
          {item.status.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "date_joined",
      header: "Joined",
      render: (item: StaffMember) =>
        item.date_joined
          ? new Date(item.date_joined).toLocaleDateString("en-PK")
          : "—",
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Staff" }]} />
      <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage your school's staff members and their roles"
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
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
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff members yet"
          description="Add your first staff member to get started. They'll receive an email invitation to set their password."
          action={{ label: "Add Staff", onClick: () => router.push("/staff/invite") }}
        />
      ) : (
        <DataTable
          data={staff}
          columns={columns}
          searchKeys={["full_name", "role", "phone"]}
          searchPlaceholder="Search by name, role, or phone..."
        />
      )}
    </div>
    </>
  );
}
