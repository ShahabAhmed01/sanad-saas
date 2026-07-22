"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface DashboardData {
  schoolId: string;
  userName: string;
  schoolName: string;
  stats: {
    totalStudents: number;
    totalStaff: number;
    todayAttendance: number;
    totalFeeCollection: number;
    pendingFees: number;
    activeStudents: number;
  };
  activities: Array<{
    id: string;
    type: "student" | "fee" | "attendance" | "announcement";
    title: string;
    description: string;
    time: string;
  }>;
  upcoming: Array<{
    id: string;
    type: "exam" | "fee" | "announcement";
    title: string;
    date: string;
  }>;
  attendanceChart: Array<{
    day: string;
    present: number;
    absent: number;
  }>;
  feeChart: Array<{
    month: string;
    collected: number;
  }>;
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  try {
    return date.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
  } catch {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
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

async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: staff } = await supabase
    .from("staff")
    .select("school_id, full_name, schools(name)")
    .eq("id", user.id)
    .single();

  if (!staff) throw new Error("Staff not found");
  const schoolId = staff.school_id;
  const schoolData = Array.isArray(staff.schools)
    ? (staff.schools as { name: string }[])[0]
    : null;

  const [
    studentsRes,
    staffRes,
    feesRes,
    attendanceRes,
    pendingFeesRes,
    auditLogsRes,
    examsRes,
    announcementsRes,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId),
    supabase
      .from("staff")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId),
    supabase
      .from("fee_payments")
      .select("amount")
      .eq("school_id", schoolId),
    supabase
      .from("student_attendance")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("date", new Date().toISOString().split("T")[0]),
    supabase
      .from("fee_invoices")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "unpaid"),
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("exams")
      .select("id, name, starts_on, ends_on, status")
      .eq("school_id", schoolId)
      .gte("ends_on", new Date().toISOString().split("T")[0])
      .order("starts_on", { ascending: true })
      .limit(3),
    supabase
      .from("announcements")
      .select("id, title, created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const totalCollection = (feesRes.data || []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const stats = {
    totalStudents: studentsRes.count || 0,
    totalStaff: staffRes.count || 0,
    todayAttendance: attendanceRes.count || 0,
    totalFeeCollection: totalCollection,
    pendingFees: pendingFeesRes.count || 0,
    activeStudents: studentsRes.count || 0,
  };

  const actionMap: Record<
    string,
    { type: "student" | "fee" | "attendance" | "announcement"; title: string }
  > = {
    create: {
      type: "student",
      title: `New student created`,
    },
    update: { type: "student", title: `Record updated` },
    delete: { type: "student", title: `Record removed` },
    fee_payment: { type: "fee", title: "Fee payment recorded" },
    attendance_mark: { type: "attendance", title: "Attendance marked" },
    exam_create: { type: "announcement", title: "New exam scheduled" },
    marks_entry: { type: "announcement", title: "Exam marks entered" },
  };

  const activities = (auditLogsRes.data || []).map((log) => {
    const mapped =
      actionMap[log.action] || {
        type: "student" as const,
        title: `${log.action.replace(/_/g, " ")}`,
      };
    return {
      id: log.id,
      type: mapped.type,
      title: mapped.title,
      description: `${log.entity_type || "System"} activity`,
      time: getTimeAgo(log.created_at),
    };
  });

  const upcomingEvents: Array<{
    id: string;
    type: "exam" | "fee" | "announcement";
    title: string;
    date: string;
  }> = [];

  if (examsRes.data) {
    for (const exam of examsRes.data) {
      upcomingEvents.push({
        id: exam.id,
        type: "exam",
        title: exam.name,
        date: formatDateShort(exam.starts_on),
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

  // Attendance chart (last 7 days)
  const attendanceChart: Array<{ day: string; present: number; absent: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const { count: presentCount } = await supabase
      .from("student_attendance")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("date", dateStr)
      .eq("status", "present");
    attendanceChart.push({
      day: dayLabel,
      present: presentCount || 0,
      absent: Math.max(0, stats.totalStudents - (presentCount || 0)),
    });
  }

  // Fee chart (last 6 months)
  const feeChart: Array<{ month: string; collected: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthLabel = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    const month = d.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
    const { data: monthPayments } = await supabase
      .from("fee_payments")
      .select("amount")
      .eq("school_id", schoolId)
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);
    const collected = (monthPayments || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );
    feeChart.push({ month: monthLabel, collected });
  }

  return {
    schoolId,
    userName: staff.full_name || "Admin",
    schoolName: schoolData?.name || "Your School",
    stats,
    activities,
    upcoming: upcomingEvents.slice(0, 3),
    attendanceChart,
    feeChart,
  };
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 60 * 1000,
  });
}
