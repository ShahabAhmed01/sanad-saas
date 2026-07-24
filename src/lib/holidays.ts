export interface Holiday {
  name: string;
  date: string;
  nameUrdu: string;
}

export const PAKISTANI_HOLIDAYS: Holiday[] = [
  { name: "Kashmir Day", date: "2026-02-05", nameUrdu: "یوم کشمیر" },
  { name: "Pakistan Day", date: "2026-03-23", nameUrdu: "یوم پاکستان" },
  { name: "Labour Day", date: "2026-05-01", nameUrdu: "یوم مزدور" },
  { name: "Independence Day", date: "2026-08-14", nameUrdu: "یوم آزادی" },
  { name: "Iqbal Day", date: "2026-11-09", nameUrdu: "یوم اقبال" },
  { name: "Quaid-e-Azam Day", date: "2026-12-25", nameUrdu: "یوم قائد اعظم" },
];

export function getIslamicHolidays(year: number): Holiday[] {
  return [
    { name: "Eid ul Fitr", date: `${year}-03-30`, nameUrdu: "عید الفطر" },
    { name: "Eid ul Adha", date: `${year}-06-06`, nameUrdu: "عید الاضحیٰ" },
    { name: "Ashura", date: `${year}-06-25`, nameUrdu: "عاشوراء" },
    { name: "Eid Milad un Nabi", date: `${year}-09-05`, nameUrdu: "عید میلاد النبی" },
  ];
}

export function getHolidayForDate(date: string): Holiday | null {
  const year = new Date(date).getFullYear();
  const allHolidays = [...PAKISTANI_HOLIDAYS, ...getIslamicHolidays(year)];
  return allHolidays.find((h) => h.date === date) || null;
}

export function getHolidaysForMonth(year: number, month: number): Holiday[] {
  const allHolidays = [...PAKISTANI_HOLIDAYS, ...getIslamicHolidays(year)];
  return allHolidays.filter((h) => {
    const d = new Date(h.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}
