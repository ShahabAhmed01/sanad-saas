"use client";

import Link from "next/link";
import {
  ClipboardList,
  BookOpen,
  Bus,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

const moreItems = [
  { label: "Exams", href: "/exams", icon: ClipboardList },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "Transport", href: "/transport", icon: Bus },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function MorePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">More</h1>

      <div className="space-y-2">
        {moreItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 rounded-xl bg-paper-raised border border-slate-light hover:bg-paper transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <item.icon className="h-5 w-5 text-slate" />
            </div>
            <span className="font-medium text-ink">{item.label}</span>
          </Link>
        ))}

        <button className="flex items-center gap-4 p-4 rounded-xl bg-paper-raised border border-slate-light hover:bg-paper transition-colors w-full text-left">
          <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-danger" />
          </div>
          <span className="font-medium text-danger">Log out</span>
        </button>
      </div>
    </div>
  );
}
