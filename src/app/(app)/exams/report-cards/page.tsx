"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { FileText, Download, Printer } from "lucide-react";

interface Exam {
  id: string;
  name: string;
  status: string;
}

interface ReportCard {
  student_id: string;
  student_name: string;
  admission_number: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: string;
  subjects: { name: string; marks: number; max_marks: number; grade: string }[];
}

export default function ReportCardsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("exams")
        .select("id, name, status")
        .order("created_at", { ascending: false });
      setExams(data || []);
    }
    load();
  }, []);

  async function generateReportCards() {
    if (!selectedExam) return;
    setGenerating(true);
    const supabase = createClient();

    // Get all marks for this exam
    const { data: marks } = await supabase
      .from("marks")
      .select(`
        student_id, marks_obtained, is_absent,
        exam_subject_schedule!inner (
          max_marks, passing_marks,
          subjects!inner (name),
          exams!inner (name)
        )
      `)
      .eq("exam_subject_schedule.exams.id", selectedExam);

    // Get student info
    const studentIds = [...new Set((marks || []).map((m: any) => m.student_id))];
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, admission_number")
      .in("id", studentIds);

    // Build report cards
    const cards: ReportCard[] = (students || []).map((student) => {
      const studentMarks = (marks || []).filter((m: any) => m.student_id === student.id);
      const subjects = studentMarks.map((m: any) => ({
        name: m.exam_subject_schedule?.subjects?.name || "",
        marks: m.is_absent ? 0 : Number(m.marks_obtained || 0),
        max_marks: Number(m.exam_subject_schedule?.max_marks || 100),
        grade: m.is_absent ? "Absent" : calculateGrade(
          Number(m.marks_obtained || 0),
          Number(m.exam_subject_schedule?.max_marks || 100)
        ),
      }));

      const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
      const maxTotal = subjects.reduce((sum, s) => sum + s.max_marks, 0);
      const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;

      return {
        student_id: student.id,
        student_name: student.full_name,
        admission_number: student.admission_number,
        total_marks: maxTotal,
        marks_obtained: totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        grade: calculateGrade(totalMarks, maxTotal),
        subjects,
      };
    });

    setReportCards(cards.sort((a, b) => b.percentage - a.percentage));
    setGenerating(false);
  }

  function calculateGrade(marks: number, max: number): string {
    const pct = max > 0 ? (marks / max) * 100 : 0;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    if (pct >= 33) return "E";
    return "F";
  }

  function printReportCard(card: ReportCard) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Report Card - ${card.student_name}</title>
      <style>
        body { font-family: 'IBM Plex Sans', sans-serif; padding: 40px; color: #12332F; }
        .header { text-align: center; border-bottom: 2px solid #B8862F; padding-bottom: 20px; margin-bottom: 20px; }
        .seal { width: 80px; height: 80px; border: 3px solid #B8862F; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-family: serif; font-size: 12px; color: #B8862F; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #E4E2D8; padding: 8px 12px; text-align: left; }
        th { background: #F7F6F1; font-weight: 600; }
        .grade { font-weight: bold; color: #B8862F; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6B6B62; }
      </style></head><body>
      <div class="header">
        <div class="seal">SANAD</div>
        <h1>Report Card</h1>
        <p><strong>${card.student_name}</strong> (${card.admission_number})</p>
      </div>
      <table>
        <thead><tr><th>Subject</th><th>Marks</th><th>Max</th><th>Grade</th></tr></thead>
        <tbody>
          ${card.subjects.map(s => `<tr><td>${s.name}</td><td>${s.marks}</td><td>${s.max_marks}</td><td class="grade">${s.grade}</td></tr>`).join("")}
        </tbody>
        <tfoot>
          <tr><td><strong>Total</strong></td><td><strong>${card.marks_obtained}</strong></td><td><strong>${card.total_marks}</strong></td><td class="grade"><strong>${card.grade}</strong></td></tr>
          <tr><td><strong>Percentage</strong></td><td colspan="3" class="grade"><strong>${card.percentage}%</strong></td></tr>
        </tfoot>
      </table>
      <div class="footer">Generated by Sanad — ${new Date().toLocaleDateString("en-PK")}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Report Cards" description="Generate and print student report cards" />

      <Card className="border-slate-light max-w-lg">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Select Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
            >
              <option value="">Select exam...</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={generateReportCards}
            disabled={!selectedExam || generating}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            {generating ? "Generating..." : "Generate Report Cards"}
          </Button>
        </CardContent>
      </Card>

      {reportCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">
              {reportCards.length} report cards generated
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                reportCards.forEach((card, i) => {
                  setTimeout(() => printReportCard(card), i * 500);
                });
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>

          {reportCards.map((card) => (
            <Card key={card.student_id} className="border-slate-light">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-ink">{card.student_name}</p>
                    <p className="text-xs text-slate font-mono">{card.admission_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-ink tabular-nums">
                      {card.marks_obtained}/{card.total_marks}
                    </p>
                    <p className="text-sm font-bold text-accent">{card.grade} ({card.percentage}%)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {card.subjects.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs p-2 rounded bg-paper border border-slate-light">
                      <span className="text-slate truncate">{s.name}</span>
                      <span className="font-medium text-ink tabular-nums ml-2">{s.marks}/{s.max_marks}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => printReportCard(card)}
                >
                  <Printer className="h-3 w-3 mr-1" /> Print
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
