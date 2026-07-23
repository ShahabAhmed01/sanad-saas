"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import { getLastVisitedPath } from "@/hooks/use-smart-defaults";
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
} from "lucide-react";

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const roleNavKeys: Record<string, NavItem[]> = {
  school_admin: [
    { labelKey: "sidebar-nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { labelKey: "sidebar-nav.staff", href: "/staff", icon: Users },
    { labelKey: "sidebar-nav.students", href: "/students", icon: GraduationCap },
    { labelKey: "sidebar-nav.takeAttendance", href: "/attendance/mark", icon: CalendarCheck },
    { labelKey: "sidebar-nav.fees", href: "/fees", icon: Banknote },
    { labelKey: "sidebar-nav.exams", href: "/exams", icon: ClipboardList },
    { labelKey: "sidebar-nav.reportCards", href: "/exams/report-cards", icon: FileText },
    { labelKey: "sidebar-nav.certificates", href: "/certificates", icon: ClipboardList },
    { labelKey: "sidebar-nav.library", href: "/library", icon: BookOpen },
    { labelKey: "sidebar-nav.transport", href: "/transport", icon: Bus },
    { labelKey: "sidebar-nav.auditLog", href: "/audit", icon: ClipboardList },
    { labelKey: "sidebar-nav.notifications", href: "/notifications", icon: Bell },
    { labelKey: "sidebar-nav.settings", href: "/settings", icon: Settings },
  ],
  teacher: [
    { labelKey: "sidebar-nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { labelKey: "sidebar-nav.myClasses", href: "/my-classes", icon: GraduationCap },
    { labelKey: "sidebar-nav.takeAttendance", href: "/attendance/mark", icon: CalendarCheck },
    { labelKey: "sidebar-nav.gradebook", href: "/gradebook/entry", icon: ClipboardCheck },
    { labelKey: "sidebar-nav.homework", href: "/homework/create", icon: FileText },
    { labelKey: "sidebar-nav.leave", href: "/leave", icon: CalendarCheck },
    { labelKey: "sidebar-nav.notifications", href: "/notifications", icon: Bell },
  ],
  accountant: [
    { labelKey: "sidebar-nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { labelKey: "sidebar-nav.feeStructure", href: "/fees/structure", icon: Banknote },
    { labelKey: "sidebar-nav.generateInvoices", href: "/fees/generate", icon: ClipboardList },
    { labelKey: "sidebar-nav.collectPayment", href: "/fees/collect", icon: Banknote },
    { labelKey: "sidebar-nav.expenses", href: "/expenses", icon: Banknote },
    { labelKey: "sidebar-nav.payroll", href: "/payroll", icon: Users },
    { labelKey: "sidebar-nav.notifications", href: "/notifications", icon: Bell },
  ],
  principal: [
    { labelKey: "sidebar-nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { labelKey: "sidebar-nav.staff", href: "/staff", icon: Users },
    { labelKey: "sidebar-nav.students", href: "/students", icon: GraduationCap },
    { labelKey: "sidebar-nav.attendance", href: "/attendance", icon: CalendarCheck },
    { labelKey: "sidebar-nav.leaveApprovals", href: "/leave/pending", icon: CalendarCheck },
    { labelKey: "sidebar-nav.exams", href: "/exams", icon: ClipboardList },
    { labelKey: "sidebar-nav.notifications", href: "/notifications", icon: Bell },
  ],
  parent: [
    { labelKey: "sidebar-nav.dashboard", href: "/parent", icon: LayoutDashboard },
    { labelKey: "sidebar-nav.attendance", href: "/parent/attendance", icon: CalendarCheck },
    { labelKey: "sidebar-nav.marks", href: "/parent/marks", icon: ClipboardCheck },
    { labelKey: "sidebar-nav.fees", href: "/parent/fees", icon: Banknote },
    { labelKey: "sidebar-nav.homework", href: "/parent/homework", icon: FileText },
    { labelKey: "sidebar-nav.announcements", href: "/parent/announcements", icon: Bell },
  ],
};

interface SidebarNavProps {
  role?: string;
  collapsed?: boolean;
}

export function SidebarNav({ role = "school_admin", collapsed = false }: SidebarNavProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const navKeys = roleNavKeys[role] || roleNavKeys.school_admin;
  const items = navKeys.map((item) => ({ ...item, label: t(item.labelKey) }));

  return (
    <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              const mod = item.href.split("/").filter(Boolean)[0];
              if (mod) {
                const lastVisited = getLastVisitedPath(mod);
                if (lastVisited && lastVisited !== item.href && lastVisited.startsWith(item.href)) {
                  e.preventDefault();
                  router.push(lastVisited);
                }
              }
            }}
            aria-current={isActive ? "page" : undefined}
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
