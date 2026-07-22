"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Banknote,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Bell,
  FileText,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  todayAttendance: number;
  totalFeeCollection: number;
  pendingFees: number;
  activeStudents: number;
}

interface RecentActivity {
  id: string;
  type: "student" | "fee" | "attendance" | "announcement";
  title: string;
  description: string;
  time: string;
}

interface UpcomingEvent {
  id: string;
  type: "exam" | "fee" | "announcement";
  title: string;
  date: string;
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return date.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalStaff: 0,
    todayAttendance: 0,
    totalFeeCollection: 0,
    pendingFees: 0,
    activeStudents: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get school info
      const { data: staff } = await supabase
        .from("staff")
        .select("school_id, schools(name)")
        .eq("id", user.id)
        .single();

      if (!staff) return;
      const schoolId = staff.school_id;
      setSchoolName((staff.schools as any)?.name || "Your School");

      // Parallel fetch all stats
      const [studentsRes, staffRes, feesRes, attendanceRes, pendingFeesRes] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
        supabase.from("staff").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
        supabase.from("fee_payments").select("amount", { count: "exact" }).eq("school_id", schoolId),
        supabase.from("student_attendance").select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("date", new Date().toISOString().split("T")[0]),
        supabase.from("fee_invoices").select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("status", "unpaid"),
      ]);

      // Calculate total fee collection
      const totalCollection = (feesRes.data || []).reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      setStats({
        totalStudents: studentsRes.count || 0,
        totalStaff: staffRes.count || 0,
        todayAttendance: attendanceRes.count || 0,
        totalFeeCollection: totalCollection,
        pendingFees: pendingFeesRes.count || 0,
        activeStudents: studentsRes.count || 0,
      });

      // Load recent activity from audit_logs
      const { data: auditLogs } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, created_at")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (auditLogs && auditLogs.length > 0) {
        const mapped: RecentActivity[] = auditLogs.map((log) => {
          const actionMap: Record<string, { type: RecentActivity["type"]; title: string }> = {
            create: { type: "student", title: "Record created" },
            update: { type: "student", title: "Record updated" },
            delete: { type: "student", title: "Record deleted" },
            fee_payment: { type: "fee", title: "Fee payment recorded" },
            attendance_mark: { type: "attendance", title: "Attendance marked" },
            exam_create: { type: "announcement", title: "Exam created" },
            marks_entry: { type: "announcement", title: "Marks entered" },
          };
          const mapped_action = actionMap[log.action] || { type: "student" as const, title: log.action };
          const timeAgo = getTimeAgo(log.created_at);
          return {
            id: log.id,
            type: mapped_action.type,
            title: mapped_action.title,
            description: `${log.entity_type || "System"} activity`,
            time: timeAgo,
          };
        });
        setActivities(mapped);
      }

      // Load upcoming events from exams and announcements
      const today = new Date().toISOString().split("T")[0];
      const [examsRes, announcementsRes] = await Promise.all([
        supabase
          .from("exams")
          .select("id, name, exam_date, status")
          .eq("school_id", schoolId)
          .gte("exam_date", today)
          .order("exam_date", { ascending: true })
          .limit(3),
        supabase
          .from("announcements")
          .select("id, title, created_at")
          .eq("school_id", schoolId)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      const upcomingEvents: UpcomingEvent[] = [];

      if (examsRes.data) {
        for (const exam of examsRes.data) {
          upcomingEvents.push({
            id: exam.id,
            type: "exam",
            title: exam.name,
            date: formatDateShort(exam.exam_date),
          });
        }
      }

      if (announcementsRes.data) {
        for (const ann of announcementsRes.data) {
          upcomingEvents.push({
            id: ann.id,
            type: "announcement",
            title: ann.title,
            date: getTimeAgo(ann.created_at),
          });
        }
      }

      setUpcoming(upcomingEvents.slice(0, 3));

      setLoading(false);
    }
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: loading ? "—" : String(stats.totalStudents),
      icon: GraduationCap,
      color: "text-accent",
      bg: "bg-accent/10",
      trend: stats.totalStudents > 0 ? `${stats.totalStudents} enrolled` : "No students",
      trendUp: stats.totalStudents > 0,
    },
    {
      title: "Total Staff",
      value: loading ? "—" : String(stats.totalStaff),
      icon: Users,
      color: "text-success",
      bg: "bg-success/10",
      trend: stats.totalStaff > 0 ? `${stats.totalStaff} active` : "No staff",
      trendUp: stats.totalStaff > 0,
    },
    {
      title: "Today's Attendance",
      value: loading ? "—" : stats.todayAttendance > 0 ? `${stats.todayAttendance}` : "—",
      icon: CalendarCheck,
      color: "text-accent",
      bg: "bg-accent/10",
      trend: stats.todayAttendance > 0 ? "Recorded" : "Pending",
      trendUp: stats.todayAttendance > 0,
    },
    {
      title: "Fee Collection",
      value: loading ? "—" : stats.totalFeeCollection > 0 ? `Rs ${stats.totalFeeCollection.toLocaleString()}` : "—",
      icon: Banknote,
      color: "text-success",
      bg: "bg-success/10",
      trend: stats.pendingFees > 0 ? `${stats.pendingFees} pending` : "All clear",
      trendUp: stats.pendingFees === 0,
    },
  ];

  const quickActions = [
    { label: "Mark Attendance", href: "/attendance/mark", icon: CalendarCheck, color: "bg-accent/10 text-accent" },
    { label: "Add Student", href: "/students", icon: GraduationCap, color: "bg-success/10 text-success" },
    { label: "Collect Payment", href: "/fees/collect", icon: Banknote, color: "bg-accent/10 text-accent" },
    { label: "Create Exam", href: "/exams/create", icon: FileText, color: "bg-success/10 text-success" },
    { label: "View Reports", href: "/exams/report-cards", icon: TrendingUp, color: "bg-accent/10 text-accent" },
    { label: "Invite Staff", href: "/staff/invite", icon: Users, color: "bg-success/10 text-success" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "student": return GraduationCap;
      case "fee": return Banknote;
      case "attendance": return CalendarCheck;
      case "announcement": return Bell;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "student": return "bg-accent/10 text-accent";
      case "fee": return "bg-success/10 text-success";
      case "attendance": return "bg-accent/10 text-accent";
      case "announcement": return "bg-success/10 text-success";
      default: return "bg-muted text-slate";
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-accent/10 via-paper-raised to-success/10 rounded-2xl p-6 md:p-8 border border-slate-light">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
              {getGreeting()}, {schoolName}
            </h1>
            <p className="text-slate mt-1">{today}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/attendance/mark">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <CalendarCheck className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </Link>
            <Link href="/fees/collect">
              <Button variant="outline">
                <Banknote className="h-4 w-4 mr-2" />
                Collect Fee
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-slate-light hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate">
                {stat.title}
              </CardTitle>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink tabular-nums">
                {stat.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-danger" />
                )}
                <span className={`text-xs font-medium ${stat.trendUp ? "text-success" : "text-danger"}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display text-ink">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-light hover:border-accent/30 hover:shadow-sm transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-ink">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-light">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display text-ink">
              Recent Activity
            </CardTitle>
            <Link href="/audit" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted animate-skeleton" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted rounded animate-skeleton w-3/4" />
                      <div className="h-2.5 bg-muted rounded animate-skeleton w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{activity.title}</p>
                        <p className="text-xs text-slate truncate">{activity.description}</p>
                      </div>
                      <span className="text-xs text-slate whitespace-nowrap">{activity.time}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display text-ink">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((event, i) => {
                  const Icon = event.type === "exam" ? FileText : Bell;
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        i === 0 ? "bg-accent/5 border border-accent/10" : "bg-muted/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${i === 0 ? "text-accent" : "text-slate"}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink">{event.title}</p>
                        <p className="text-xs text-slate">{event.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-8 w-8 text-slate-light mb-2" />
                <p className="text-sm text-slate">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display text-ink">
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.pendingFees > 0 ? (
              <div className="space-y-3">
                <Link
                  href="/fees"
                  className="flex items-center gap-3 p-3 rounded-xl bg-danger/5 border border-danger/10 hover:bg-danger/10 transition-colors"
                >
                  <AlertCircle className="h-5 w-5 text-danger shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">
                      {stats.pendingFees} unpaid fee{stats.pendingFees > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-slate">Click to view and send reminders</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <CheckCircleIcon className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm font-medium text-ink">All clear!</p>
                <p className="text-xs text-slate">No pending alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
