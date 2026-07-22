"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Award } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  section_name: string;
}

async function searchStudentsFn(schoolId: string, search: string): Promise<Student[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("students")
    .select("id, full_name, admission_number, sections!inner(name)")
    .or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%`)
    .limit(10);
  return (data || []).map((s: { id: string; full_name: string; admission_number: string; sections: { name: string }[] }) => ({
    ...s,
    section_name: s.sections[0]?.name || "",
  }));
}

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [certType, setCertType] = useState("bonafide");
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: queryKeys.school.certificates(schoolId).concat("search", search),
    queryFn: () => searchStudentsFn(schoolId, search),
    enabled: search.length >= 2,
  });

  const issueMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent) throw new Error("No student selected");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("certificates_issued").insert({
        student_id: selectedStudent.id,
        certificate_type: certType,
        issued_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Certificate issued", { description: `${certType} certificate generated for ${selectedStudent?.full_name}` });
      printCertificate(selectedStudent!, certType);
      queryClient.invalidateQueries({
        queryKey: queryKeys.school.certificates(schoolId),
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to issue certificate", { description: error.message || "Please try again" });
    },
  });

  function printCertificate(student: Student, type: string) {
    const typeLabels: Record<string, string> = {
      bonafide: "Bonafide Certificate",
      character: "Character Certificate",
      transfer: "Transfer Certificate",
      leaving: "Leaving Certificate",
    };

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${typeLabels[type]} - ${student.full_name}</title>
      <style>
        body { font-family: 'IBM Plex Sans', sans-serif; padding: 60px; color: #12332F; }
        .seal { width: 100px; height: 100px; border: 3px solid #B8862F; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-family: serif; font-size: 14px; color: #B8862F; text-align: center; line-height: 1.2; }
        .seal-inner { border: 1px dashed #B8862F; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        h1 { text-align: center; font-size: 24px; margin-bottom: 10px; }
        .line { border-bottom: 1px solid #E4E2D8; margin: 20px 0; }
        .content { line-height: 1.8; margin: 30px 0; }
        .signature { display: flex; justify-content: space-between; margin-top: 60px; }
        .signature-line { border-top: 1px solid #12332F; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #6B6B62; }
      </style></head><body>
      <div class="seal"><div class="seal-inner">SANAD</div></div>
      <h1>${typeLabels[type]}</h1>
      <div class="line"></div>
      <div class="content">
        <p>This is to certify that <strong>${student.full_name}</strong> (Admission No: ${student.admission_number})</p>
        <p>is a student of this institution, studying in <strong>${student.section_name}</strong>.</p>
        <p>This certificate is issued upon request for whatever legal purpose it may serve.</p>
      </div>
      <div class="line"></div>
      <div class="signature">
        <div class="signature-line">Principal</div>
        <div class="signature-line">Date: ${new Date().toLocaleDateString("en-PK")}</div>
      </div>
      <div class="footer">Generated by Sanad — ${new Date().toLocaleDateString("en-PK")}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Certificates" }]} />
      <div className="space-y-6">
      <PageHeader title="Certificates" description="Issue and print student certificates" />

      <Card className="border-slate-light max-w-lg">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Input
              placeholder="Search student by name or admission number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value.length >= 2) searchStudentsFn(schoolId, e.target.value); }}
            />
            {students.length > 0 && (
              <div className="absolute z-10 w-full bg-paper-raised border border-slate-light rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStudent(s); setSearch(s.full_name); }}
                    className="w-full text-left p-2 hover:bg-paper text-sm"
                  >
                    <span className="font-medium text-ink">{s.full_name}</span>
                    <span className="text-slate ml-2 font-mono text-xs">{s.admission_number}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="certificate-type" className="text-ink">Certificate Type</Label>
            <Select
              id="certificate-type"
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              placeholder="Bonafide Certificate"
              options={[
                { value: "bonafide", label: "Bonafide Certificate" },
                { value: "character", label: "Character Certificate" },
                { value: "transfer", label: "Transfer Certificate" },
                { value: "leaving", label: "Leaving Certificate" },
              ]}
            />
          </div>

          <Button
            onClick={() => issueMutation.mutate()}
            disabled={!selectedStudent}
            isLoading={issueMutation.isPending}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            <Award className="h-4 w-4 mr-2" />
            Issue & Print Certificate
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
