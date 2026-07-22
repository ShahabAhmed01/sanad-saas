"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Upload, AlertTriangle } from "lucide-react";

interface ImportRow {
  admission_number: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  section_name: string;
  error?: string;
}

export default function ImportStudentsPage() {
  const [parsed, setParsed] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows: ImportRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || "";
        });
        rows.push({
          admission_number: row.admission_number || row.adm_no || row.admno || "",
          full_name: row.full_name || row.name || row.student_name || "",
          gender: row.gender || row.sex || "",
          date_of_birth: row.date_of_birth || row.dob || row.birth_date || "",
          section_name: row.section || row.section_name || row.class || "",
        });
      }

      setParsed(rows.filter((r) => r.full_name));
    };
    reader.readAsText(file);
  }

  async function importStudents() {
    setImporting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: staff } = await supabase.from("staff").select("school_id").eq("id", user.id).single();
    if (!staff) return;

    let success = 0;
    let failed = 0;

    for (const row of parsed) {
      if (!row.full_name || !row.admission_number) {
        failed++;
        continue;
      }

      // Find section
      let sectionId = null;
      if (row.section_name) {
        const { data: section } = await supabase
          .from("sections")
          .select("id")
          .eq("school_id", staff.school_id)
          .ilike("name", row.section_name)
          .single();
        sectionId = section?.id || null;
      }

      const { error } = await supabase.from("students").insert({
        school_id: staff.school_id,
        admission_number: row.admission_number,
        full_name: row.full_name,
        gender: row.gender || null,
        date_of_birth: row.date_of_birth || null,
        section_id: sectionId,
      });

      if (error) failed++;
      else success++;
    }

    setResult({ success, failed });
    setImporting(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Import Students" description="Bulk import students from a CSV file" />

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate">
            CSV should have columns: <code className="bg-muted px-1 rounded">admission_number</code>, <code className="bg-muted px-1 rounded">full_name</code>, <code className="bg-muted px-1 rounded">gender</code>, <code className="bg-muted px-1 rounded">date_of_birth</code>, <code className="bg-muted px-1 rounded">section</code>
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />

          <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Choose CSV file
          </Button>

          {parsed.length > 0 && (
            <div>
              <p className="text-sm text-ink mb-2">{parsed.length} students found in file</p>
              <div className="max-h-48 overflow-y-auto border border-slate-light rounded-lg">
                {parsed.slice(0, 10).map((row, i) => (
                  <div key={i} className="p-2 text-xs border-b border-slate-light last:border-0">
                    <span className="font-medium text-ink">{row.full_name}</span>
                    <span className="text-slate ml-2 font-mono">{row.admission_number}</span>
                  </div>
                ))}
                {parsed.length > 10 && (
                  <p className="p-2 text-xs text-slate">...and {parsed.length - 10} more</p>
                )}
              </div>
              <Button onClick={importStudents} disabled={importing} className="w-full mt-4 bg-accent hover:bg-accent/90 text-white">
                {importing ? "Importing..." : `Import ${parsed.length} Students`}
              </Button>
            </div>
          )}

          {result && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-ink">{result.success} imported successfully</p>
                {result.failed > 0 && (
                  <p className="text-xs text-danger">{result.failed} failed (check CSV format)</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
