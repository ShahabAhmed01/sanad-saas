-- Migration 004: Add must_change_password column to staff table
-- This column is set to TRUE when a staff member is invited with a temporary password.
-- The app should prompt the user to change their password on first login when this is TRUE.

alter table public.staff
  add column if not exists must_change_password boolean not null default false;

-- Also add updated_at trigger if not already present
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing trigger if present, then recreate
drop trigger if exists update_staff_updated_at on public.staff;
create trigger update_staff_updated_at
  before update on public.staff
  for each row
  execute function public.update_updated_at();
