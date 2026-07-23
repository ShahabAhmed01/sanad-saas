import { defaultLocale, type Locale } from "./config";
import en from "./en.json";
import ur from "./ur.json";

const translations = { en, ur } as const;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return (path.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], obj) as string) ?? path;
}

export function getTranslations(locale: Locale = defaultLocale) {
  return (key: string, params?: Record<string, string>): string => {
    const value = getNestedValue(translations[locale], key);
    if (!params) return value;
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), v),
      value
    );
  };
}
