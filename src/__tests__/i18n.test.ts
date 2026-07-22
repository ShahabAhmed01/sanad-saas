import { describe, it, expect } from "vitest";
import { locales, localeNames, localeDirections, defaultLocale } from "@/i18n/config";

describe("i18n Configuration", () => {
  it("has 2 locales", () => {
    expect(locales).toHaveLength(2);
    expect(locales).toContain("en");
    expect(locales).toContain("ur");
  });

  it("has English locale name", () => {
    expect(localeNames.en).toBe("English");
  });

  it("has Urdu locale name", () => {
    expect(localeNames.ur).toBe("اردو");
  });

  it("English is LTR", () => {
    expect(localeDirections.en).toBe("ltr");
  });

  it("Urdu is RTL", () => {
    expect(localeDirections.ur).toBe("rtl");
  });

  it("default locale is English", () => {
    expect(defaultLocale).toBe("en");
  });
});
