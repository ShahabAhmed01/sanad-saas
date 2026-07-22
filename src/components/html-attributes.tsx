"use client";

import { useEffect } from "react";
import { directionMap } from "@/i18n/config";

export function HtmlAttributes() {
  useEffect(() => {
    const stored = localStorage.getItem("sanad-locale");
    const validLocales = ["en", "ur"] as const;
    const locale: string = (stored && validLocales.includes(stored as typeof validLocales[number])) ? stored : "en";
    document.documentElement.lang = locale;
    document.documentElement.dir = directionMap[locale as keyof typeof directionMap] || "ltr";
  }, []);

  return null;
}
