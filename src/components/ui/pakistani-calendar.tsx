"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  gregorianToHijri,
  hijriMonths,
  isHoliday,
} from "@/lib/calendar";

interface PakistaniCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export function PakistaniCalendar({
  selectedDate,
  onDateSelect,
  className,
}: PakistaniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Get Hijri for first day of month
  const hijri = gregorianToHijri(year, month + 1, 1);
  const hijriMonthName = hijriMonths[hijri.month - 1] || "";

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className={cn("bg-card rounded-xl border border-border p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-foreground">{monthName}</p>
          <p className="text-xs text-muted-foreground">{hijriMonthName} {hijri.year}</p>
        </div>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const date = new Date(year, month, day);
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const isSelected =
            selectedDate &&
            day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();
          const holiday = isHoliday(date);
          const isFriday = date.getDay() === 5;

          return (
            <button
              key={day}
              onClick={() => onDateSelect?.(date)}
              className={cn(
                "relative w-full aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors",
                isSelected
                  ? "bg-accent text-white"
                  : isToday
                  ? "bg-accent/10 text-accent font-semibold"
                  : holiday.isHoliday
                  ? "bg-danger/10 text-danger"
                  : isFriday
                  ? "bg-success/5 text-success"
                  : "hover:bg-muted text-foreground"
              )}
              title={holiday.isHoliday ? holiday.name : undefined}
            >
              <span>{day}</span>
              {holiday.isHoliday && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-danger" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Friday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
