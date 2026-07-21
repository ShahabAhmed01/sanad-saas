-- =========================================================
-- Sanad — Initial Schema Migration
-- Based on 02_MASTER_BUILD_PROMPT.md Section 7
-- =========================================================

-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- PLATFORM LEVEL
-- =========================================================

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_pkr_monthly numeric(10,2) not null default 0,
  price_pkr_yearly numeric(10,2),
  max_students int,
  max_staff int,
  storage_limit_mb int,
  features jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.platform_admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#B88602F',
  address text,
  city text,
  phone text,
  email text,
  board_type text,
  timezone text not null default 'Asia/Karachi',
  status text not null default 'trialing',
  plan_id uuid references public.plans(id),
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  billing_cycle text not null default 'monthly',
  status text not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  amount_pkr numeric(10,2) not null,
  payment_method text,
  proof_of_payment_url text,
  verified_by uuid references public.platform_admins(id),
  verified_at timestamptz,
  gateway_reference text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- STAFF / USERS
-- =========================================================

create type public.staff_role as enum (
  'school_admin','principal','teacher','accountant',
  'front_desk','hr_manager','librarian',
  'transport_coordinator','exam_controller'
);

create table public.staff (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  employee_code text,
  full_name text not null,
  role public.staff_role not null,
  secondary_role public.staff_role,
  is_class_teacher_of uuid,
  phone text,
  cnic text,
  address text,
  qualification text,
  date_joined date,
  photo_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ACADEMIC STRUCTURE
-- =========================================================

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  is_current boolean not null default false
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  display_order int not null default 0
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  room_number text,
  class_teacher_id uuid references public.staff(id)
);

-- Add FK from staff to sections
alter table public.staff
  add constraint staff_is_class_teacher_of_fkey
  foreign key (is_class_teacher_of) references public.sections(id);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text
);

create table public.section_subject_teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.staff(id) on delete cascade,
  unique (section_id, subject_id)
);

-- =========================================================
-- STUDENTS & GUARDIANS
-- =========================================================

create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  admission_number text not null,
  full_name text not null,
  date_of_birth date,
  gender text,
  section_id uuid references public.sections(id),
  photo_url text,
  b_form_number text,
  admission_date date not null default current_date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, admission_number)
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  auth_user_id uuid references auth.users(id),
  full_name text not null,
  relationship text,
  cnic text,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table public.student_guardians (
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  is_primary_contact boolean not null default false,
  primary key (student_id, guardian_id)
);

-- =========================================================
-- ATTENDANCE
-- =========================================================

create table public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  section_id uuid not null references public.sections(id),
  date date not null,
  status text not null,
  marked_by uuid not null references public.staff(id),
  remarks text,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create table public.staff_attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  date date not null,
  status text not null,
  check_in_time time,
  check_out_time time,
  marked_by uuid references public.staff(id),
  created_at timestamptz not null default now(),
  unique (staff_id, date)
);

-- =========================================================
-- EXAMS, MARKS, GRADING
-- =========================================================

create table public.grading_scales (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  bands jsonb not null
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id),
  name text not null,
  starts_on date,
  ends_on date,
  grading_scale_id uuid references public.grading_scales(id),
  status text not null default 'scheduled'
);

create table public.exam_subject_schedule (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  class_id uuid not null references public.classes(id),
  subject_id uuid not null references public.subjects(id),
  exam_date date,
  max_marks numeric(6,2) not null default 100,
  passing_marks numeric(6,2) not null default 33
);

create table public.marks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  exam_subject_schedule_id uuid not null references public.exam_subject_schedule(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  marks_obtained numeric(6,2),
  is_absent boolean not null default false,
  entered_by uuid references public.staff(id),
  approved_by uuid references public.staff(id),
  remarks text,
  unique (exam_subject_schedule_id, student_id)
);

-- =========================================================
-- FEES / FINANCE
-- =========================================================

create table public.fee_heads (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null
);

create table public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid references public.classes(id),
  academic_year_id uuid not null references public.academic_years(id),
  fee_head_id uuid not null references public.fee_heads(id),
  amount numeric(10,2) not null,
  frequency text not null default 'monthly'
);

create table public.fee_invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  period_label text not null,
  due_date date not null,
  total_amount numeric(10,2) not null,
  status text not null default 'unpaid',
  created_at timestamptz not null default now()
);

create table public.fee_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.fee_invoices(id) on delete cascade,
  fee_head_id uuid not null references public.fee_heads(id),
  amount numeric(10,2) not null
);

create table public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  invoice_id uuid not null references public.fee_invoices(id) on delete cascade,
  amount_paid numeric(10,2) not null,
  payment_method text not null,
  received_by uuid not null references public.staff(id),
  receipt_number text not null,
  paid_at timestamptz not null default now(),
  notes text
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  category text not null,
  description text,
  amount numeric(10,2) not null,
  spent_on date not null,
  recorded_by uuid not null references public.staff(id),
  attachment_url text
);

create table public.payroll (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  period_label text not null,
  basic_salary numeric(10,2) not null,
  allowances numeric(10,2) not null default 0,
  deductions numeric(10,2) not null default 0,
  net_salary numeric(10,2) not null,
  status text not null default 'pending',
  processed_by uuid references public.staff(id),
  paid_at timestamptz
);

-- =========================================================
-- HR / LEAVE
-- =========================================================

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  leave_type text not null,
  starts_on date not null,
  ends_on date not null,
  reason text,
  status text not null default 'pending',
  reviewed_by uuid references public.staff(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- LIBRARY
-- =========================================================

create table public.library_books (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  author text,
  isbn text,
  category text,
  total_copies int not null default 1,
  available_copies int not null default 1
);

create table public.library_transactions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  book_id uuid not null references public.library_books(id) on delete cascade,
  borrower_type text not null,
  student_id uuid references public.students(id),
  staff_id uuid references public.staff(id),
  issued_at date not null default current_date,
  due_date date not null,
  returned_at date,
  fine_amount numeric(8,2) not null default 0,
  handled_by uuid references public.staff(id)
);

-- =========================================================
-- TRANSPORT
-- =========================================================

create table public.transport_routes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  fare_amount numeric(10,2) not null default 0
);

create table public.transport_vehicles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  route_id uuid references public.transport_routes(id),
  vehicle_number text not null,
  driver_name text,
  driver_phone text,
  capacity int
);

create table public.student_transport (
  student_id uuid primary key references public.students(id) on delete cascade,
  route_id uuid not null references public.transport_routes(id),
  pickup_stop text
);

-- =========================================================
-- ADMISSIONS / FRONT DESK
-- =========================================================

create table public.admission_inquiries (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  child_name text not null,
  desired_class_id uuid references public.classes(id),
  guardian_name text not null,
  guardian_phone text not null,
  source text,
  status text not null default 'new',
  follow_up_notes jsonb not null default '[]',
  handled_by uuid references public.staff(id),
  created_at timestamptz not null default now()
);

create table public.certificates_issued (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id),
  certificate_type text not null,
  issued_by uuid references public.staff(id),
  issued_at timestamptz not null default now(),
  file_url text
);

-- =========================================================
-- HOMEWORK
-- =========================================================

create table public.homework (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  section_id uuid not null references public.sections(id),
  subject_id uuid not null references public.subjects(id),
  title text not null,
  description text,
  due_date date,
  attachment_url text,
  created_by uuid not null references public.staff(id),
  created_at timestamptz not null default now()
);

-- =========================================================
-- COMMUNICATION
-- =========================================================

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  body text not null,
  audience text not null default 'all',
  section_id uuid references public.sections(id),
  created_by uuid not null references public.staff(id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  recipient_user_id uuid not null,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  link_to text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- AUDIT
-- =========================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  actor_user_id uuid,
  actor_name text,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES — Section 18
-- =========================================================

-- Foreign key indexes
create index idx_staff_school_id on public.staff(school_id);
create index idx_staff_role on public.staff(role);
create index idx_students_school_id on public.students(school_id);
create index idx_students_section_id on public.students(section_id);
create index idx_students_admission_number on public.students(school_id, admission_number);
create index idx_sections_class_id on public.sections(class_id);
create index idx_sections_school_id on public.sections(school_id);
create index idx_classes_school_id on public.classes(school_id);
create index idx_subjects_school_id on public.subjects(school_id);
create index idx_section_subject_teachers_school_id on public.section_subject_teachers(school_id);
create index idx_section_subject_teachers_section_id on public.section_subject_teachers(section_id);
create index idx_section_subject_teachers_teacher_id on public.section_subject_teachers(teacher_id);
create index idx_student_attendance_school_id on public.student_attendance(school_id);
create index idx_student_attendance_student_id on public.student_attendance(student_id);
create index idx_student_attendance_date on public.student_attendance(date);
create index idx_student_attendance_section_date on public.student_attendance(section_id, date);
create index idx_staff_attendance_school_id on public.staff_attendance(school_id);
create index idx_staff_attendance_staff_id on public.staff_attendance(staff_id);
create index idx_staff_attendance_date on public.staff_attendance(date);
create index idx_exams_school_id on public.exams(school_id);
create index idx_marks_school_id on public.marks(school_id);
create index idx_marks_student_id on public.marks(student_id);
create index idx_marks_exam_subject on public.marks(exam_subject_schedule_id);
create index idx_fee_invoices_school_id on public.fee_invoices(school_id);
create index idx_fee_invoices_student_id on public.fee_invoices(student_id);
create index idx_fee_invoices_status on public.fee_invoices(status);
create index idx_fee_payments_school_id on public.fee_payments(school_id);
create index idx_fee_payments_invoice_id on public.fee_payments(invoice_id);
create index idx_guardians_school_id on public.guardians(school_id);
create index idx_guardians_auth_user_id on public.guardians(auth_user_id);
create index idx_student_guardians_student_id on public.student_guardians(student_id);
create index idx_student_guardians_guardian_id on public.student_guardians(guardian_id);
create index idx_leave_requests_school_id on public.leave_requests(school_id);
create index idx_leave_requests_staff_id on public.leave_requests(staff_id);
create index idx_leave_requests_status on public.leave_requests(status);
create index idx_homework_school_id on public.homework(school_id);
create index idx_homework_section_id on public.homework(section_id);
create index idx_announcements_school_id on public.announcements(school_id);
create index idx_notifications_recipient on public.notifications(recipient_user_id);
create index idx_notifications_school_id on public.notifications(school_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_audit_logs_school_id on public.audit_logs(school_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at);
create index idx_subscriptions_school_id on public.subscriptions(school_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_admission_inquiries_school_id on public.admission_inquiries(school_id);
create index idx_admission_inquiries_status on public.admission_inquiries(status);
create index idx_library_books_school_id on public.library_books(school_id);
create index idx_library_transactions_school_id on public.library_transactions(school_id);
create index idx_transport_routes_school_id on public.transport_routes(school_id);
create index idx_transport_vehicles_school_id on public.transport_vehicles(school_id);
create index idx_certificates_issued_school_id on public.certificates_issued(school_id);
create index idx_certificates_issued_student_id on public.certificates_issued(student_id);
create index idx_expenses_school_id on public.expenses(school_id);
create index idx_payroll_school_id on public.payroll(school_id);
create index idx_payroll_staff_id on public.payroll(staff_id);
create index idx_academic_years_school_id on public.academic_years(school_id);
create index idx_grading_scales_school_id on public.grading_scales(school_id);
create index idx_fee_heads_school_id on public.fee_heads(school_id);
create index idx_fee_structures_school_id on public.fee_structures(school_id);
create index idx_student_transport_student_id on public.student_transport(student_id);
create index idx_student_transport_route_id on public.student_transport(route_id);
-- =========================================================
-- Sanad — Row-Level Security Policies
-- Based on 02_MASTER_BUILD_PROMPT.md Section 9
-- =========================================================

-- =========================================================
-- HELPER FUNCTIONS — Section 9.2
-- =========================================================

create or replace function public.current_staff_school_id()
returns uuid
language sql security definer stable
as $$
  select school_id from public.staff where id = auth.uid()
$$;

create or replace function public.current_staff_role()
returns public.staff_role
language sql security definer stable
as $$
  select role from public.staff where id = auth.uid()
$$;

create or replace function public.current_staff_secondary_role()
returns public.staff_role
language sql security definer stable
as $$
  select secondary_role from public.staff where id = auth.uid()
$$;

create or replace function public.current_guardian_student_ids()
returns setof uuid
language sql security definer stable
as $$
  select sg.student_id
  from public.student_guardians sg
  join public.guardians g on g.id = sg.guardian_id
  where g.auth_user_id = auth.uid()
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql security definer stable
as $$
  select exists (select 1 from public.platform_admins where id = auth.uid())
$$;

-- Helper to check if user has a specific role (primary or secondary)
create or replace function public.has_role(check_role public.staff_role)
returns boolean
language sql security definer stable
as $$
  select public.current_staff_role() = check_role
    or public.current_staff_secondary_role() = check_role
$$;

-- Helper to check if user is class teacher of a section
create or replace function public.is_class_teacher_of(section_uuid uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.sections
    where id = section_uuid and class_teacher_id = auth.uid()
  )
$$;

-- Helper to check if user teaches a section
create or replace function public.teaches_section(section_uuid uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.section_subject_teachers
    where section_id = section_uuid and teacher_id = auth.uid()
  )
$$;

-- =========================================================
-- ENABLE RLS ON ALL TABLES
-- =========================================================

alter table public.plans enable row level security;
alter table public.platform_admins enable row level security;
alter table public.schools enable row level security;
alter table public.subscriptions enable row level security;
alter table public.staff enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.sections enable row level security;
alter table public.subjects enable row level security;
alter table public.section_subject_teachers enable row level security;
alter table public.students enable row level security;
alter table public.guardians enable row level security;
alter table public.student_guardians enable row level security;
alter table public.student_attendance enable row level security;
alter table public.staff_attendance enable row level security;
alter table public.grading_scales enable row level security;
alter table public.exams enable row level security;
alter table public.exam_subject_schedule enable row level security;
alter table public.marks enable row level security;
alter table public.fee_heads enable row level security;
alter table public.fee_structures enable row level security;
alter table public.fee_invoices enable row level security;
alter table public.fee_invoice_items enable row level security;
alter table public.fee_payments enable row level security;
alter table public.expenses enable row level security;
alter table public.payroll enable row level security;
alter table public.leave_requests enable row level security;
alter table public.library_books enable row level security;
alter table public.library_transactions enable row level security;
alter table public.transport_routes enable row level security;
alter table public.transport_vehicles enable row level security;
alter table public.student_transport enable row level security;
alter table public.admission_inquiries enable row level security;
alter table public.certificates_issued enable row level security;
alter table public.homework enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- =========================================================
-- PLANS — Platform Admin only
-- =========================================================

create policy "plans_public_read"
on public.plans for select
using (true);

create policy "plans_platform_admin_all"
on public.plans for all
using (public.is_platform_admin());

-- =========================================================
-- PLATFORM ADMINS — Platform Admin only
-- =========================================================

create policy "platform_admins_platform_admin_all"
on public.platform_admins for all
using (public.is_platform_admin());

-- =========================================================
-- SCHOOLS — Platform Admin sees all, School Admin manages own
-- =========================================================

create policy "schools_platform_admin_all"
on public.schools for all
using (public.is_platform_admin());

create policy "schools_select_staff"
on public.schools for select
using (
  id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "schools_update_admin"
on public.schools for update
using (
  id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- SUBSCRIPTIONS — Platform Admin all, School Admin own
-- =========================================================

create policy "subscriptions_platform_admin_all"
on public.subscriptions for all
using (public.is_platform_admin());

create policy "subscriptions_select_staff"
on public.subscriptions for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "subscriptions_insert_admin"
on public.subscriptions for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- STAFF — School Admin full, Principal/HR view, others limited
-- =========================================================

create policy "staff_platform_admin_all"
on public.staff for all
using (public.is_platform_admin());

create policy "staff_select_own_school"
on public.staff for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "staff_insert_admin"
on public.staff for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "staff_update_admin"
on public.staff for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "staff_delete_admin"
on public.staff for delete
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- ACADEMIC YEARS — Admin/Principal view, Admin manages
-- =========================================================

create policy "academic_years_platform_admin_all"
on public.academic_years for all
using (public.is_platform_admin());

create policy "academic_years_select_staff"
on public.academic_years for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "academic_years_insert_admin"
on public.academic_years for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "academic_years_update_admin"
on public.academic_years for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- CLASSES — Admin manages, others view
-- =========================================================

create policy "classes_platform_admin_all"
on public.classes for all
using (public.is_platform_admin());

create policy "classes_select_staff"
on public.classes for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "classes_insert_admin"
on public.classes for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "classes_update_admin"
on public.classes for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "classes_delete_admin"
on public.classes for delete
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- SECTIONS — Admin manages, others view
-- =========================================================

create policy "sections_platform_admin_all"
on public.sections for all
using (public.is_platform_admin());

create policy "sections_select_staff"
on public.sections for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "sections_insert_admin"
on public.sections for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "sections_update_admin"
on public.sections for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "sections_delete_admin"
on public.sections for delete
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- SUBJECTS — Admin manages, others view
-- =========================================================

create policy "subjects_platform_admin_all"
on public.subjects for all
using (public.is_platform_admin());

create policy "subjects_select_staff"
on public.subjects for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "subjects_insert_admin"
on public.subjects for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "subjects_update_admin"
on public.subjects for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- SECTION_SUBJECT_TEACHERS — Admin manages
-- =========================================================

create policy "sst_platform_admin_all"
on public.section_subject_teachers for all
using (public.is_platform_admin());

create policy "sst_select_staff"
on public.section_subject_teachers for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "sst_insert_admin"
on public.section_subject_teachers for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "sst_delete_admin"
on public.section_subject_teachers for delete
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- STUDENTS — Complex role-based (Section 5 matrix)
-- =========================================================

create policy "students_platform_admin_all"
on public.students for all
using (public.is_platform_admin());

create policy "students_select_staff"
on public.students for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('principal')
    or public.has_role('front_desk')
    or public.has_role('librarian')
    or public.has_role('transport_coordinator')
    or public.has_role('exam_controller')
    or public.has_role('accountant')
    or (
      public.has_role('teacher')
      and (
        section_id in (
          select st.section_id from public.section_subject_teachers st where st.teacher_id = auth.uid()
        )
        or public.is_class_teacher_of(section_id)
      )
    )
  )
);

create policy "students_select_guardian"
on public.students for select
using (id in (select public.current_guardian_student_ids()));

create policy "students_insert_admin_frontdesk"
on public.students for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('front_desk'))
);

create policy "students_update_admin_principal"
on public.students for update
using (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('principal'))
);

create policy "students_delete_admin"
on public.students for delete
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- GUARDIANS — Admin/HR manage, others view
-- =========================================================

create policy "guardians_platform_admin_all"
on public.guardians for all
using (public.is_platform_admin());

create policy "guardians_select_staff"
on public.guardians for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "guardians_insert_admin"
on public.guardians for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('front_desk'))
);

create policy "guardians_update_admin"
on public.guardians for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- STUDENT_GUARDIANS — follows students pattern
-- =========================================================

create policy "sg_platform_admin_all"
on public.student_guardians for all
using (public.is_platform_admin());

create policy "sg_select_staff"
on public.student_guardians for select
using (
  student_id in (
    select id from public.students
    where school_id = public.current_staff_school_id()
  )
  or public.is_platform_admin()
);

create policy "sg_insert_admin"
on public.student_guardians for insert
with check (
  student_id in (
    select id from public.students
    where school_id = public.current_staff_school_id()
    and (public.has_role('school_admin') or public.has_role('front_desk'))
  )
);

-- =========================================================
-- STUDENT ATTENDANCE — Teacher marks own, Admin/Principal view all
-- =========================================================

create policy "sa_platform_admin_all"
on public.student_attendance for all
using (public.is_platform_admin());

create policy "sa_select_staff"
on public.student_attendance for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('principal')
    or (
      public.has_role('teacher')
      and (
        section_id in (
          select st.section_id from public.section_subject_teachers st where st.teacher_id = auth.uid()
        )
        or public.is_class_teacher_of(section_id)
      )
    )
  )
);

create policy "sa_select_guardian"
on public.student_attendance for select
using (
  student_id in (select public.current_guardian_student_ids())
);

create policy "sa_insert_teacher"
on public.student_attendance for insert
with check (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or (
      public.has_role('teacher')
      and (
        section_id in (
          select st.section_id from public.section_subject_teachers st where st.teacher_id = auth.uid()
        )
        or public.is_class_teacher_of(section_id)
      )
    )
  )
);

create policy "sa_update_teacher"
on public.student_attendance for update
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or (
      public.has_role('teacher')
      and marked_by = auth.uid()
    )
  )
);

-- =========================================================
-- STAFF ATTENDANCE — Admin manages, HR edits
-- =========================================================

create policy "sta_platform_admin_all"
on public.staff_attendance for all
using (public.is_platform_admin());

create policy "sta_select_staff"
on public.staff_attendance for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('principal')
    or public.has_role('hr_manager')
    or staff_id = auth.uid()
  )
);

create policy "sta_insert_admin"
on public.staff_attendance for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('hr_manager'))
);

create policy "sta_update_admin_hr"
on public.staff_attendance for update
using (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('hr_manager'))
);

-- =========================================================
-- GRADING SCALES — Exam Controller proposes, Admin approves
-- =========================================================

create policy "gs_platform_admin_all"
on public.grading_scales for all
using (public.is_platform_admin());

create policy "gs_select_staff"
on public.grading_scales for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "gs_insert_admin"
on public.grading_scales for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

create policy "gs_update_admin"
on public.grading_scales for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- EXAMS — Exam Controller manages, Admin approves
-- =========================================================

create policy "exams_platform_admin_all"
on public.exams for all
using (public.is_platform_admin());

create policy "exams_select_staff"
on public.exams for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "exams_insert_admin_examctrl"
on public.exams for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('exam_controller'))
);

create policy "exams_update_admin_examctrl"
on public.exams for update
using (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('exam_controller'))
);

-- =========================================================
-- EXAM SUBJECT SCHEDULE — follows exams pattern
-- =========================================================

create policy "ess_platform_admin_all"
on public.exam_subject_schedule for all
using (public.is_platform_admin());

create policy "ess_select_staff"
on public.exam_subject_schedule for select
using (
  exam_id in (
    select id from public.exams
    where school_id = public.current_staff_school_id()
  )
  or public.is_platform_admin()
);

create policy "ess_insert_examctrl"
on public.exam_subject_schedule for insert
with check (
  exam_id in (
    select id from public.exams
    where school_id = public.current_staff_school_id()
    and (public.has_role('school_admin') or public.has_role('exam_controller'))
  )
);

-- =========================================================
-- MARKS — Teacher enters, Exam Controller approves
-- =========================================================

create policy "marks_platform_admin_all"
on public.marks for all
using (public.is_platform_admin());

create policy "marks_select_staff"
on public.marks for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('exam_controller')
    or (
      public.has_role('teacher')
      and exam_subject_schedule_id in (
        select ess.id from public.exam_subject_schedule ess
        join public.section_subject_teachers sst on sst.section_id = ess.class_id
        where sst.teacher_id = auth.uid()
      )
    )
  )
);

create policy "marks_select_guardian"
on public.marks for select
using (
  student_id in (select public.current_guardian_student_ids())
  and exam_subject_schedule_id in (
    select ess.id from public.exam_subject_schedule ess
    join public.exams e on e.id = ess.exam_id
    where e.status = 'published'
  )
);

create policy "marks_insert_teacher"
on public.marks for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('teacher')
  and entered_by = auth.uid()
);

create policy "marks_update_examctrl"
on public.marks for update
using (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('exam_controller'))
);

-- =========================================================
-- FEE HEADS — Admin manages, Accountant views
-- =========================================================

create policy "fh_platform_admin_all"
on public.fee_heads for all
using (public.is_platform_admin());

create policy "fh_select_staff"
on public.fee_heads for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('accountant')
    or public.has_role('principal')
  )
);

create policy "fh_insert_admin"
on public.fee_heads for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- FEE STRUCTURES — Admin/Accountant manage
-- =========================================================

create policy "fs_platform_admin_all"
on public.fee_structures for all
using (public.is_platform_admin());

create policy "fs_select_staff"
on public.fee_structures for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('accountant')
  )
);

create policy "fs_insert_admin_acc"
on public.fee_structures for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('accountant'))
);

create policy "fs_update_admin"
on public.fee_structures for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);

-- =========================================================
-- FEE INVOICES — Admin/Accountant manage, Guardian view own
-- =========================================================

create policy "fi_platform_admin_all"
on public.fee_invoices for all
using (public.is_platform_admin());

create policy "fi_select_staff"
on public.fee_invoices for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('accountant')
    or public.has_role('principal')
    or public.has_role('front_desk')
  )
);

create policy "fi_select_guardian"
on public.fee_invoices for select
using (
  student_id in (select public.current_guardian_student_ids())
);

create policy "fi_insert_admin_acc"
on public.fee_invoices for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('accountant'))
);

create policy "fi_update_admin_acc"
on public.fee_invoices for update
using (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('accountant'))
);

-- =========================================================
-- FEE INVOICE ITEMS — follows invoices pattern
-- =========================================================

create policy "fii_platform_admin_all"
on public.fee_invoice_items for all
using (public.is_platform_admin());

create policy "fii_select_staff"
on public.fee_invoice_items for select
using (
  invoice_id in (
    select id from public.fee_invoices
    where school_id = public.current_staff_school_id()
  )
);

create policy "fii_insert_admin_acc"
on public.fee_invoice_items for insert
with check (
  invoice_id in (
    select id from public.fee_invoices
    where school_id = public.current_staff_school_id()
    and (public.has_role('school_admin') or public.has_role('accountant'))
  )
);

-- =========================================================
-- FEE PAYMENTS — Admin/Accountant/FrontDesk manage
-- =========================================================

create policy "fp_platform_admin_all"
on public.fee_payments for all
using (public.is_platform_admin());

create policy "fp_select_staff"
on public.fee_payments for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('accountant')
    or public.has_role('principal')
  )
);

create policy "fp_insert_admin_acc_fd"
on public.fee_payments for insert
with check (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('accountant')
    or public.has_role('front_desk')
  )
);

-- =========================================================
-- EXPENSES — Admin/Accountant manage, Principal view
-- =========================================================

create policy "expenses_platform_admin_all"
on public.expenses for all
using (public.is_platform_admin());

create policy "expenses_select_staff"
on public.expenses for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('accountant')
    or public.has_role('principal')
  )
);

create policy "expenses_insert_admin_acc"
on public.expenses for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('accountant'))
);

-- =========================================================
-- PAYROLL — Admin/Accountant manage, HR input
-- =========================================================

create policy "payroll_platform_admin_all"
on public.payroll for all
using (public.is_platform_admin());

create policy "payroll_select_staff"
on public.payroll for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('accountant')
    or staff_id = auth.uid()
  )
);

create policy "payroll_insert_admin_acc"
on public.payroll for insert
with check (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('accountant'))
);

create policy "payroll_update_admin_acc"
on public.payroll for update
using (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('accountant'))
);

-- =========================================================
-- LEAVE REQUESTS — All submit, Admin/HR approve
-- =========================================================

create policy "lr_platform_admin_all"
on public.leave_requests for all
using (public.is_platform_admin());

create policy "lr_select_staff"
on public.leave_requests for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('hr_manager')
    or public.has_role('principal')
    or staff_id = auth.uid()
  )
);

create policy "lr_insert_staff"
on public.leave_requests for insert
with check (
  school_id = public.current_staff_school_id()
  and staff_id = auth.uid()
);

create policy "lr_update_admin_hr"
on public.leave_requests for update
using (
  school_id = public.current_staff_school_id()
  and (public.has_role('school_admin') or public.has_role('hr_manager'))
);

-- =========================================================
-- LIBRARY BOOKS — Librarian manages
-- =========================================================

create policy "lb_platform_admin_all"
on public.library_books for all
using (public.is_platform_admin());

create policy "lb_select_staff"
on public.library_books for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('librarian')
    or public.has_role('principal')
  )
);

create policy "lb_insert_librarian"
on public.library_books for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('librarian')
);

create policy "lb_update_librarian"
on public.library_books for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('librarian')
);

-- =========================================================
-- LIBRARY TRANSACTIONS — Librarian manages
-- =========================================================

create policy "lt_platform_admin_all"
on public.library_transactions for all
using (public.is_platform_admin());

create policy "lt_select_staff"
on public.library_transactions for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('librarian')
  )
);

create policy "lt_insert_librarian"
on public.library_transactions for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('librarian')
);

create policy "lt_update_librarian"
on public.library_transactions for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('librarian')
);

-- =========================================================
-- TRANSPORT ROUTES — Transport Coordinator manages
-- =========================================================

create policy "tr_platform_admin_all"
on public.transport_routes for all
using (public.is_platform_admin());

create policy "tr_select_staff"
on public.transport_routes for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('transport_coordinator')
    or public.has_role('principal')
  )
);

create policy "tr_insert_tc"
on public.transport_routes for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('transport_coordinator')
);

create policy "tr_update_tc"
on public.transport_routes for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('transport_coordinator')
);

-- =========================================================
-- TRANSPORT VEHICLES — Transport Coordinator manages
-- =========================================================

create policy "tv_platform_admin_all"
on public.transport_vehicles for all
using (public.is_platform_admin());

create policy "tv_select_staff"
on public.transport_vehicles for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('transport_coordinator')
  )
);

create policy "tv_insert_tc"
on public.transport_vehicles for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('transport_coordinator')
);

create policy "tv_update_tc"
on public.transport_vehicles for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('transport_coordinator')
);

-- =========================================================
-- STUDENT TRANSPORT — Transport Coordinator manages
-- =========================================================

create policy "st_platform_admin_all"
on public.student_transport for all
using (public.is_platform_admin());

create policy "st_select_staff"
on public.student_transport for select
using (
  student_id in (
    select id from public.students
    where school_id = public.current_staff_school_id()
  )
  and (
    public.has_role('school_admin')
    or public.has_role('transport_coordinator')
  )
);

create policy "st_select_guardian"
on public.student_transport for select
using (
  student_id in (select public.current_guardian_student_ids())
);

create policy "st_insert_tc"
on public.student_transport for insert
with check (
  student_id in (
    select id from public.students
    where school_id = public.current_staff_school_id()
  )
  and public.has_role('transport_coordinator')
);

-- =========================================================
-- ADMISSION INQUIRIES — Front Desk manages
-- =========================================================

create policy "ai_platform_admin_all"
on public.admission_inquiries for all
using (public.is_platform_admin());

create policy "ai_select_staff"
on public.admission_inquiries for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('front_desk')
    or public.has_role('principal')
  )
);

create policy "ai_insert_fd"
on public.admission_inquiries for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('front_desk')
);

create policy "ai_update_fd"
on public.admission_inquiries for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('front_desk')
);

-- =========================================================
-- CERTIFICATES ISSUED — Front Desk issues, Guardian view
-- =========================================================

create policy "ci_platform_admin_all"
on public.certificates_issued for all
using (public.is_platform_admin());

create policy "ci_select_staff"
on public.certificates_issued for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('front_desk')
    or public.has_role('principal')
  )
);

create policy "ci_select_guardian"
on public.certificates_issued for select
using (
  student_id in (select public.current_guardian_student_ids())
);

create policy "ci_insert_fd"
on public.certificates_issued for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('front_desk')
);

-- =========================================================
-- HOMEWORK — Teacher creates, Parent view
-- =========================================================

create policy "hw_platform_admin_all"
on public.homework for all
using (public.is_platform_admin());

create policy "hw_select_staff"
on public.homework for select
using (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('principal')
    or (
      public.has_role('teacher')
      and section_id in (
        select st.section_id from public.section_subject_teachers st where st.teacher_id = auth.uid()
      )
    )
    or (
      public.has_role('teacher')
      and public.is_class_teacher_of(section_id)
    )
  )
);

create policy "hw_select_guardian"
on public.homework for select
using (
  section_id in (
    select s.id from public.sections s
    join public.students st on st.section_id = s.id
    where st.id in (select public.current_guardian_student_ids())
  )
);

create policy "hw_insert_teacher"
on public.homework for insert
with check (
  school_id = public.current_staff_school_id()
  and public.has_role('teacher')
  and created_by = auth.uid()
);

create policy "hw_update_teacher"
on public.homework for update
using (
  school_id = public.current_staff_school_id()
  and public.has_role('teacher')
  and created_by = auth.uid()
);

create policy "hw_delete_teacher"
on public.homework for delete
using (
  school_id = public.current_staff_school_id()
  and public.has_role('teacher')
  and created_by = auth.uid()
);

-- =========================================================
-- ANNOUNCEMENTS — Admin/Principal/Teacher create
-- =========================================================

create policy "ann_platform_admin_all"
on public.announcements for all
using (public.is_platform_admin());

create policy "ann_select_staff"
on public.announcements for select
using (
  school_id = public.current_staff_school_id()
  or public.is_platform_admin()
);

create policy "ann_select_guardian"
on public.announcements for select
using (
  school_id = public.current_staff_school_id()
  and (
    audience = 'all'
    or audience = 'parents'
    or (
      audience = 'specific_section'
      and section_id in (
        select s.id from public.sections s
        join public.students st on st.section_id = s.id
        where st.id in (select public.current_guardian_student_ids())
      )
    )
  )
);

create policy "ann_insert_admin_principal"
on public.announcements for insert
with check (
  school_id = public.current_staff_school_id()
  and (
    public.has_role('school_admin')
    or public.has_role('principal')
    or (
      public.has_role('teacher')
      and audience = 'specific_section'
      and public.is_class_teacher_of(section_id)
    )
  )
);

-- =========================================================
-- NOTIFICATIONS — Recipient sees own
-- =========================================================

create policy "notif_platform_admin_all"
on public.notifications for all
using (public.is_platform_admin());

create policy "notif_select_recipient"
on public.notifications for select
using (
  recipient_user_id = auth.uid()
  or public.is_platform_admin()
);

create policy "notif_update_recipient"
on public.notifications for update
using (
  recipient_user_id = auth.uid()
);

-- =========================================================
-- AUDIT LOGS — Admin views own, Platform Admin all
-- =========================================================

create policy "al_platform_admin_all"
on public.audit_logs for all
using (public.is_platform_admin());

create policy "al_select_admin"
on public.audit_logs for select
using (
  school_id = public.current_staff_school_id()
  and public.has_role('school_admin')
);
-- =========================================================
-- Sanad — Seed Default Plans
-- Based on 02_MASTER_BUILD_PROMPT.md Section 7
-- =========================================================

insert into public.plans (name, slug, price_pkr_monthly, price_pkr_yearly, max_students, max_staff, storage_limit_mb, features) values
  ('Trial', 'trial', 0, 0, 100, 20, 500, '{"all": true}'),
  ('Starter', 'starter', 2999, 29990, 100, 30, 1000, '{"all": true}'),
  ('Growth', 'growth', 7999, 79990, 500, 100, 5000, '{"all": true}'),
  ('Institution', 'institution', 15999, 159990, 1500, 300, 20000, '{"all": true}'),
  ('Enterprise', 'enterprise', 0, 0, null, null, null, '{"all": true}');
