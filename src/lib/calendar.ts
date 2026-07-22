/**
 * Pakistani Academic Calendar
 * Supports Gregorian + Hijri (Islamic) dual calendar
 * Pre-populated with Pakistani national and religious holidays
 */

// Hijri month names in Urdu
export const hijriMonths = [
  "محرم",
  "صفر",
  "ربیع الاول",
  "ربیع الثانی",
  "جمادی الاولی",
  "جمادی الثانی",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذی القعدۃ",
  "ذی الحجۃ",
];

// Hijri month names in English
export const hijriMonthsEn = [
  "Muharram",
  "Safar",
  "Rabi ul Awwal",
  "Rabi ul Thani",
  "Jamadi ul Awwal",
  "Jamadi ul Thani",
  "Rajab",
  "Shaban",
  "Ramadan",
  "Shawwal",
  "Dhul Qadah",
  "Dhul Hijjah",
];

// Pakistani national holidays (fixed Gregorian dates)
export const nationalHolidays = [
  { month: 2, day: 5, name: "Kashmir Day", nameUrdu: "یوم کشمیر" },
  { month: 3, day: 23, name: "Pakistan Day", nameUrdu: "یوم پاکستان" },
  { month: 5, day: 1, name: "Labour Day", nameUrdu: "یوم مزدور" },
  { month: 8, day: 14, name: "Independence Day", nameUrdu: "یوم آزادی" },
  { month: 11, day: 9, name: "Iqbal Day", nameUrdu: "یوم اقبال" },
  { month: 11, day: 25, name: "Quaid-e-Azam Day", nameUrdu: "یوم قائد اعظم" },
];

// Islamic holidays (approximate - these shift each year)
// We calculate them based on common Hijri dates
export interface IslamicHoliday {
  hijriMonth: number;
  hijriDay: number;
  name: string;
  nameUrdu: string;
  duration: number; // days
}

export const islamicHolidays: IslamicHoliday[] = [
  {
    hijriMonth: 1,
    hijriDay: 1,
    name: "Islamic New Year",
    nameUrdu: "نئا سال",
    duration: 1,
  },
  {
    hijriMonth: 1,
    hijriDay: 10,
    name: "Ashura",
    nameUrdu: "عاشوراء",
    duration: 1,
  },
  {
    hijriMonth: 3,
    hijriDay: 12,
    name: "Eid Milad un Nabi",
    nameUrdu: "عید میلاد النبی",
    duration: 1,
  },
  {
    hijriMonth: 7,
    hijriDay: 27,
    name: "Shab-e-Meraj",
    nameUrdu: "شبِ معراج",
    duration: 1,
  },
  {
    hijriMonth: 8,
    hijriDay: 15,
    name: "Shab-e-Barat",
    nameUrdu: "شبِ برات",
    duration: 1,
  },
  {
    hijriMonth: 9,
    hijriDay: 1,
    name: "Ramadan Starts",
    nameUrdu: "رمضان شروع",
    duration: 1,
  },
  {
    hijriMonth: 9,
    hijriDay: 27,
    name: "Shab-e-Qadr",
    nameUrdu: "شبِ قدر",
    duration: 1,
  },
  {
    hijriMonth: 10,
    hijriDay: 1,
    name: "Eid ul Fitr",
    nameUrdu: "عید الفطر",
    duration: 3,
  },
  {
    hijriMonth: 12,
    hijriDay: 10,
    name: "Eid ul Adha",
    nameUrdu: "عید الأضحیٰ",
    duration: 3,
  },
];

/**
 * Approximate Gregorian to Hijri conversion
 * Uses the Tabular Islamic Calendar algorithm
 * Note: This is an approximation — for precise dates, use an API
 */
export function gregorianToHijri(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number } {
  // Julian Day Number
  const jd =
    Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor(
      (367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12
    ) -
    Math.floor(
      (3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) /
        4
    ) +
    day -
    32075;

  // Hijri date from JD
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
    Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const remainderJ = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;

  const hijriMonth = Math.floor((24 * remainderJ) / 709);
  const hijriDay = remainderJ - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return {
    year: hijriYear,
    month: hijriMonth,
    day: hijriDay,
  };
}

/**
 * Format a date in Pakistani style (DD/MM/YYYY)
 */
export function formatPakistaniDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format a date with Hijri
 */
export function formatDateWithHijri(date: Date): string {
  const greg = formatPakistaniDate(date);
  const hijri = gregorianToHijri(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  const hijriMonthName = hijriMonths[hijri.month - 1] || "";
  return `${greg} | ${hijri.day} ${hijriMonthName} ${hijri.year}`;
}

/**
 * Get PKR formatted amount
 */
export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

/**
 * Get day of week in Urdu
 */
export const urduDays = [
  "اتوار", // Sunday
  "پیر", // Monday
  "منگل", // Tuesday
  "بدھ", // Wednesday
  "جمعرات", // Thursday
  "جمعہ", // Friday
  "ہفتہ", // Saturday
];

/**
 * Get day of week in English
 */
export const englishDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date): { isHoliday: boolean; name?: string; nameUrdu?: string } {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Check national holidays
  const national = nationalHolidays.find(
    (h) => h.month === month && h.day === day
  );
  if (national) {
    return { isHoliday: true, name: national.name, nameUrdu: national.nameUrdu };
  }

  // Check Islamic holidays (approximate)
  const hijri = gregorianToHijri(date.getFullYear(), month, day);
  const islamic = islamicHolidays.find(
    (h) => h.hijriMonth === hijri.month && h.hijriDay === hijri.day
  );
  if (islamic) {
    return { isHoliday: true, name: islamic.name, nameUrdu: islamic.nameUrdu };
  }

  return { isHoliday: false };
}

/**
 * Approximate Hijri to Gregorian conversion
 * Uses Tabular Islamic Calendar: Hijri → JD → Gregorian
 */
export function hijriToGregorian(
  hYear: number,
  hMonth: number,
  hDay: number
): { year: number; month: number; day: number } {
  // Step 1: Hijri → Julian Day Number
  const jd = Math.floor((11 * hYear + 3) / 30) +
    354 * hYear +
    30 * hMonth -
    Math.floor((hMonth - 1) / 2) +
    hDay +
    1948440 - 385;

  // Step 2: Julian Day Number → Gregorian
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}

/**
 * Get all holidays for a year
 */
export function getYearHolidays(year: number): Array<{
  date: Date;
  name: string;
  nameUrdu: string;
  type: "national" | "islamic";
}> {
  const holidays: Array<{
    date: Date;
    name: string;
    nameUrdu: string;
    type: "national" | "islamic";
  }> = [];

  // National holidays
  for (const h of nationalHolidays) {
    holidays.push({
      date: new Date(year, h.month - 1, h.day),
      name: h.name,
      nameUrdu: h.nameUrdu,
      type: "national",
    });
  }

  // Islamic holidays — convert Hijri dates to Gregorian for this year
  // Use a reference: 1 Muharram 1446 AH ≈ 7 July 2024 CE
  const refHijriYear = 1446;
  const refGregorian = new Date(2024, 6, 7); // July 7, 2024

  for (const h of islamicHolidays) {
    // Calculate approximate Hijri year for this Gregorian year
    // Islamic year is ~354 days, so ~0.97 of a Gregorian year
    const hijriYear = refHijriYear + Math.floor((year - 2024) * (354 / 365.25));

    try {
      const greg = hijriToGregorian(hijriYear, h.hijriMonth, h.hijriDay);
      const date = new Date(greg.year, greg.month - 1, greg.day);

      // Only include if the date falls within the requested year (with tolerance)
      if (Math.abs(date.getFullYear() - year) <= 1) {
        holidays.push({
          date,
          name: h.name,
          nameUrdu: h.nameUrdu,
          type: "islamic",
        });
      }
    } catch {
      // Skip if conversion fails
    }
  }

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}
