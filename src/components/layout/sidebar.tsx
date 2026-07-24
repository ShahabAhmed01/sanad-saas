"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  BarChart3,
  Trash2,
  CreditCard,
  HelpCircle,
  FileText,
  Award,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const defaultNavItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.staff", href: "/staff", icon: Users },
  { labelKey: "nav.students", href: "/students", icon: GraduationCap },
  { labelKey: "nav.attendance", href: "/attendance", icon: CalendarCheck },
  { labelKey: "nav.fees", href: "/fees", icon: Banknote },
  { labelKey: "nav.exams", href: "/exams", icon: ClipboardList },
  { labelKey: "nav.performance", href: "/performance", icon: BarChart3 },
  { labelKey: "nav.calendar", href: "/calendar", icon: Calendar },
  { labelKey: "nav.library", href: "/library", icon: BookOpen },
  { labelKey: "nav.transport", href: "/transport", icon: Bus },
  { labelKey: "nav.certificates", href: "/certificates", icon: Award },
  { labelKey: "nav.payroll", href: "/payroll", icon: FileText },
  { labelKey: "nav.notifications", href: "/notifications", icon: Bell },
  { labelKey: "nav.trash", href: "/trash", icon: Trash2 },
  { labelKey: "nav.settings", href: "/settings", icon: Settings },
  { labelKey: "nav.profile", href: "/profile", icon: User },
  { labelKey: "nav.billing", href: "/billing", icon: CreditCard },
  { labelKey: "nav.help", href: "/help", icon: HelpCircle },
];

interface SidebarProps {
  items?: NavItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({
  items = defaultNavItems,
  collapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  async function handleLogout() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-ink text-paper-raised transition-all duration-200 ease-in-out sticky top-0",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white font-display font-bold text-sm">
          S
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-semibold tracking-tight">
            Sanad
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-white/60 hover:text-white hover:bg-white/10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User / Logout */}
      <div className="px-2 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          title={collapsed ? t("auth.logout") : undefined}
          aria-label={t("auth.logout")}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t("auth.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
