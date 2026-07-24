-- Migration 005: Add missing tables for feature parity
-- Calendar Events, Deleted Records (Trash)

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

DO $$ BEGIN
  CREATE POLICY "School members can view calendar events" ON calendar_events
    FOR SELECT USING (school_id = current_staff_school_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "School admins can manage calendar events" ON calendar_events
    FOR ALL USING (school_id = current_staff_school_id() AND current_staff_role() = 'school_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendar_events_school_date ON calendar_events(school_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_school_type ON calendar_events(school_id, event_type);

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

DO $$ BEGIN
  CREATE POLICY "School admins can manage trash" ON deleted_records
    FOR ALL USING (school_id = current_staff_school_id() AND current_staff_role() = 'school_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_deleted_records_school_entity ON deleted_records(school_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_deleted_records_expires ON deleted_records(expires_at) WHERE restored_at IS NULL;
