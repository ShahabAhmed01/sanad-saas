"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardCheck,
  Banknote,
  FileText,
  Bell,
  LogOut,
} from "lucide-react";

const parentNav = [
  { label: "Dashboard", href: "/parent", icon: LayoutDashboard },
  { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
  { label: "Marks", href: "/parent/marks", icon: ClipboardCheck },
  { label: "Fees", href: "/parent/fees", icon: Banknote },
  { label: "Homework", href: "/parent/homework", icon: FileText },
  { label: "Announcements", href: "/parent/announcements", icon: Bell },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-paper-raised border-b border-slate-light">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-white font-display font-bold text-xs">
              S
            </div>
            <span className="font-display text-base font-semibold text-ink">
              Parent Portal
            </span>
          </div>
          <button className="text-sm text-slate hover:text-ink flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="border-b border-slate-light bg-paper-raised">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {parentNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/parent" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-slate hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
