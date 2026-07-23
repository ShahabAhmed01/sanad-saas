"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, Bus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface Route {
  id: string;
  name: string;
  fare_amount: number;
}

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
}

export default function TransportAssignPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [pickupStop, setPickupStop] = useState("");
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const { t } = useI18n();

  const { data: routes = [], error } = useQuery<Route[]>({
    queryKey: queryKeys.school.transport(schoolId),
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from("transport_routes").select("id, name, fare_amount").order("name");
      return data || [];
    },
    enabled: !!schoolId,
  });

  async function searchStudents() {
    if (!search) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("students")
      .select("id, full_name, admission_number")
      .or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%`)
      .limit(10);
    setStudents(data || []);
  }

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent || !selectedRoute) return;
      const supabase = createClient();

      const { data: existing } = await supabase
        .from("student_transport")
        .select("id")
        .eq("student_id", selectedStudent.id)
        .maybeSingle();

      if (existing) {
        setSuccess(`${selectedStudent.full_name} already assigned to a route — updating...`);
        setTimeout(() => setSuccess(""), 2000);
      }

      await supabase.from("student_transport").upsert({
        student_id: selectedStudent.id,
        route_id: selectedRoute,
        pickup_stop: pickupStop || null,
      });
    },
    onSuccess: () => {
      if (!selectedStudent) return;
      toast.success(t("transport.studentsAssigned", { count: "1" }), { description: `${selectedStudent.full_name} assigned to transport route` });
      setSuccess(`${selectedStudent.full_name} assigned to route`);
      setSelectedStudent(null);
      setSearch("");
      setPickupStop("");
      queryClient.invalidateQueries({ queryKey: queryKeys.school.transport(schoolId) });
      setTimeout(() => setSuccess(""), 2000);
    },
    onError: (error) => {
      toast.error(t("common.error"), { description: error.message });
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t("transport.title"), href: "/transport" }, { label: t("transport.assignRoute") }]} />
      <div className="space-y-6">
      <PageHeader title={t("transport.assignRoute")} description={t("transport.manageRoutes")} />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">{success}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-light max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display">{t("transport.assignStudents")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder={t("common.search")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value.length >= 2) searchStudents(); }}
            />
            {students.length > 0 && (
              <div className="absolute z-10 w-full bg-paper-raised border border-slate-light rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStudent(s); setSearch(s.full_name); setStudents([]); }}
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
            <Label htmlFor="route" className="text-ink">{t("transport.routeName")}</Label>
            <Select id="route" value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder={t("common.selectAnOption")} options={routes.map((r) => ({ value: r.id, label: `${r.name} (PKR ${Number(r.fare_amount).toLocaleString()}/mo)` }))} />
          </div>

          <div>
            <Label htmlFor="pickup-stop" className="text-ink">{t("transport.stops")}</Label>
            <Input id="pickup-stop" value={pickupStop} onChange={(e) => setPickupStop(e.target.value)} placeholder={t("transport.assign.stopPlaceholder")} className="mt-1.5" />
          </div>

          <Button onClick={() => assignMutation.mutate()} isLoading={assignMutation.isPending} disabled={!selectedStudent || !selectedRoute} className="w-full bg-accent hover:bg-accent/90 text-white">
            <Bus className="h-4 w-4 mr-2" />
            {t("transport.assignRoute")}
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
