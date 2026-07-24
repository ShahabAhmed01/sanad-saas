"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

export interface CalendarEvent {
  id: string;
  school_id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  event_type: string;
  color: string;
  created_by: string | null;
  created_at: string;
}

export function useCalendarEvents(year: number, month: number) {
  const schoolId = useSchoolId();
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.school.calendarEvents(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endMonth = month === 12 ? 1 : month + 1;
      const endYear = month === 12 ? year + 1 : year;
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("school_id", schoolId)
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const schoolId = useSchoolId();

  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.calendar(schoolId || "") });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const schoolId = useSchoolId();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.calendar(schoolId || "") });
    },
  });
}
