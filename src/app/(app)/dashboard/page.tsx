"use client";

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
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useI18n } from "@/i18n/provider";

export default function DashboardPage() {
  const { t } = useI18n();
  const { data, isLoading, error } = useDashboardData();

  const stats = data?.stats || {
    totalStudents: 0,
    totalStaff: 0,
    todayAttendance: 0,
    totalFeeCollection: 0,
    pendingFees: 0,
    activeStudents: 0,
  };
  const userName = data?.userName || "";
  const activities = data?.activities || [];
  const upcoming = data?.upcoming || [];
  const attendanceChart = data?.attendanceChart || [];
  const feeChart = data?.feeChart || [];

  const statCards = [
    {
      title: t("dashboard.totalStudents"),
      value: isLoading ? null : String(stats.totalStudents),
      icon: GraduationCap,
      color: "text-accent",
      bg: "bg-accent/10",
      trend: stats.totalStudents > 0 ? `${stats.totalStudents} ${t("dashboard.enrolled")}` : t("dashboard.noStudents"),
      trendUp: stats.totalStudents > 0,
    },
    {
      title: t("dashboard.totalStaff"),
      value: isLoading ? null : String(stats.totalStaff),
      icon: Users,
      color: "text-success",
      bg: "bg-success/10",
      trend: stats.totalStaff > 0 ? `${stats.totalStaff} ${t("dashboard.active")}` : t("dashboard.noStaff"),
      trendUp: stats.totalStaff > 0,
    },
    {
      title: t("dashboard.todayAttendance"),
      value: isLoading ? null : stats.todayAttendance > 0 ? `${stats.todayAttendance}` : "0",
      icon: CalendarCheck,
      color: "text-accent",
      bg: "bg-accent/10",
      trend: stats.todayAttendance > 0 ? t("dashboard.recorded") : t("dashboard.pending"),
      trendUp: stats.todayAttendance > 0,
    },
    {
      title: t("dashboard.feeCollection"),
      value: isLoading ? null : stats.totalFeeCollection > 0 ? `Rs ${stats.totalFeeCollection.toLocaleString()}` : "Rs 0",
      icon: Banknote,
      color: "text-success",
      bg: "bg-success/10",
      trend: stats.pendingFees > 0 ? `${stats.pendingFees} ${t("dashboard.pending")}` : t("dashboard.allClear"),
      trendUp: stats.pendingFees === 0,
    },
  ];

  const quickActions = [
    { label: t("dashboard.markAttendance"), href: "/attendance/mark", icon: CalendarCheck, color: "bg-accent/10 text-accent" },
    { label: t("dashboard.addStudent"), href: "/students", icon: GraduationCap, color: "bg-success/10 text-success" },
    { label: t("dashboard.collectFee"), href: "/fees/collect", icon: Banknote, color: "bg-accent/10 text-accent" },
    { label: t("dashboard.createExam"), href: "/exams/create", icon: FileText, color: "bg-success/10 text-success" },
    { label: t("dashboard.viewReports"), href: "/exams/report-cards", icon: TrendingUp, color: "bg-accent/10 text-accent" },
    { label: t("dashboard.inviteStaff"), href: "/staff/invite", icon: Users, color: "bg-success/10 text-success" },
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeOfDay: string;
    if (hour < 12) timeOfDay = "morning";
    else if (hour < 17) timeOfDay = "afternoon";
    else timeOfDay = "evening";
    return t("dashboard.greeting").replace("{timeOfDay}", timeOfDay);
  };

  const today = (() => {
    try {
      return new Date().toLocaleDateString("en-PK", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  })();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">{t("dashboard.failedToLoad")}</p>
        <p className="text-xs text-slate mt-1">{t("dashboard.failedToLoadDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-accent/10 via-paper-raised to-success/10 rounded-2xl p-6 md:p-8 border border-slate-light">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-slate mt-1">{today}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/attendance/mark">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <CalendarCheck className="h-4 w-4 mr-2" />
                {t("dashboard.markAttendance")}
              </Button>
            </Link>
            <Link href="/fees/collect">
              <Button variant="outline">
                <Banknote className="h-4 w-4 mr-2" />
                {t("dashboard.collectFee")}
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
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink tabular-nums">
                {stat.value === null ? (
                  <div className="h-7 w-20 bg-muted rounded animate-skeleton" />
                ) : (
                  stat.value
                )}
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
              {t("dashboard.quickActions")}
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
              {t("dashboard.recentActivity")}
            </CardTitle>
            <Link href="/audit" className="text-xs text-accent hover:underline">
              {t("common.viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
              {t("dashboard.upcoming")}
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
                <p className="text-sm text-slate">{t("dashboard.noUpcomingEvents")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display text-ink">
              {t("dashboard.alerts")}
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
                      {stats.pendingFees} {t("dashboard.unpaidFees").replace("{count}", String(stats.pendingFees)).replace("{plural}", stats.pendingFees > 1 ? "s" : "")}
                    </p>
                    <p className="text-xs text-slate">{t("dashboard.clickToViewReminders")}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm font-medium text-ink">{t("dashboard.allClear")}</p>
                <p className="text-xs text-slate">{t("dashboard.noPendingAlerts")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display text-ink">
              {t("dashboard.attendanceThisWeek")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 space-y-3">
                <div className="flex items-end gap-2 h-48">
                  {[65, 45, 80, 55, 70, 40, 60].map((h, i) => (
                    <div key={i} className="flex-1 space-y-1">
                      <div className="bg-muted rounded animate-skeleton" style={{ height: `${h}%` }} />
                      <div className="bg-muted rounded animate-skeleton h-3" />
                    </div>
                  ))}
                </div>
              </div>
            ) : attendanceChart.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-slate" />
                    <YAxis tick={{ fontSize: 12 }} className="text-slate" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="present" name={t("dashboard.present")} fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" name={t("dashboard.absent")} fill="var(--color-danger)" radius={[4, 4, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-slate">
                {t("dashboard.noAttendanceData")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee Collection Trend */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display text-ink">
              {t("dashboard.feeCollectionTrend")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 space-y-3">
                <div className="flex items-end gap-2 h-48">
                  {[55, 70, 40, 65, 50, 75].map((h, i) => (
                    <div key={i} className="flex-1 space-y-1">
                      <div className="bg-muted rounded animate-skeleton" style={{ height: `${h}%` }} />
                      <div className="bg-muted rounded animate-skeleton h-3" />
                    </div>
                  ))}
                </div>
              </div>
            ) : feeChart.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feeChart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-slate" />
                    <YAxis tick={{ fontSize: 12 }} className="text-slate" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                      }}
                      formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="collected" name={t("dashboard.collected")} stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-slate">
                {t("dashboard.noFeeData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
