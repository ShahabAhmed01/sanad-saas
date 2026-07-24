"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformanceData } from "@/hooks/use-performance-data";
import { useI18n } from "@/i18n/provider";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

export default function PerformancePage() {
  const { t } = useI18n();
  const [examId, setExamId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");

  const { data, isLoading } = usePerformanceData({ examId, classId, subjectId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("performance.title")}
        description={t("performance.description")}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("exams.selectExam")}</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
          >
            <option value="">{t("common.all")}</option>
            {data?.exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("students.class")}</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
          >
            <option value="">{t("common.all")}</option>
            {data?.classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("exams.subject")}</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
          >
            <option value="">{t("common.all")}</option>
            {data?.subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("performance.totalStudents")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overallStats.totalStudents || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("performance.overallAverage")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data?.overallStats.overallAverage || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("performance.passRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data?.overallStats.passRate || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Averages Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("performance.classAverages")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.classAverages && data.classAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.classAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t("performance.noData")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("performance.subjectPerformance")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.subjectAverages && data.subjectAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data.subjectAverages}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Average"
                    dataKey="average"
                    stroke="var(--accent)"
                    fill="var(--accent)"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t("performance.noData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("performance.studentResults")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.studentPerformance && data.studentPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t("students.admissionNo")}</th>
                    <th className="text-left p-2">{t("students.studentName")}</th>
                    <th className="text-left p-2">{t("students.class")}</th>
                    <th className="text-right p-2">{t("common.total")}</th>
                    <th className="text-right p-2">{t("exams.marks")}</th>
                    <th className="text-right p-2">{t("exams.percentage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.studentPerformance.map((student) => (
                    <tr key={student.studentId} className="border-b hover:bg-muted/50">
                      <td className="p-2">{student.admissionNumber}</td>
                      <td className="p-2">{student.studentName}</td>
                      <td className="p-2">{student.className} - {student.sectionName}</td>
                      <td className="p-2 text-right">{student.totalMarks}</td>
                      <td className="p-2 text-right">{student.obtainedMarks}</td>
                      <td className="p-2 text-right">
                        <span className={`font-medium ${student.percentage >= 40 ? "text-green-600" : "text-red-600"}`}>
                          {student.percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
