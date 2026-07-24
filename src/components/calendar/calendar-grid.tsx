"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { type CalendarEvent } from "@/hooks/use-calendar-events";
import { getHolidayForDate } from "@/lib/holidays";

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onDateClick: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ year, month, events, onDateClick, onEventClick }: CalendarGridProps) {
  const days = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 1 ? 12 : month - 1;
      const y = month === 1 ? year - 1 : year;
      result.push({ date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: true });
    }

    // Next month days
    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      result.push({ date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
    }

    return result;
  }, [year, month]);

  const today = new Date().toISOString().split("T")[0];

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const existing = map.get(event.date) || [];
      existing.push(event);
      map.set(event.date, existing);
    }
    return map;
  }, [events]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-muted/50">
        {DAY_NAMES.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((dayInfo) => {
          const dayEvents = eventsByDate.get(dayInfo.date) || [];
          const holiday = getHolidayForDate(dayInfo.date);
          const isToday = dayInfo.date === today;

          return (
            <button
              key={dayInfo.date}
              onClick={() => onDateClick(dayInfo.date)}
              className={cn(
                "min-h-[80px] p-1.5 border-t border-r text-left hover:bg-muted/50 transition-colors",
                !dayInfo.isCurrentMonth && "text-muted-foreground/50 bg-muted/20",
                isToday && "bg-accent/10"
              )}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                isToday && "bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center"
              )}>
                {dayInfo.day}
              </div>
              {holiday && (
                <div className="text-[10px] font-medium text-red-600 truncate mb-0.5">
                  {holiday.name}
                </div>
              )}
              {dayEvents.slice(0, 2).map((event) => (
                <button
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="block w-full text-left text-[10px] truncate rounded px-1 py-0.5 mb-0.5 text-white"
                  style={{ backgroundColor: event.color }}
                >
                  {event.title}
                </button>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-[10px] text-muted-foreground">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
