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
import { useI18n } from "@/i18n/provider";

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  phone: string;
  status: string;
  date_joined: string;
}

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
  const { t } = useI18n();

  const roleLabels: Record<string, string> = {
    school_admin: t("staff.schoolAdmin"),
    principal: t("staff.principal"),
    teacher: t("staff.teacher"),
    accountant: t("staff.accountant"),
    front_desk: t("staff.frontDesk"),
    hr_manager: t("staff.hrManager"),
    librarian: t("staff.librarian"),
    transport_coordinator: t("staff.transportCoord"),
    exam_controller: t("staff.examController"),
  };

  const { data: staff = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKeys.school.staff(schoolId),
    queryFn: () => fetchStaff(schoolId),
    enabled: !!schoolId,
  });

  const error = queryError ? queryError.message : null;

  const statusLabels: Record<string, string> = {
    active: t("common.active"),
    on_leave: t("staff.onLeave"),
    suspended: t("staff.suspended"),
    terminated: t("staff.terminated"),
  };

  const columns = [
    { 
      key: "full_name", 
      header: t("common.name"),
      renderPreview: (item: StaffMember) => (
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-foreground">{item.full_name}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[item.role] || item.role}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">{t("common.phone")}</p>
              <p className="font-medium">{item.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("common.status")}</p>
              <p className="font-medium">{statusLabels[item.status] || item.status}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">{t("common.joined")}</p>
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
      header: t("staff.role"),
      render: (item: StaffMember) => (
        <span className="text-sm">{roleLabels[item.role] || item.role}</span>
      ),
    },
    { key: "phone", header: t("common.phone") },
    {
      key: "status",
      header: t("common.status"),
      render: (item: StaffMember) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[item.status] || "bg-slate/10 text-slate"
          }`}
        >
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "date_joined",
      header: t("common.joined"),
      render: (item: StaffMember) =>
        item.date_joined
          ? new Date(item.date_joined).toLocaleDateString("en-PK")
          : "—",
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: t("staff.title") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("staff.management")}
        description={t("staff.manageStaff")}
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("staff.addStaff")}
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
          title={t("staff.noStaffYet")}
          description={t("staff.addFirstStaff")}
          action={{ label: t("staff.addStaff"), onClick: () => router.push("/staff/invite") }}
        />
      ) : (
        <DataTable
          data={staff}
          columns={columns}
          searchKeys={["full_name", "role", "phone"]}
          searchPlaceholder={t("staff.searchByNameRolePhone")}
          onRowClick={(item) => {
            router.push(`/staff/${item.id}`);
          }}
        />
      )}
    </div>
    </>
  );
}
