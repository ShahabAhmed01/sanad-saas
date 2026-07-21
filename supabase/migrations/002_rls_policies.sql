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
