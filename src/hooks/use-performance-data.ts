"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

interface PerformanceFilters {
  examId?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
}

interface MarkStudent {
  id: string;
  full_name: string;
  admission_number: string;
  section_id?: string;
  sections?: { id?: string; name?: string; class_id?: string; classes?: { id?: string; name?: string }[] }[];
}

interface MarkEss {
  subjects?: { id?: string; name?: string; code?: string }[];
  max_marks?: number;
  passing_marks?: number;
}

export function usePerformanceData(filters: PerformanceFilters) {
  const schoolId = useSchoolId();
  const supabase = createClient();

  return useQuery({
    queryKey: [...queryKeys.school.performance(schoolId || ""), filters],
    queryFn: async () => {
      if (!schoolId) return null;

      const { data: exams } = await supabase
        .from("exams")
        .select("id, name, starts_on, ends_on")
        .eq("school_id", schoolId)
        .order("starts_on", { ascending: false });

      let marksQuery = supabase
        .from("marks")
        .select(`
          id, marks_obtained, is_absent,
          students!inner(id, full_name, admission_number, section_id, sections!inner(id, name, class_id, classes!inner(id, name))),
          exam_subject_schedule!inner(id, max_marks, passing_marks, subjects!inner(id, name, code), exams!inner(id, name))
        `)
        .eq("school_id", schoolId);

      if (filters.examId) {
        marksQuery = marksQuery.eq("exam_subject_schedule.exams.id", filters.examId);
      }
      if (filters.classId) {
        marksQuery = marksQuery.eq("students.sections.class_id", filters.classId);
      }
      if (filters.sectionId) {
        marksQuery = marksQuery.eq("students.section_id", filters.sectionId);
      }
      if (filters.subjectId) {
        marksQuery = marksQuery.eq("exam_subject_schedule.subjects.id", filters.subjectId);
      }

      const { data: marks, error: marksError } = await marksQuery;
      if (marksError) throw marksError;

      const { data: classes } = await supabase
        .from("classes")
        .select("id, name")
        .eq("school_id", schoolId)
        .order("display_order");

      const { data: sections } = await supabase
        .from("sections")
        .select("id, name, class_id")
        .eq("school_id", schoolId);

      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name, code")
        .eq("school_id", schoolId);

      // Aggregate student performance
      const studentMap = new Map<string, {
        studentId: string;
        studentName: string;
        admissionNumber: string;
        className: string;
        sectionName: string;
        totalMarks: number;
        obtainedMarks: number;
        percentage: number;
        subjects: { name: string; obtained: number; total: number; percentage: number }[];
      }>();

      for (const mark of marks || []) {
        const students = (Array.isArray(mark.students) ? mark.students[0] : mark.students) as MarkStudent;
        const ess = (Array.isArray(mark.exam_subject_schedule) ? mark.exam_subject_schedule[0] : mark.exam_subject_schedule) as MarkEss;
        const studentId = students.id;
        const section = Array.isArray(students.sections) ? students.sections[0] : students.sections;
        const className = Array.isArray(section?.classes) ? section.classes[0]?.name : (section?.classes as unknown as { name?: string })?.name;
        const existing = studentMap.get(studentId) || {
          studentId,
          studentName: students.full_name,
          admissionNumber: students.admission_number,
          className: className || "",
          sectionName: section?.name || "",
          totalMarks: 0,
          obtainedMarks: 0,
          percentage: 0,
          subjects: [] as { name: string; obtained: number; total: number; percentage: number }[],
        };

        const maxMarks = ess.max_marks || 0;
        const obtained = mark.is_absent ? 0 : (mark.marks_obtained || 0);
        existing.totalMarks += maxMarks;
        existing.obtainedMarks += obtained;
        existing.subjects.push({
          name: Array.isArray(ess.subjects) ? (ess.subjects[0]?.name || "") : "",
          obtained,
          total: maxMarks,
          percentage: maxMarks > 0 ? (obtained / maxMarks) * 100 : 0,
        });
        studentMap.set(studentId, existing);
      }

      const studentPerformance = Array.from(studentMap.values()).map((p) => ({
        ...p,
        percentage: p.totalMarks > 0 ? (p.obtainedMarks / p.totalMarks) * 100 : 0,
      }));

      // Class averages
      const classAvgMap = new Map<string, { total: number; sum: number }>();
      for (const p of studentPerformance) {
        const key = `${p.className} - ${p.sectionName}`;
        const existing = classAvgMap.get(key) || { total: 0, sum: 0 };
        existing.total++;
        existing.sum += p.percentage;
        classAvgMap.set(key, existing);
      }
      const classAverages = Array.from(classAvgMap.entries()).map(([name, data]) => ({
        name,
        average: data.total > 0 ? data.sum / data.total : 0,
        studentCount: data.total,
      }));

      // Subject averages
      const subjectAvgMap = new Map<string, { total: number; sum: number }>();
      for (const p of studentPerformance) {
        for (const s of p.subjects) {
          const existing = subjectAvgMap.get(s.name) || { total: 0, sum: 0 };
          existing.total++;
          existing.sum += s.percentage;
          subjectAvgMap.set(s.name, existing);
        }
      }
      const subjectAverages = Array.from(subjectAvgMap.entries()).map(([name, data]) => ({
        name,
        average: data.total > 0 ? data.sum / data.total : 0,
      }));

      // Overall stats
      const totalStudents = studentPerformance.length;
      const overallAverage = totalStudents > 0
        ? studentPerformance.reduce((sum, p) => sum + p.percentage, 0) / totalStudents
        : 0;
      const passRate = totalStudents > 0
        ? (studentPerformance.filter((p) => p.percentage >= 40).length / totalStudents) * 100
        : 0;

      return {
        exams: exams || [],
        classes: classes || [],
        sections: sections || [],
        subjects: subjects || [],
        studentPerformance,
        classAverages,
        subjectAverages,
        overallStats: { totalStudents, overallAverage, passRate },
      };
    },
    enabled: !!schoolId,
  });
}
