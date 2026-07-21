"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Banknote,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  todayAttendance: number;
  totalFeeCollection: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalStaff: 0,
    todayAttendance: 0,
    totalFeeCollection: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      const [studentsRes, staffRes] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("staff").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalStaff: staffRes.count || 0,
        todayAttendance: 0,
        totalFeeCollection: 0,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: loading ? "—" : String(stats.totalStudents),
      icon: GraduationCap,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Total Staff",
      value: loading ? "—" : String(stats.totalStaff),
      icon: Users,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Today's Attendance",
      value: loading ? "—" : stats.todayAttendance > 0 ? `${stats.todayAttendance}%` : "—",
      icon: CalendarCheck,
      color: "text-ink",
      bg: "bg-ink/10",
    },
    {
      title: "Fee Collection",
      value: loading ? "—" : stats.totalFeeCollection > 0 ? `PKR ${stats.totalFeeCollection.toLocaleString()}` : "—",
      icon: Banknote,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          Dashboard
        </h1>
        <p className="text-slate mt-1">
          Welcome to Sanad. Here&apos;s your school overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-slate-light">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink tabular-nums">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-light">
        <CardHeader>
          <CardTitle className="text-lg font-display text-ink">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <a
              href="/staff"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-light hover:bg-paper transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Manage Staff</p>
                <p className="text-xs text-slate">Add and manage team members</p>
              </div>
            </a>
            <a
              href="/students"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-light hover:bg-paper transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Manage Students</p>
                <p className="text-xs text-slate">Enroll and track students</p>
              </div>
            </a>
            <a
              href="/attendance"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-light hover:bg-paper transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-ink/10 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 text-ink" />
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Attendance</p>
                <p className="text-xs text-slate">Mark today&apos;s attendance</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-light">
        <CardHeader>
          <CardTitle className="text-lg font-display text-ink">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-slate-light mb-3" />
            <p className="text-sm text-slate">
              No recent activity. Start by adding staff and students.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
