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
  primary_color text default '#B8862F',
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
