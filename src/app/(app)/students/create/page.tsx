"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

export default function CreateStudentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const { t } = useI18n();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    father_name: "",
    admission_number: "",
    gender: "",
    date_of_birth: "",
    contact_number: "",
    address: "",
  });

  const { data: classes = [], error: classesError } = useQuery<ClassOption[]>({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("classes")
        .select("id, name, sections(id, name)")
        .eq("school_id", schoolId)
        .order("name");
      return data || [];
    },
    enabled: !!schoolId,
  });

  const createStudent = useMutation({
    mutationFn: async (studentData: typeof formData & { section_id: string | null }) => {
      const supabase = createClient();
      const { error } = await supabase.from("students").insert({
        school_id: schoolId,
        full_name: studentData.full_name,
        father_name: studentData.father_name,
        admission_number: studentData.admission_number,
        gender: studentData.gender,
        date_of_birth: studentData.date_of_birth || null,
        contact_number: studentData.contact_number,
        address: studentData.address,
        section_id: studentData.section_id,
        status: "active",
        admission_date: new Date().toISOString().split("T")[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.students(schoolId) });
      toast.success(t("students.studentCreated"), {
        description: `${formData.full_name} has been enrolled successfully.`,
      });
      router.push("/students");
    },
    onError: (err: Error) => {
      toast.error(t("common.error"), {
        description: err.message,
      });
    },
  });

  const selectedClassData = classes.find(c => c.id === selectedClass);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createStudent.mutate({
      ...formData,
      section_id: selectedSection || null,
    });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("students.title"), href: "/students" }, { label: t("students.addStudent") }]} />

      <PageHeader
        title={t("students.addStudent")}
        description={t("students.createStudentDesc")}
        action={
          <Button variant="outline" onClick={() => router.push("/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")} {t("students.title")}
          </Button>
        }
      />

      {classesError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
          <p className="text-xs text-slate mt-1">{classesError.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("students.createStudent")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="text-ink">{t("students.studentName")} *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(f => ({ ...f, full_name: e.target.value }))}
                  placeholder={t("students.create.studentNamePlaceholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="father_name" className="text-ink">{t("students.fatherName")} *</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => setFormData(f => ({ ...f, father_name: e.target.value }))}
                  placeholder={t("students.create.fatherNamePlaceholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admission_number" className="text-ink">{t("students.admissionNo")} *</Label>
                <Input
                  id="admission_number"
                  value={formData.admission_number}
                  onChange={(e) => setFormData(f => ({ ...f, admission_number: e.target.value }))}
                  placeholder={t("students.create.admissionNoPlaceholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-ink">{t("students.gender")} *</Label>
                <Select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(f => ({ ...f, gender: e.target.value }))}
                  className="mt-1.5"
                  placeholder={t("students.create.selectGender")}
                  required
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth" className="text-ink">{t("students.dateOfBirth")}</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(f => ({ ...f, date_of_birth: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact_number" className="text-ink">{t("students.contact")}</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData(f => ({ ...f, contact_number: e.target.value }))}
                  placeholder={t("students.create.contactPlaceholder")}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-ink">{t("common.address")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
                placeholder={t("students.create.addressPlaceholder")}
                className="mt-1.5"
              />
            </div>

            <div className="border-t border-slate-light pt-4">
              <h3 className="text-sm font-medium text-ink mb-3">{t("students.class")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class" className="text-ink">{t("students.class")}</Label>
                  <Select
                    id="class"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSection("");
                    }}
                    className="mt-1.5"
                    placeholder={t("students.create.selectClass")}
                    options={classes.map(c => ({ value: c.id, label: c.name }))}
                  />
                </div>
                <div>
                  <Label htmlFor="section" className="text-ink">{t("students.section")}</Label>
                  <Select
                    id="section"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="mt-1.5"
                    placeholder={t("students.create.selectSection")}
                    options={(selectedClassData?.sections || []).map(s => ({ value: s.id, label: s.name }))}
                    disabled={!selectedClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/students")}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" isLoading={createStudent.isPending} className="bg-accent hover:bg-accent/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                {t("students.addStudent")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
