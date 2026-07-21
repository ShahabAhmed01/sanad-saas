"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, GraduationCap, TrendingUp } from "lucide-react";

interface SchoolStats {
  id: string;
  name: string;
  status: string;
  staff_count: number;
  student_count: number;
  plan_name: string;
  created_at: string;
}

export default function PlatformAdminPage() {
  const [schools, setSchools] = useState<SchoolStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, trialing: 0, active: 0, totalStudents: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: schoolsData } = await supabase
        .from("schools")
        .select("id, name, status, created_at, plans!inner(name)")
        .order("created_at", { ascending: false });

      // Get counts for each school
      const schoolsWithCounts = await Promise.all(
        (schoolsData || []).map(async (school: any) => {
          const [staffRes, studentRes] = await Promise.all([
            supabase.from("staff").select("id", { count: "exact", head: true }).eq("school_id", school.id),
            supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", school.id),
          ]);
          return {
            id: school.id,
            name: school.name,
            status: school.status,
            staff_count: staffRes.count || 0,
            student_count: studentRes.count || 0,
            plan_name: school.plans?.name || "None",
            created_at: school.created_at,
          };
        })
      );

      setSchools(schoolsWithCounts);
      setStats({
        total: schoolsWithCounts.length,
        trialing: schoolsWithCounts.filter((s) => s.status === "trialing").length,
        active: schoolsWithCounts.filter((s) => s.status === "active").length,
        totalStudents: schoolsWithCounts.reduce((sum, s) => sum + s.student_count, 0),
      });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-ink text-paper-raised">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Platform Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-paper-raised/10 border-white/10">
            <CardContent className="p-4">
              <School className="h-5 w-5 text-accent mb-2" />
              <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
              <p className="text-xs text-white/60">Total Schools</p>
            </CardContent>
          </Card>
          <Card className="bg-paper-raised/10 border-white/10">
            <CardContent className="p-4">
              <Clock className="h-5 w-5 text-accent mb-2" />
              <p className="text-2xl font-bold tabular-nums">{stats.trialing}</p>
              <p className="text-xs text-white/60">Trialing</p>
            </CardContent>
          </Card>
          <Card className="bg-paper-raised/10 border-white/10">
            <CardContent className="p-4">
              <Check className="h-5 w-5 text-success mb-2" />
              <p className="text-2xl font-bold tabular-nums">{stats.active}</p>
              <p className="text-xs text-white/60">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-paper-raised/10 border-white/10">
            <CardContent className="p-4">
              <GraduationCap className="h-5 w-5 text-accent mb-2" />
              <p className="text-2xl font-bold tabular-nums">{stats.totalStudents}</p>
              <p className="text-xs text-white/60">Total Students</p>
            </CardContent>
          </Card>
        </div>

        {/* Schools Table */}
        <Card className="bg-paper-raised/10 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-display text-paper-raised">All Schools</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-skeleton" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-white/60 py-2 px-3">School</th>
                      <th className="text-left text-xs text-white/60 py-2 px-3">Status</th>
                      <th className="text-left text-xs text-white/60 py-2 px-3">Plan</th>
                      <th className="text-right text-xs text-white/60 py-2 px-3">Staff</th>
                      <th className="text-right text-xs text-white/60 py-2 px-3">Students</th>
                      <th className="text-left text-xs text-white/60 py-2 px-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => (
                      <tr key={school.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 text-sm font-medium">{school.name}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            school.status === "active" ? "bg-success/20 text-success" :
                            school.status === "trialing" ? "bg-accent/20 text-accent" :
                            "bg-white/10 text-white/60"
                          }`}>
                            {school.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm text-white/60">{school.plan_name}</td>
                        <td className="py-3 px-3 text-sm text-right tabular-nums">{school.staff_count}</td>
                        <td className="py-3 px-3 text-sm text-right tabular-nums">{school.student_count}</td>
                        <td className="py-3 px-3 text-sm text-white/60">
                          {new Date(school.created_at).toLocaleDateString("en-PK")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
