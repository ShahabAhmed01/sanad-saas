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
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const supabase = createClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          sections!inner(id, name, class_id, classes!inner(id, name))
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: marks } = useQuery({
    queryKey: ["student-marks", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("marks")
        .select(`
          *,
          exam_subject_schedule!inner(
            max_marks, passing_marks,
            subjects!inner(name, code),
            exams!inner(name, starts_on)
          )
        `)
        .eq("student_id", id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: attendance } = useQuery({
    queryKey: ["student-attendance", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_attendance")
        .select("*")
        .eq("student_id", id)
        .order("date", { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: fees } = useQuery({
    queryKey: ["student-fees", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("fee_invoices")
        .select("*, fee_payments(*)")
        .eq("student_id", id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("common.noData")}</p>
        <Link href="/students">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const presentDays = (attendance || []).filter((a) => a.status === "present").length;
  const absentDays = (attendance || []).filter((a) => a.status === "absent").length;
  const attendanceRate = attendance && attendance.length > 0 ? (presentDays / attendance.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            {t("common.print")}
          </Button>
        </div>
      </div>

      {/* Student Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {student.full_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{student.full_name}</h1>
              <p className="text-muted-foreground">{student.father_name}</p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{t("students.admissionNo")}: {student.admission_number}</span>
                <span>{t("students.class")}: {student.sections.classes.name} - {student.sections.name}</span>
                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("profile.personalInfo")}</TabsTrigger>
          <TabsTrigger value="marks">{t("exams.marksEntry")}</TabsTrigger>
          <TabsTrigger value="attendance">{t("attendance.title")}</TabsTrigger>
          <TabsTrigger value="fees">{t("fees.title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("common.gender")}</p>
                <p className="font-medium">{student.gender}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("students.dateOfBirth")}</p>
                <p className="font-medium">{student.date_of_birth}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("common.phone")}</p>
                <p className="font-medium">{student.contact || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("students.admissionDate")}</p>
                <p className="font-medium">{student.admission_date}</p>
              </div>
              <div className="col-span-2 md:col-span-4">
                <p className="text-muted-foreground">{t("common.address")}</p>
                <p className="font-medium">{student.address || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("exams.marksEntry")}</CardTitle>
            </CardHeader>
            <CardContent>
              {marks && marks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t("exams.examType")}</th>
                        <th className="text-left p-2">{t("exams.subject")}</th>
                        <th className="text-right p-2">{t("exams.marks")}</th>
                        <th className="text-right p-2">{t("exams.maxMarksShort")}</th>
                        <th className="text-right p-2">{t("exams.percentage")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((mark) => (
                        <tr key={mark.id} className="border-b">
                          <td className="p-2">{mark.exam_subject_schedule.exams.name}</td>
                          <td className="p-2">{mark.exam_subject_schedule.subjects.name}</td>
                          <td className="p-2 text-right">{mark.marks_obtained}</td>
                          <td className="p-2 text-right">{mark.exam_subject_schedule.max_marks}</td>
                          <td className="p-2 text-right">
                            {mark.exam_subject_schedule.max_marks > 0
                              ? ((mark.marks_obtained / mark.exam_subject_schedule.max_marks) * 100).toFixed(1)
                              : 0}%
                          </td>
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

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{presentDays}</p>
                <p className="text-sm text-muted-foreground">{t("common.present")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{absentDays}</p>
                <p className="text-sm text-muted-foreground">{t("common.absent")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">{t("attendance.title")}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent>
              {attendance && attendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t("common.date")}</th>
                        <th className="text-left p-2">{t("common.status")}</th>
                        <th className="text-left p-2">{t("common.notes")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a) => (
                        <tr key={a.id} className="border-b">
                          <td className="p-2">{a.date}</td>
                          <td className="p-2">
                            <Badge variant={a.status === "present" ? "default" : a.status === "absent" ? "destructive" : "secondary"}>
                              {a.status}
                            </Badge>
                          </td>
                          <td className="p-2">{a.remarks || "-"}</td>
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

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardContent>
              {fees && fees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t("fees.feeType")}</th>
                        <th className="text-right p-2">{t("common.amount")}</th>
                        <th className="text-left p-2">{t("common.status")}</th>
                        <th className="text-left p-2">{t("fees.dueDate")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee) => (
                        <tr key={fee.id} className="border-b">
                          <td className="p-2">{fee.period_label}</td>
                          <td className="p-2 text-right">PKR {fee.total_amount?.toLocaleString()}</td>
                          <td className="p-2">
                            <Badge variant={fee.status === "paid" ? "default" : fee.status === "overdue" ? "destructive" : "secondary"}>
                              {fee.status}
                            </Badge>
                          </td>
                          <td className="p-2">{fee.due_date}</td>
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
