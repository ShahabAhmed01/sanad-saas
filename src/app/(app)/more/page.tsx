"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  BookOpen,
  Bus,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useI18n } from "@/i18n/provider";

export default function MorePage() {
  const { t } = useI18n();
  const router = useRouter();
  const moreItems = [
    { label: t("more.exams"), href: "/exams", icon: ClipboardList },
    { label: t("more.library"), href: "/library", icon: BookOpen },
    { label: t("more.transport"), href: "/transport", icon: Bus },
    { label: t("more.notifications"), href: "/notifications", icon: Bell },
    { label: t("more.settings"), href: "/settings", icon: Settings },
  ];
  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.more") }]} />
      <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">{t("more.title")}</h1>

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

        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
          }}
          className="flex items-center gap-4 p-4 rounded-xl bg-paper-raised border border-slate-light hover:bg-paper transition-colors w-full text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-danger" />
          </div>
          <span className="font-medium text-danger">{t("more.logout")}</span>
        </button>
      </div>
    </div>
    </>
  );
}
