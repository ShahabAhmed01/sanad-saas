"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Banknote,
  BookOpen,
  Bus,
  ClipboardList,
  Bell,
  Settings,
  ClipboardCheck,
  FileText,
  LogOut,
  User,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// Role-specific nav configurations
export const roleNavItems: Record<string, NavItem[]> = {
  school_admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Staff", href: "/staff", icon: Users },
    { label: "Students", href: "/students", icon: GraduationCap },
    { label: "Take Attendance", href: "/attendance/mark", icon: CalendarCheck },
    { label: "Fees", href: "/fees", icon: Banknote },
    { label: "Exams", href: "/exams", icon: ClipboardList },
    { label: "Report Cards", href: "/exams/report-cards", icon: FileText },
    { label: "Certificates", href: "/certificates", icon: ClipboardList },
    { label: "Library", href: "/library", icon: BookOpen },
    { label: "Transport", href: "/transport", icon: Bus },
    { label: "Audit Log", href: "/audit", icon: ClipboardList },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  teacher: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Classes", href: "/my-classes", icon: GraduationCap },
    { label: "Take Attendance", href: "/attendance/mark", icon: CalendarCheck },
    { label: "Gradebook", href: "/gradebook/entry", icon: ClipboardCheck },
    { label: "Homework", href: "/homework/create", icon: FileText },
    { label: "Leave", href: "/leave", icon: CalendarCheck },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  accountant: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Fee Structure", href: "/fees/structure", icon: Banknote },
    { label: "Generate Invoices", href: "/fees/generate", icon: ClipboardList },
    { label: "Collect Payment", href: "/fees/collect", icon: Banknote },
    { label: "Expenses", href: "/expenses", icon: Banknote },
    { label: "Payroll", href: "/payroll", icon: Users },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  principal: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Staff", href: "/staff", icon: Users },
    { label: "Students", href: "/students", icon: GraduationCap },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Leave Approvals", href: "/leave/pending", icon: CalendarCheck },
    { label: "Exams", href: "/exams", icon: ClipboardList },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  parent: [
    { label: "Dashboard", href: "/parent", icon: LayoutDashboard },
    { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
    { label: "Marks", href: "/parent/marks", icon: ClipboardCheck },
    { label: "Fees", href: "/parent/fees", icon: Banknote },
    { label: "Homework", href: "/parent/homework", icon: FileText },
    { label: "Announcements", href: "/parent/announcements", icon: Bell },
  ],
};

interface SidebarNavProps {
  role?: string;
  collapsed?: boolean;
}

export function SidebarNav({ role = "school_admin", collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();
  const items = roleNavItems[role] || roleNavItems.school_admin;

  return (
    <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
