# SAMS Feature Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all missing features from the old SAMS project to the new Sanad project, achieving 100% feature parity and beyond.

**Architecture:** Extend the existing Supabase/Next.js 16 architecture with new pages, components, database tables, and server actions. Follow existing patterns (TanStack Query, Zustand, shadcn/ui, i18n).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, TanStack Query, Zustand, Recharts, Framer Motion, Zod, date-fns, PapaParse

## Global Constraints

- All new pages go in `src/app/(app)/` route group (authenticated)
- Follow existing patterns: TanStack Query for server state, Zustand for client state
- Use existing `cn()` utility, shadcn/ui components, and design system
- All UI strings must go through i18n (`en.json` / `ur.json`)
- All new database tables need RLS policies in migration 005
- TypeScript strict mode — no `any` types
- Use existing Supabase client patterns (client.ts, server.ts, admin.ts)
- Follow existing query key patterns in `query-keys.ts`
- Tests in `src/__tests__/` or `src/lib/__tests__/`

---

## Batch 1: Database Schema Extensions

### Task 1: Add Calendar Events Table

**Files:**
- Modify: `supabase/migrations/` (new migration 005)
- Modify: `src/lib/query-keys.ts`

**Steps:**

- [ ] Create migration file `supabase/migrations/005_add_missing_tables.sql`

```sql
-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  event_type TEXT NOT NULL DEFAULT 'event' CHECK (event_type IN ('event', 'holiday', 'exam', 'test', 'assignment', 'meeting', 'other')),
  color TEXT DEFAULT '#3b82f6',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view calendar events" ON calendar_events
  FOR SELECT USING (school_id = current_staff_school_id());

CREATE POLICY "School admins can manage calendar events" ON calendar_events
  FOR ALL USING (school_id = current_staff_school_id() AND current_staff_role() = 'school_admin');

CREATE INDEX idx_calendar_events_school_date ON calendar_events(school_id, date);
CREATE INDEX idx_calendar_events_school_type ON calendar_events(school_id, event_type);

-- Deleted Records (Trash)
CREATE TABLE IF NOT EXISTS deleted_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  data JSONB NOT NULL,
  deleted_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  restored_at TIMESTAMPTZ
);

ALTER TABLE deleted_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School admins can manage trash" ON deleted_records
  FOR ALL USING (school_id = current_staff_school_id() AND current_staff_role() = 'school_admin');

CREATE INDEX idx_deleted_records_school_entity ON deleted_records(school_id, entity_type);
CREATE INDEX idx_deleted_records_expires ON deleted_records(expires_at) WHERE restored_at IS NULL;

-- Student photos storage reference (already in schema, just ensure photo_url works)
-- Add staff_attendance if not exists (already in schema from migration 001)
```

- [ ] Run migration: verify tables created
- [ ] Update `src/lib/query-keys.ts` to add calendar and trash query keys

```typescript
// Add to school-scoped keys:
calendar: ['calendar'] as const,
calendarEvents: (schoolId: string) => [...schoolKeys.calendar, schoolId] as const,
trash: ['trash'] as const,
trashRecords: (schoolId: string) => [...schoolKeys.trash, schoolId] as const,
performance: ['performance'] as const,
performanceData: (schoolId: string) => [...schoolKeys.performance, schoolId] as const,
```

- [ ] Commit: `feat(db): add calendar_events and deleted_records tables`

---

### Task 2: Add File Upload Support

**Files:**
- Create: `src/app/api/upload/route.ts`
- Create: `src/lib/upload.ts`

**Steps:**

- [ ] Create `src/lib/upload.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error?: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: "", error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" };
  }
  if (file.size > MAX_SIZE) {
    return { url: "", error: "File too large. Maximum 5MB" };
  }

  const ext = file.name.split(".").pop();
  const filename = `${path}/${crypto.randomUUID()}.${ext}`;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type });

  if (error) return { url: "", error: error.message };

  const { data: urlData } = adminClient.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}
```

- [ ] Create `src/app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "uploads";
  const path = (formData.get("path") as string) || "general";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const result = await uploadFile(file, bucket, path);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ url: result.url });
}
```

- [ ] Commit: `feat(upload): add file upload API with validation`

---

## Batch 2: Core Missing Modules

### Task 3: Academic Calendar Module

**Files:**
- Create: `src/app/(app)/calendar/page.tsx`
- Create: `src/app/(app)/calendar/loading.tsx`
- Create: `src/components/calendar/calendar-grid.tsx`
- Create: `src/components/calendar/event-dialog.tsx`
- Create: `src/hooks/use-calendar-events.ts`
- Modify: `src/components/layout/sidebar.tsx` (add Calendar nav item)
- Modify: `src/i18n/en.json` (add calendar translations)
- Modify: `src/i18n/ur.json` (add calendar translations)

**Steps:**

- [ ] Add i18n keys to `en.json`:

```json
"calendar": {
  "title": "Academic Calendar",
  "description": "Manage school events, exams, and holidays",
  "today": "Today",
  "month": "Month",
  "week": "Week",
  "day": "Day",
  "addEvent": "Add Event",
  "editEvent": "Edit Event",
  "deleteEvent": "Delete Event",
  "eventTitle": "Event Title",
  "eventDescription": "Description",
  "startDate": "Start Date",
  "endDate": "End Date",
  "startTime": "Start Time",
  "endTime": "End Time",
  "eventType": "Event Type",
  "eventTypes": {
    "event": "Event",
    "holiday": "Holiday",
    "exam": "Exam",
    "test": "Test",
    "assignment": "Assignment",
    "meeting": "Meeting",
    "other": "Other"
  },
  "color": "Color",
  "noEvents": "No events this month",
  "createSuccess": "Event created successfully",
  "updateSuccess": "Event updated successfully",
  "deleteSuccess": "Event deleted successfully"
}
```

- [ ] Add Urdu keys to `ur.json`

- [ ] Create `src/hooks/use-calendar-events.ts`

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { schoolKeys } from "@/lib/query-keys";

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
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: schoolKeys.calendarEvents(schoolId || ""),
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
  const supabase = createBrowserClient();

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
      queryClient.invalidateQueries({ queryKey: schoolKeys.calendar });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.calendar });
    },
  });
}
```

- [ ] Create `src/components/calendar/event-dialog.tsx` — Dialog for creating/editing calendar events with form fields (title, description, date range, time range, event type selector, color picker)

- [ ] Create `src/components/calendar/calendar-grid.tsx` — Month view grid showing events on each day, clickable to view/create events

- [ ] Create `src/app/(app)/calendar/page.tsx` — Main calendar page with month/week/day view toggle, event list sidebar, add event button

- [ ] Create `src/app/(app)/calendar/loading.tsx` — Skeleton loading

- [ ] Add Calendar to sidebar navigation in `src/components/layout/sidebar.tsx`

- [ ] Commit: `feat(calendar): add academic calendar module with event management`

---

### Task 4: Performance Analytics Module

**Files:**
- Create: `src/app/(app)/performance/page.tsx`
- Create: `src/app/(app)/performance/loading.tsx`
- Create: `src/components/charts/performance-radar.tsx`
- Create: `src/components/charts/subject-comparison.tsx`
- Create: `src/hooks/use-performance-data.ts`

**Steps:**

- [ ] Add i18n keys for performance module

- [ ] Create `src/hooks/use-performance-data.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { schoolKeys } from "@/lib/query-keys";

export function usePerformanceData(filters: {
  examId?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
}) {
  const schoolId = useSchoolId();
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: [...schoolKeys.performanceData(schoolId || ""), filters],
    queryFn: async () => {
      if (!schoolId) return null;

      // Get exams
      const { data: exams } = await supabase
        .from("exams")
        .select("id, name, starts_on, ends_on")
        .eq("school_id", schoolId)
        .order("starts_on", { ascending: false });

      // Get marks with student and subject info
      let marksQuery = supabase
        .from("marks")
        .select(`
          id, marks_obtained, is_absent,
          students!inner(id, full_name, admission_number, section_id, sections!inner(id, name, class_id, classes!inner(id, name))),
          exam_subject_schedule!inner(id, max_marks, passing_marks, subjects!inner(id, name, code), exams!inner(id, name))
        `)
        .eq("school_id", schoolId);

      if (filters.examId) {
        marksQuery = marksQuery.eq("exam_subject_schedule.exams.id", filters.examId);
      }
      if (filters.classId) {
        marksQuery = marksQuery.eq("students.sections.class_id", filters.classId);
      }
      if (filters.sectionId) {
        marksQuery = marksQuery.eq("students.section_id", filters.sectionId);
      }
      if (filters.subjectId) {
        marksQuery = marksQuery.eq("exam_subject_schedule.subjects.id", filters.subjectId);
      }

      const { data: marks, error: marksError } = await marksQuery;
      if (marksError) throw marksError;

      // Get classes and sections for filters
      const { data: classes } = await supabase
        .from("classes")
        .select("id, name")
        .eq("school_id", schoolId)
        .order("display_order");

      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name, code")
        .eq("school_id", schoolId);

      // Calculate performance metrics
      const studentPerformance = new Map<string, {
        studentId: string;
        studentName: string;
        admissionNumber: string;
        className: string;
        sectionName: string;
        totalMarks: number;
        obtainedMarks: number;
        percentage: number;
        subjects: { name: string; obtained: number; total: number; percentage: number }[];
      }>();

      for (const mark of marks || []) {
        const studentId = mark.students.id;
        const existing = studentPerformance.get(studentId) || {
          studentId,
          studentName: mark.students.full_name,
          admissionNumber: mark.students.admission_number,
          className: mark.students.sections.classes.name,
          sectionName: mark.students.sections.name,
          totalMarks: 0,
          obtainedMarks: 0,
          percentage: 0,
          subjects: [],
        };

        const maxMarks = mark.exam_subject_schedule.max_marks;
        const obtained = mark.is_absent ? 0 : mark.marks_obtained;

        existing.totalMarks += maxMarks;
        existing.obtainedMarks += obtained;
        existing.subjects.push({
          name: mark.exam_subject_schedule.subjects.name,
          obtained,
          total: maxMarks,
          percentage: maxMarks > 0 ? (obtained / maxMarks) * 100 : 0,
        });

        studentPerformance.set(studentId, existing);
      }

      // Calculate percentages
      const performanceArray = Array.from(studentPerformance.values()).map((p) => ({
        ...p,
        percentage: p.totalMarks > 0 ? (p.obtainedMarks / p.totalMarks) * 100 : 0,
      }));

      // Class averages
      const classAverages = new Map<string, { total: number; sum: number }>();
      for (const p of performanceArray) {
        const key = `${p.className} - ${p.sectionName}`;
        const existing = classAverages.get(key) || { total: 0, sum: 0 };
        existing.total++;
        existing.sum += p.percentage;
        classAverages.set(key, existing);
      }

      const classAveragesArray = Array.from(classAverages.entries()).map(([name, data]) => ({
        name,
        average: data.total > 0 ? data.sum / data.total : 0,
        studentCount: data.total,
      }));

      // Subject averages
      const subjectMap = new Map<string, { total: number; sum: number }>();
      for (const p of performanceArray) {
        for (const s of p.subjects) {
          const existing = subjectMap.get(s.name) || { total: 0, sum: 0 };
          existing.total++;
          existing.sum += s.percentage;
          subjectMap.set(s.name, existing);
        }
      }

      const subjectAverages = Array.from(subjectMap.entries()).map(([name, data]) => ({
        name,
        average: data.total > 0 ? data.sum / data.total : 0,
      }));

      return {
        exams: exams || [],
        classes: classes || [],
        subjects: subjects || [],
        studentPerformance: performanceArray,
        classAverages: classAveragesArray,
        subjectAverages,
      };
    },
    enabled: !!schoolId,
  });
}
```

- [ ] Create `src/components/charts/performance-radar.tsx` — Radar chart for subject-wise performance

- [ ] Create `src/components/charts/subject-comparison.tsx` — Bar chart comparing subject averages

- [ ] Create `src/app/(app)/performance/page.tsx` — Main performance page with:
  - Filter bar (exam, class, section, subject selectors)
  - Class average comparison chart
  - Subject average radar chart
  - Student performance table with sorting
  - Overall statistics cards

- [ ] Create `src/app/(app)/performance/loading.tsx`

- [ ] Add Performance to sidebar navigation

- [ ] Commit: `feat(performance): add performance analytics module with charts`

---

### Task 5: Student Detail Page

**Files:**
- Create: `src/app/(app)/students/[id]/page.tsx`
- Create: `src/app/(app)/students/[id]/loading.tsx`
- Create: `src/components/students/student-detail-header.tsx`
- Create: `src/components/students/student-marks-tab.tsx`
- Create: `src/components/students/student-attendance-tab.tsx`
- Create: `src/components/students/student-fees-tab.tsx`

**Steps:**

- [ ] Add i18n keys for student detail

- [ ] Create `src/app/(app)/students/[id]/page.tsx` — Student detail page with:
  - Header with photo, name, admission number, status
  - Tabs: Overview, Marks, Attendance, Fees, Homework
  - Overview tab: personal info, academic info, guardian info
  - Actions: Edit, Withdraw, Print Report Card

- [ ] Create tab components for marks, attendance, fees

- [ ] Create loading skeleton

- [ ] Commit: `feat(students): add student detail page with tabs`

---

### Task 6: Staff Detail Page

**Files:**
- Create: `src/app/(app)/staff/[id]/page.tsx`
- Create: `src/app/(app)/staff/[id]/loading.tsx`
- Create: `src/components/staff/staff-detail-header.tsx`
- Create: `src/components/staff/staff-assignments-tab.tsx`

**Steps:**

- [ ] Add i18n keys for staff detail

- [ ] Create `src/app/(app)/staff/[id]/page.tsx` — Staff detail page with:
  - Header with avatar, name, role, status
  - Tabs: Profile, Assignments, Attendance
  - Profile tab: personal info, qualification, salary
  - Assignments tab: class/section/subject assignments with CRUD
  - Actions: Edit, Deactivate, Reset Password

- [ ] Create staff detail components

- [ ] Commit: `feat(staff): add staff detail page with assignments management`

---

## Batch 3: Missing Sub-Pages

### Task 7: Student Promotion

**Files:**
- Create: `src/app/(app)/students/promote/page.tsx`
- Create: `src/hooks/use-student-promotion.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create promotion hook with bulk promotion logic

- [ ] Create promotion page:
  - Select current class/section
  - Load students list
  - Select target class/section for each student or bulk
  - "Hold Back" option
  - Confirmation dialog
  - Audit logging

- [ ] Commit: `feat(students): add bulk student promotion`

---

### Task 8: Trash / Recycle Bin

**Files:**
- Create: `src/app/(app)/trash/page.tsx`
- Create: `src/app/(app)/trash/loading.tsx`
- Create: `src/hooks/use-trash.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create trash hook with soft delete, restore, permanent delete

- [ ] Create trash page:
  - List deleted records with entity type, name, deleted date
  - Restore button (restores to original table)
  - Permanent delete button (with confirmation)
  - Auto-cleanup of expired records (30 days)

- [ ] Add soft delete helper to existing modules (students, staff)

- [ ] Commit: `feat(trash): add recycle bin with restore and permanent delete`

---

### Task 9: Profile Page

**Files:**
- Create: `src/app/(app)/profile/page.tsx`
- Create: `src/components/profile/profile-form.tsx`
- Create: `src/components/profile/password-form.tsx`
- Create: `src/components/profile/theme-settings.tsx`

**Steps:**

- [ ] Add i18n keys

- [ ] Create profile page with tabs:
  - Personal Info (name, email, phone, address)
  - Change Password (current + new + confirm)
  - Preferences (theme, language)

- [ ] Commit: `feat(profile): add user profile page with password change`

---

### Task 10: Billing Page

**Files:**
- Create: `src/app/(app)/billing/page.tsx`
- Create: `src/components/billing/plan-card.tsx`
- Create: `src/components/billing/subscription-info.tsx`

**Steps:**

- [ ] Add i18n keys

- [ ] Create billing page:
  - Current subscription info (plan, status, dates)
  - Plan comparison cards (Trial/Starter/Growth/Institution/Enterprise)
  - Upgrade/downgrade buttons
  - Payment history
  - Subscription limits display (students used/max, staff used/max)

- [ ] Commit: `feat(billing): add billing and subscription management page`

---

### Task 11: Help Page

**Files:**
- Create: `src/app/(app)/help/page.tsx`

**Steps:**

- [ ] Add i18n keys

- [ ] Create help page with:
  - Keyboard shortcuts reference
  - Module descriptions
  - Contact support info
  - FAQ section

- [ ] Commit: `feat(help): add help and documentation page`

---

### Task 12: Fee Defaulters Page

**Files:**
- Create: `src/app/(app)/fees/defaulters/page.tsx`
- Create: `src/hooks/use-fee-defaulters.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create fee defaulters hook:
  - Query students with unpaid/partial invoices
  - Include total due, amount paid, balance

- [ ] Create defaulters page:
  - Table: student name, class, total due, paid, balance
  - CSV export button
  - Summary stats (total defaulters, total outstanding)

- [ ] Commit: `feat(fees): add fee defaulters page with CSV export`

---

### Task 13: Fee Payment History

**Files:**
- Create: `src/app/(app)/fees/history/page.tsx`
- Create: `src/hooks/use-payment-history.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create payment history hook with date range and student filters

- [ ] Create history page:
  - Date range picker
  - Student search
  - Payment method filter
  - Table: date, student, amount, method, receipt number, received by
  - Summary stats

- [ ] Commit: `feat(fees): add fee payment history page`

---

### Task 14: Printable Fee Receipt

**Files:**
- Create: `src/app/(app)/fees/receipt/[paymentId]/page.tsx`
- Create: `src/components/fees/fee-receipt.tsx`

**Steps:**

- [ ] Create printable receipt component:
  - School name and logo
  - Receipt number
  - Student details
  - Payment details (amount, method, date)
  - Balance information
  - Signature line
  - Print-optimized CSS

- [ ] Add print button to fee collection flow

- [ ] Commit: `feat(fees): add printable fee receipt`

---

### Task 15: Attendance Reports & Absent Students

**Files:**
- Create: `src/app/(app)/attendance/reports/page.tsx`
- Create: `src/app/(app)/attendance/absent/page.tsx`
- Create: `src/hooks/use-attendance-reports.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create attendance reports hook

- [ ] Create reports page:
  - Date range picker
  - Class/section filter
  - Attendance summary (present/absent/late/leave percentages)
  - Daily breakdown table
  - Export to CSV

- [ ] Create absent students page:
  - Date picker
  - List of absent/late students
  - Parent contact info
  - Class/section grouping

- [ ] Commit: `feat(attendance): add attendance reports and absent students pages`

---

## Batch 4: Feature Enhancements

### Task 16: CSV Export Across All Modules

**Files:**
- Create: `src/lib/export.ts`
- Modify: All list pages (students, staff, fees, attendance, audit, marks)

**Steps:**

- [ ] Create `src/lib/export.ts` with generic CSV export function using PapaParse

- [ ] Add export buttons to:
  - Students list
  - Staff list
  - Fee invoices
  - Fee payments
  - Attendance records
  - Audit logs
  - Marks

- [ ] Commit: `feat(export): add CSV export to all list modules`

---

### Task 17: Announcement Priority & Viewing

**Files:**
- Modify: `src/app/(app)/announcements/create/page.tsx`
- Create: `src/app/(app)/announcements/page.tsx`

**Steps:**

- [ ] Add priority field (low/normal/high/urgent) to announcements

- [ ] Add audience targeting (all/staff/parents)

- [ ] Create announcements list page:
  - Priority badges (color-coded)
  - Filter by priority
  - Mark as read/unread

- [ ] Commit: `feat(announcements): add priority levels and list view`

---

### Task 18: Animated Dashboard Counters

**Files:**
- Create: `src/hooks/use-animated-counter.ts`
- Modify: `src/app/(app)/dashboard/page.tsx`

**Steps:**

- [ ] Create animated counter hook:

```typescript
"use client";

import { useEffect, useState } from "react";

export function useAnimatedCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}
```

- [ ] Apply to dashboard stat cards

- [ ] Commit: `feat(dashboard): add animated stat counters`

---

### Task 19: Session Expiry Modal

**Files:**
- Create: `src/components/auth/session-expiry-modal.tsx`
- Modify: `src/components/layout/app-shell.tsx`

**Steps:**

- [ ] Create session expiry modal that:
  - Shows warning 5 minutes before session expires
  - "Stay Logged In" button (refreshes session)
  - "Logout" button
  - Auto-logout when session expires

- [ ] Integrate into app shell

- [ ] Commit: `feat(auth): add session expiry warning modal`

---

### Task 20: Staff Attendance UI

**Files:**
- Create: `src/app/(app)/attendance/staff/page.tsx`
- Create: `src/hooks/use-staff-attendance.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create staff attendance hook

- [ ] Create staff attendance page:
  - Date picker
  - Staff list with status toggles (present/absent/late/leave)
  - Check-in/check-out times
  - "Mark All Present" button
  - Save with audit logging

- [ ] Add Staff Attendance to attendance submenu

- [ ] Commit: `feat(attendance): add staff attendance tracking UI`

---

### Task 21: Academic Year Management

**Files:**
- Create: `src/app/(app)/settings/academic-years/page.tsx`
- Create: `src/hooks/use-academic-years.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create academic year management page:
  - List academic years
  - Create new academic year (name, start date, end date)
  - Set current academic year
  - Pakistani calendar convention (starts April)

- [ ] Commit: `feat(settings): add academic year management`

---

### Task 22: Settings CRUD for Classes/Sections/Subjects

**Files:**
- Create: `src/app/(app)/settings/classes/page.tsx`
- Create: `src/app/(app)/settings/subjects/page.tsx`
- Create: `src/hooks/use-classes.ts`
- Create: `src/hooks/use-subjects.ts`

**Steps:**

- [ ] Add i18n keys

- [ ] Create classes management page:
  - List classes with sections
  - Add/edit/delete class
  - Add/edit/delete section within class
  - Assign class teacher

- [ ] Create subjects management page:
  - List subjects
  - Add/edit/delete subject
  - Assign subject to sections

- [ ] Commit: `feat(settings): add class/section/subject CRUD in settings`

---

### Task 23: Keyboard Shortcuts & Global Search

**Files:**
- Modify: `src/components/keyboard-shortcuts.tsx`
- Create: `src/components/search-dialog.tsx`

**Steps:**

- [ ] Enhance keyboard shortcuts:
  - Ctrl+D: Dashboard
  - Ctrl+Shift+A: Attendance
  - Ctrl+K: Search
  - Ctrl+Shift+S: Students
  - Ctrl+Shift+F: Fees

- [ ] Create global search dialog:
  - Search across students (by name, admission number)
  - Search across staff (by name, role)
  - Search across pages
  - Keyboard navigation (arrow keys, enter)

- [ ] Commit: `feat(navigation): add keyboard shortcuts and global search dialog`

---

### Task 24: 403 Forbidden Page

**Files:**
- Create: `src/app/forbidden.tsx`

**Steps:**

- [ ] Create 403 page with:
  - "Access Denied" message
  - "Back to Dashboard" button
  - "Go Home" button

- [ ] Commit: `feat(auth): add 403 forbidden page`

---

### Task 25: Holiday Calendar Integration

**Files:**
- Create: `src/lib/holidays.ts`
- Modify: `src/components/calendar/calendar-grid.tsx`

**Steps:**

- [ ] Create `src/lib/holidays.ts` with Pakistani national holidays:

```typescript
export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD
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

// Islamic holidays need annual calculation
export function getIslamicHolidays(year: number): Holiday[] {
  // Approximate dates for Islamic holidays (varies by year)
  return [
    { name: "Eid ul Fitr", date: `${year}-03-30`, nameUrdu: "عید الفطر" },
    { name: "Eid ul Adha", date: `${year}-06-06`, nameUrdu: "عید الاضحیٰ" },
    { name: "Ashura", date: `${year}-06-25`, nameUrdu: "عاشوراء" },
    { name: "Eid Milad un Nabi", date: `${year}-09-05`, nameUrdu: "عید میلاد النبی" },
  ];
}

export function isHoliday(date: string): Holiday | null {
  const allHolidays = [...PAKISTANI_HOLIDAYS, ...getIslamicHolidays(new Date(date).getFullYear())];
  return allHolidays.find((h) => h.date === date) || null;
}
```

- [ ] Display holidays on calendar grid

- [ ] Commit: `feat(calendar): add Pakistani holiday integration`

---

### Task 26: Subscription Limits Enforcement

**Files:**
- Create: `src/lib/subscription-limits.ts`
- Modify: `src/app/(app)/students/create/page.tsx`
- Modify: `src/app/(app)/staff/invite/page.tsx`

**Steps:**

- [ ] Create `src/lib/subscription-limits.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const PLAN_LIMITS = {
  trial: { students: 100, staff: 20 },
  starter: { students: 100, staff: 30 },
  growth: { students: 500, staff: 100 },
  institution: { students: 1500, staff: 300 },
  enterprise: { students: Infinity, staff: Infinity },
};

export async function checkLimits(schoolId: string, type: "students" | "staff") {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: school } = await adminClient
    .from("schools")
    .select("plan_id, plans!inner(name)")
    .eq("id", schoolId)
    .single();

  if (!school) return { allowed: false, error: "School not found" };

  const planName = (school.plans as any).name?.toLowerCase() || "trial";
  const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.trial;

  const { count } = await adminClient
    .from(type === "students" ? "students" : "staff")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq(type === "students" ? "status" : "status", "active");

  const limit = limits[type];
  if (count !== null && count >= limit) {
    return {
      allowed: false,
      error: `You've reached the ${type} limit (${limit}) for your ${planName} plan. Please upgrade.`,
      current: count,
      limit,
    };
  }

  return { allowed: true, current: count || 0, limit };
}
```

- [ ] Add limit checks before creating students and inviting staff

- [ ] Commit: `feat(billing): add subscription limits enforcement`

---

### Task 27: User Menu Enhancement

**Files:**
- Modify: `src/components/layout/app-shell.tsx`

**Steps:**

- [ ] Add user dropdown menu to top bar:
  - User name and role
  - Profile link
  - Settings link
  - Help link
  - Logout button

- [ ] Commit: `feat(layout): enhance user menu with profile/settings/help links`

---

### Task 28: Student Withdrawal

**Files:**
- Modify: `src/app/(app)/students/[id]/page.tsx`
- Create: `src/components/students/withdraw-dialog.tsx`

**Steps:**

- [ ] Create withdraw dialog:
  - Reason for withdrawal textarea
  - Withdrawal date
  - Confirmation
  - Sets student status to "withdrawn"
  - Logs audit event

- [ ] Add to student detail page actions

- [ ] Commit: `feat(students): add student withdrawal with reason`

---

### Task 29: Holiday Marking in Attendance

**Files:**
- Modify: `src/app/(app)/attendance/mark/page.tsx`

**Steps:**

- [ ] Add "Mark as Holiday" option:
  - Holiday name field
  - Applies to all students for that date
  - Skips individual attendance marking

- [ ] Commit: `feat(attendance): add holiday marking option`

---

### Task 30: Data Export in Settings

**Files:**
- Create: `src/app/(app)/settings/export/page.tsx`

**Steps:**

- [ ] Create data export page:
  - Export students (CSV)
  - Export fees (CSV)
  - Export attendance (CSV)
  - Export audit logs (CSV)
  - Date range filter for each

- [ ] Commit: `feat(settings): add data export page`

---

## Batch 5: Sidebar & Navigation Updates

### Task 31: Update Sidebar Navigation

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

**Steps:**

- [ ] Update sidebar to include all modules:
  - Dashboard
  - Students (with submenu: List, Create, Import, Promote)
  - Staff (with submenu: List, Invite)
  - Attendance (with submenu: Mark, Reports, Staff Attendance)
  - Fees (with submenu: Overview, Collect, Generate, Structure, Defaulters, History)
  - Exams (with submenu: List, Create, Report Cards)
  - Gradebook
  - Homework
  - Performance
  - Calendar
  - Announcements
  - Library
  - Transport
  - Payroll
  - Notifications
  - Trash
  - Settings (with submenu: Profile, School, Modules, Academic Years, Classes, Subjects, Themes, Export)
  - Help

- [ ] Commit: `feat(layout): update sidebar with all modules and submenus`

---

## Batch 6: i18n Updates

### Task 32: Complete i18n Coverage

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/ur.json`

**Steps:**

- [ ] Add all missing translation keys for:
  - Calendar module
  - Performance module
  - Student detail
  - Staff detail
  - Student promotion
  - Trash
  - Profile
  - Billing
  - Help
  - Fee defaulters
  - Fee history
  - Fee receipt
  - Attendance reports
  - Absent students
  - Staff attendance
  - Academic years
  - Settings CRUD
  - Search dialog
  - Holiday names
  - Subscription limits

- [ ] Add Urdu translations for all new keys

- [ ] Commit: `feat(i18n): complete translation coverage for all new modules`

---

## Batch 7: Tests

### Task 33: Write Tests for New Modules

**Files:**
- Create: `src/__tests__/calendar.test.ts`
- Create: `src/__tests__/performance.test.ts`
- Create: `src/__tests__/holidays.test.ts`
- Create: `src/__tests__/export.test.ts`
- Create: `src/__tests__/subscription-limits.test.ts`
- Create: `src/__tests__/upload.test.ts`

**Steps:**

- [ ] Write tests for calendar events CRUD
- [ ] Write tests for performance data calculations
- [ ] Write tests for Pakistani holidays
- [ ] Write tests for CSV export
- [ ] Write tests for subscription limits
- [ ] Write tests for file upload validation
- [ ] Run all tests: `npm run test`
- [ ] Commit: `test: add tests for new modules`

---

## Batch 8: Final Integration & Polish

### Task 34: Integration Testing

**Steps:**

- [ ] Run full build: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Fix any lint errors: `npm run lint`
- [ ] Run all tests: `npm run test`
- [ ] Verify all routes are accessible
- [ ] Verify sidebar navigation works
- [ ] Verify i18n switching works
- [ ] Verify theme switching works
- [ ] Commit: `fix: resolve build and lint issues`

---

### Task 35: Final Commit & Documentation

**Steps:**

- [ ] Update `AI_Agent_Handoff.md` with new features
- [ ] Final commit: `docs: update handoff document with SAMS feature parity`
