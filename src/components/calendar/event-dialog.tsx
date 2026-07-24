"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateCalendarEvent, useDeleteCalendarEvent, type CalendarEvent } from "@/hooks/use-calendar-events";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useI18n } from "@/i18n/provider";
import { toast } from "sonner";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: string;
  event?: CalendarEvent;
}

const EVENT_TYPES = [
  { value: "event", color: "#3b82f6" },
  { value: "holiday", color: "#ef4444" },
  { value: "exam", color: "#f59e0b" },
  { value: "test", color: "#8b5cf6" },
  { value: "assignment", color: "#10b981" },
  { value: "meeting", color: "#ec4899" },
  { value: "other", color: "#6b7280" },
];

export function EventDialog({ open, onOpenChange, selectedDate, event }: EventDialogProps) {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const createEvent = useCreateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [date, setDate] = useState(event?.date || selectedDate || "");
  const [endDate, setEndDate] = useState(event?.end_date || "");
  const [startTime, setStartTime] = useState(event?.start_time || "");
  const [endTime, setEndTime] = useState(event?.end_time || "");
  const [eventType, setEventType] = useState(event?.event_type || "event");
  const [color, setColor] = useState(event?.color || "#3b82f6");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId || !title || !date) return;

    try {
      await createEvent.mutateAsync({
        school_id: schoolId,
        title,
        description: description || null,
        date,
        end_date: endDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
        event_type: eventType,
        color,
        created_by: null,
      });
      toast.success(t("calendar.createSuccess"));
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error(t("common.error"));
    }
  }

  async function handleDelete() {
    if (!event) return;
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success(t("calendar.deleteSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("common.error"));
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate(selectedDate || "");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setEventType("event");
    setColor("#3b82f6");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? t("calendar.editEvent") : t("calendar.addEvent")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("calendar.eventTitle")} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("calendar.eventDescription")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t("common.startDate")} *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("common.endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">{t("calendar.startTime")}</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">{t("calendar.endTime")}</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("calendar.eventType")} *</Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setEventType(type.value);
                    setColor(type.color);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    eventType === type.value
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={eventType === type.value ? { backgroundColor: type.color } : undefined}
                >
                  {t(`calendar.eventTypes.${type.value}`)}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteEvent.isPending}
              >
                {t("common.delete")}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={createEvent.isPending || !title || !date}>
              {createEvent.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
