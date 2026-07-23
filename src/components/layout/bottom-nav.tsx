"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  MoreHorizontal,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface BottomNavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const defaultBottomNavItems: BottomNavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.staff", href: "/staff", icon: Users },
  { labelKey: "nav.students", href: "/students", icon: GraduationCap },
  { labelKey: "nav.attendance", href: "/attendance", icon: CalendarCheck },
  { labelKey: "nav.more", href: "/more", icon: MoreHorizontal },
];

interface BottomNavProps {
  items?: BottomNavItem[];
}

export function BottomNav({ items = defaultBottomNavItems }: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper-raised border-t border-slate-light safe-area-inset-bottom" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors min-w-[64px]",
                isActive ? "text-accent" : "text-slate hover:text-ink hover:bg-muted rounded-lg"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
