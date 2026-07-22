"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Locale, defaultLocale, localeDirections } from "./config";
import en from "./en.json";
import ur from "./ur.json";

const translations = { en, ur } as const;

type TranslationKey = string;

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? path;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sanad-locale") as Locale) || defaultLocale;
    }
    return defaultLocale;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("sanad-locale", newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = localeDirections[newLocale];
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const value = getNestedValue(translations[locale], key);
      if (!params) return value;
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), v),
        value
      );
    },
    [locale]
  );

  const dir = localeDirections[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback for components outside provider
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: (key: string) => key,
      dir: "ltr" as const,
    };
  }
  return context;
}
