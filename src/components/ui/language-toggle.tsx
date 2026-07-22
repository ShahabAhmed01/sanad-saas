"use client";

import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import { localeNames, type Locale } from "@/i18n/config";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  const toggle = () => {
    const next: Locale = locale === "en" ? "ur" : "en";
    setLocale(next);
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors",
        locale === "ur" && "font-[Noto_Nastaliq_Urdu]",
        className
      )}
      title={locale === "en" ? "اردو میں تبدیل کریں" : "Switch to English"}
    >
      <Globe className="h-4 w-4 text-slate" />
      <span className="text-foreground">{localeNames[locale]}</span>
    </button>
  );
}
