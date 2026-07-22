"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Bus, Plus } from "lucide-react";

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
  const [routes, setRoutes] = useState<Route[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [pickupStop, setPickupStop] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("transport_routes").select("id, name, fare_amount").order("name");
      setRoutes(data || []);
    }
    load();
  }, []);

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

  async function assignStudent() {
    if (!selectedStudent || !selectedRoute) return;
    setLoading(true);
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

    setSuccess(`${selectedStudent.full_name} assigned to route`);
    setSelectedStudent(null);
    setSearch("");
    setPickupStop("");
    setLoading(false);
    setTimeout(() => setSuccess(""), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transport Assignment" description="Assign students to transport routes" />

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
          <CardTitle className="text-lg font-display">Assign Student to Route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search student by name or admission number..."
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
            <Label className="text-ink">Route</Label>
            <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
              <option value="">Select route...</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name} (PKR {Number(r.fare_amount).toLocaleString()}/mo)</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-ink">Pickup Stop</Label>
            <Input value={pickupStop} onChange={(e) => setPickupStop(e.target.value)} placeholder="e.g. Main Road Stop" className="mt-1.5" />
          </div>

          <Button onClick={assignStudent} disabled={loading || !selectedStudent || !selectedRoute} className="w-full bg-accent hover:bg-accent/90 text-white">
            <Bus className="h-4 w-4 mr-2" />
            {loading ? "Assigning..." : "Assign to Route"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
