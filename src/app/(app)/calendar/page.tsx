"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { EventDialog } from "@/components/calendar/event-dialog";
import { useCalendarEvents, type CalendarEvent } from "@/hooks/use-calendar-events";
import { useI18n } from "@/i18n/provider";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const { t } = useI18n();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>();

  const { data: events = [], isLoading } = useCalendarEvents(year, month);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function goToToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }

  function handleDateClick(date: string) {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setDialogOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setDialogOpen(true);
  }

  const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("calendar.title")}
        description={t("calendar.description")}
        action={
          <Button onClick={() => { setSelectedDate(undefined); setSelectedEvent(undefined); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            {t("calendar.addEvent")}
          </Button>
        }
      />

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {monthName} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={goToToday}>
          {t("calendar.today")}
        </Button>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-[500px] w-full" />
        </div>
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {/* Event Dialog */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        event={selectedEvent}
      />
    </div>
  );
}
