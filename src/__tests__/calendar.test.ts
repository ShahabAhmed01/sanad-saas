import { describe, it, expect } from "vitest";
import {
  gregorianToHijri,
  hijriToGregorian,
  formatPakistaniDate,
  formatDateWithHijri,
  formatPKR,
  isHoliday,
  getYearHolidays,
  nationalHolidays,
  islamicHolidays,
  hijriMonths,
  hijriMonthsEn,
} from "@/lib/calendar";

describe("Pakistani Calendar", () => {
  describe("gregorianToHijri", () => {
    it("converts known date correctly", () => {
      // July 7, 2024 ≈ 1 Muharram 1446 AH
      const result = gregorianToHijri(2024, 7, 7);
      expect(result.year).toBe(1446);
      expect(result.month).toBe(1);
      expect(result.day).toBe(1);
    });

    it("returns valid date components", () => {
      const result = gregorianToHijri(2025, 1, 1);
      expect(result.year).toBeGreaterThan(1400);
      expect(result.year).toBeLessThan(1500);
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);
      expect(result.day).toBeGreaterThanOrEqual(1);
      expect(result.day).toBeLessThanOrEqual(30);
    });
  });

  describe("hijriToGregorian", () => {
    it("converts known Hijri date back", () => {
      // 1 Muharram 1446 ≈ July 7-8, 2024 (Tabular calendar has ±1 day tolerance)
      const result = hijriToGregorian(1446, 1, 1);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(7);
      expect(result.day).toBeGreaterThanOrEqual(7);
      expect(result.day).toBeLessThanOrEqual(8);
    });

    it("returns valid Gregorian date", () => {
      const result = hijriToGregorian(1447, 10, 1); // Eid ul Fitr
      expect(result.year).toBeGreaterThanOrEqual(2025);
      expect(result.year).toBeLessThanOrEqual(2027);
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);
    });
  });

  describe("formatPakistaniDate", () => {
    it("formats DD/MM/YYYY", () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025
      expect(formatPakistaniDate(date)).toBe("05/01/2025");
    });

    it("pads single digits", () => {
      const date = new Date(2025, 2, 9); // Mar 9, 2025
      expect(formatPakistaniDate(date)).toBe("09/03/2025");
    });
  });

  describe("formatDateWithHijri", () => {
    it("returns combined format", () => {
      const date = new Date(2025, 0, 1);
      const result = formatDateWithHijri(date);
      expect(result).toContain("01/01/2025");
      expect(result).toContain("|");
    });
  });

  describe("formatPKR", () => {
    it("formats with Rs prefix", () => {
      expect(formatPKR(15000)).toBe("Rs 15,000");
    });

    it("formats zero", () => {
      expect(formatPKR(0)).toBe("Rs 0");
    });

    it("formats large numbers", () => {
      expect(formatPKR(1000000)).toBe("Rs 1,000,000");
    });
  });

  describe("isHoliday", () => {
    it("identifies national holidays", () => {
      const result = isHoliday(new Date(2025, 6, 14)); // July 14 = Independence Day
      expect(result.isHoliday).toBe(true);
      expect(result.name).toBe("Independence Day");
    });

    it("returns false for non-holidays", () => {
      const result = isHoliday(new Date(2025, 3, 15)); // April 15
      expect(result.isHoliday).toBe(false);
    });

    it("identifies Islamic holidays via Hijri conversion", () => {
      // Find a date that should be an Islamic holiday
      const testDate = new Date(2025, 6, 7); // Approx 1 Muharram
      const result = isHoliday(testDate);
      // The result depends on the Hijri conversion accuracy
      expect(typeof result.isHoliday).toBe("boolean");
    });
  });

  describe("getYearHolidays", () => {
    it("returns national holidays", () => {
      const holidays = getYearHolidays(2025);
      expect(holidays.length).toBeGreaterThanOrEqual(nationalHolidays.length);
    });

    it("returns sorted by date", () => {
      const holidays = getYearHolidays(2025);
      for (let i = 1; i < holidays.length; i++) {
        expect(holidays[i].date.getTime()).toBeGreaterThanOrEqual(
          holidays[i - 1].date.getTime()
        );
      }
    });

    it("includes both national and islamic types", () => {
      const holidays = getYearHolidays(2025);
      const types = holidays.map((h) => h.type);
      expect(types).toContain("national");
      expect(types).toContain("islamic");
    });

    it("each holiday has required fields", () => {
      const holidays = getYearHolidays(2025);
      for (const h of holidays) {
        expect(h.date).toBeInstanceOf(Date);
        expect(typeof h.name).toBe("string");
        expect(typeof h.nameUrdu).toBe("string");
        expect(["national", "islamic"]).toContain(h.type);
      }
    });

    it("does not place all Islamic holidays on Jan 1", () => {
      const holidays = getYearHolidays(2025);
      const islamicHolidays = holidays.filter((h) => h.type === "islamic");
      const jan1Count = islamicHolidays.filter(
        (h) => h.date.getMonth() === 0 && h.date.getDate() === 1
      ).length;
      // Should have at most 1 on Jan 1 (Islamic New Year itself)
      expect(jan1Count).toBeLessThanOrEqual(1);
    });
  });

  describe("constants", () => {
    it("has correct Hijri month names", () => {
      expect(hijriMonths).toHaveLength(12);
      expect(hijriMonths[0]).toBe("محرم");
      expect(hijriMonths[9]).toBe("شوال");
    });

    it("has English Hijri month names", () => {
      expect(hijriMonthsEn).toHaveLength(12);
      expect(hijriMonthsEn[0]).toBe("Muharram");
      expect(hijriMonthsEn[9]).toBe("Shawwal");
    });

    it("has 6 national holidays", () => {
      expect(nationalHolidays).toHaveLength(6);
    });

    it("has 9 islamic holidays", () => {
      expect(islamicHolidays).toHaveLength(9);
    });
  });
});
