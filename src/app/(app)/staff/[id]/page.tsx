"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/provider";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const supabase = createClient();

  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["staff-assignments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("section_subject_teachers")
        .select(`
          *,
          sections!inner(name, class_id, classes!inner(name)),
          subjects!inner(name, code)
        `)
        .eq("teacher_id", id);
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("common.noData")}</p>
        <Link href="/staff">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
      </div>

      {/* Staff Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {staff.full_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{staff.full_name}</h1>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <Badge variant="outline">{roleLabels[staff.role] || staff.role}</Badge>
                <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                  {staff.status}
                </Badge>
                {staff.phone && <span>{t("common.phone")}: {staff.phone}</span>}
                {staff.date_joined && <span>{t("staff.joiningDate")}: {staff.date_joined}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t("profile.personalInfo")}</TabsTrigger>
          <TabsTrigger value="assignments">{t("staff.title")} {t("common.type")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("common.email")}</p>
                <p className="font-medium">{staff.email || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("common.phone")}</p>
                <p className="font-medium">{staff.phone || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("staff.qualification")}</p>
                <p className="font-medium">{staff.qualification || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("staff.joiningDate")}</p>
                <p className="font-medium">{staff.date_joined || "-"}</p>
              </div>
              <div className="col-span-2 md:col-span-4">
                <p className="text-muted-foreground">{t("common.address")}</p>
                <p className="font-medium">{staff.address || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("staff.title")} {t("common.type")}</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t("students.class")}</th>
                        <th className="text-left p-2">{t("students.section")}</th>
                        <th className="text-left p-2">{t("exams.subject")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a) => (
                        <tr key={a.id} className="border-b">
                          <td className="p-2">{a.sections.classes.name}</td>
                          <td className="p-2">{a.sections.name}</td>
                          <td className="p-2">{a.subjects.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("common.noData")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
