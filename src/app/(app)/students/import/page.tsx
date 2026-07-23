"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { useSchoolId } from "@/hooks/use-user-profile";
import { toast } from "sonner";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { parseCSV, mapRow, type ImportRow } from "@/lib/csv-parser";

const BATCH_SIZE = 50;

export default function ImportStudentsPage() {
  const [parsed, setParsed] = useState<ImportRow[]>([]);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const { t } = useI18n();

  const importMutation = useMutation({
    mutationFn: async (rows: ImportRow[]) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: staff } = await supabase.from("staff").select("school_id").eq("id", user.id).single();
      if (!staff) throw new Error("Staff profile not found");

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      // Batch insert — group rows into chunks of BATCH_SIZE
      for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
        const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);

        // Resolve section IDs for the batch in one query
        const sectionNames = [...new Set(batch.filter(r => r.section_name).map(r => r.section_name))];
        const sectionMap = new Map<string, string>();

        if (sectionNames.length > 0) {
          const { data: sections } = await supabase
            .from("sections")
            .select("id, name")
            .eq("school_id", staff.school_id)
            .ilike("name", `(${sectionNames.join("|")})`);

          if (sections) {
            sections.forEach(s => sectionMap.set(s.name.toLowerCase(), s.id));
          }
        }

        // Build batch insert payload
        const insertRows = batch
          .filter(row => row.full_name && row.admission_number)
          .map(row => ({
            school_id: staff.school_id,
            admission_number: row.admission_number,
            full_name: row.full_name,
            gender: row.gender || null,
            date_of_birth: row.date_of_birth || null,
            section_id: row.section_name ? (sectionMap.get(row.section_name.toLowerCase()) || null) : null,
          }));

        const skippedCount = batch.length - insertRows.length;
        failed += skippedCount;
        if (skippedCount > 0) {
          errors.push(`Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}: ${skippedCount} rows skipped (missing name or admission number)`);
        }

        if (insertRows.length > 0) {
          const { data, error } = await supabase.from("students").insert(insertRows).select("id");

          if (error) {
            failed += insertRows.length;
            errors.push(`Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}: ${error.message}`);
          } else {
            success += data?.length || insertRows.length;
          }
        }
      }

      return { success, failed, errors };
    },
    onSuccess: (data) => {
      setResult(data);
      setIsImporting(false);
      if (data.failed > 0) {
        toast.warning(`Imported ${data.success} students, ${data.failed} failed`);
      } else {
        toast.success(`All ${data.success} students imported successfully`);
      }
      if (schoolId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.school.students(schoolId) });
      }
    },
    onError: (error) => {
      setIsImporting(false);
      toast.error(error.message || "Failed to import students");
    },
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error(t("students.pleaseSelectCSV"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, rows } = parseCSV(text);

      if (headers.length === 0 || rows.length === 0) {
        toast.error(t("students.couldNotParse"));
        return;
      }

      const mappedRows = rows.map(mapRow).filter(r => r.full_name);
      setParsed(mappedRows);
      setResult(null);
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (parsed.length === 0) return;
    setIsImporting(true);
    importMutation.mutate(parsed);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("students.importStudents")} description={t("students.bulkImport")} />

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">{t("students.uploadCSV")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate">
            {t("students.csvColumnInfo")} <code className="bg-muted px-1 rounded">admission_number</code>, <code className="bg-muted px-1 rounded">full_name</code>, <code className="bg-muted px-1 rounded">gender</code>, <code className="bg-muted px-1 rounded">date_of_birth</code>, <code className="bg-muted px-1 rounded">section</code>
          </p>
          <p className="text-xs text-slate">
            {t("students.rfc4180")}
            {t("students.batchImport", { size: String(BATCH_SIZE) })}
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
            {t("students.chooseCSVFile")}
          </Button>

          {parsed.length > 0 && (
            <div>
              <p className="text-sm text-ink mb-2">{t("students.studentsFound", { count: String(parsed.length) })}</p>
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
              <Button onClick={handleImport} disabled={isImporting} isLoading={isImporting} className="w-full mt-4 bg-accent hover:bg-accent/90 text-white">
                {t("students.importCount", { count: String(parsed.length) })}
              </Button>
            </div>
          )}

          {result && (
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${
              result.failed > 0 ? "bg-danger/5 border-danger/20" : "bg-success/5 border-success/20"
            }`}>
              {result.failed > 0 ? (
                <AlertCircle className="h-5 w-5 text-danger mt-0.5 shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-ink">{t("students.importedSuccessfully", { count: String(result.success) })}</p>
                {result.failed > 0 && (
                  <>
                    <p className="text-xs text-danger">{t("students.failedCount", { count: String(result.failed) })}</p>
                    {result.errors.length > 0 && (
                      <ul className="text-xs text-danger mt-1 space-y-0.5">
                        {result.errors.map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
