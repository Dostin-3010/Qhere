-- QHERE - Core Supabase Schema
-- Target schema for the current frontend application.
-- Optional roadmap tables live in: database/future_tables.sql

begin;

create extension if not exists pgcrypto;

-- This file focuses on the data model, compatibility fields, and
-- storage setup. Table-level RLS is intentionally not forced here
-- because the current app still provisions some users directly from
-- the browser and would need a server-side auth flow before strict
-- policies can be enforced safely.

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  telefono text,
  email text,
  director text,
  academic_period_start date,
  academic_period_end date,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  allowed_radius_m numeric(8, 2) default 150,
  configurado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  full_name text not null,
  email text not null,
  role text not null check (role in ('parent', 'teacher', 'admin')),
  approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected')),
  approval_requested_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  approval_note text,
  phone text,
  permisos text[] not null default array[]::text[],
  secciones_ids uuid[] not null default array[]::uuid[],
  margen_tardanza_minutos integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grade_sections (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  grado text not null,
  seccion text not null,
  turno text not null check (turno in ('manana', 'tarde', 'noche')),
  special_schedule_enabled boolean not null default false,
  hora_entrada_especial time,
  hora_salida_especial time,
  hora_limite_tardanza_especial time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  turno text not null check (turno in ('manana', 'tarde', 'noche')),
  hora_entrada time not null,
  hora_salida time not null,
  hora_limite_tardanza time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.school_calendar (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  fecha date not null,
  tipo text not null check (tipo in ('feriado', 'vacaciones', 'evento')),
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete set null,
  grade_section_id uuid references public.grade_sections(id) on delete set null,
  nombre text not null,
  matricula text not null,
  full_name text,
  enrollment_code text,
  grade text,
  section text,
  parent_id uuid references public.profiles(id) on delete set null,
  qr_token text,
  qr_token_updated_at timestamptz,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relacion text not null default 'padre' check (relacion in ('padre', 'madre', 'tutor', 'encargado', 'otro')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_teachers (
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  created_at timestamptz not null default now(),
  primary key (student_id, teacher_id, subject)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  fecha date not null,
  hora_entrada time,
  hora_salida time,
  estado text not null default 'presente' check (estado in ('presente', 'tarde', 'ausente', 'justificado')),
  dispositivo text,
  minutos_tarde integer not null default 0,
  limite_tardanza_aplicado time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.excuses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  attendance_id uuid references public.attendance(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  absence_date date not null,
  excuse_type text,
  reason text not null,
  attachment_url text,
  teacher_comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  excuse_id uuid references public.excuses(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  title text,
  body text,
  is_read boolean not null default false,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  accion text not null,
  tabla text not null,
  registro_id uuid,
  dispositivo text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists grade_sections_school_grade_section_turno_key
  on public.grade_sections (school_id, grado, seccion, turno);

create unique index if not exists schedules_school_turno_key
  on public.schedules (school_id, turno);

create unique index if not exists school_calendar_school_fecha_key
  on public.school_calendar (school_id, fecha);

create unique index if not exists students_matricula_key
  on public.students (matricula);

create unique index if not exists students_qr_token_key
  on public.students (qr_token)
  where qr_token is not null;

create unique index if not exists parents_profile_student_key
  on public.parents (profile_id, student_id);

create unique index if not exists attendance_student_date_key
  on public.attendance (student_id, fecha);

create index if not exists profiles_role_idx
  on public.profiles (role);

create index if not exists profiles_approval_status_idx
  on public.profiles (approval_status);

create index if not exists profiles_school_approval_status_idx
  on public.profiles (school_id, approval_status);

create index if not exists students_grade_section_id_idx
  on public.students (grade_section_id);

create index if not exists parents_profile_id_idx
  on public.parents (profile_id);

create index if not exists parents_student_id_idx
  on public.parents (student_id);

create index if not exists attendance_teacher_date_idx
  on public.attendance (teacher_id, fecha);

create index if not exists excuses_parent_id_idx
  on public.excuses (parent_id);

create index if not exists excuses_student_id_idx
  on public.excuses (student_id);

create index if not exists excuses_status_idx
  on public.excuses (status);

create index if not exists notifications_teacher_id_idx
  on public.notifications (teacher_id, sent_at desc);

create index if not exists audit_log_user_created_at_idx
  on public.audit_log (user_id, created_at desc);

create or replace view public.grades_sections as
select *
from public.grade_sections;

create or replace view public.teachers as
select
  id,
  school_id,
  full_name as nombre,
  full_name,
  email,
  phone,
  permisos,
  secciones_ids,
  margen_tardanza_minutos,
  created_at,
  updated_at
from public.profiles
where role = 'teacher';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_student_legacy_fields()
returns trigger
language plpgsql
as $$
declare
  section_school_id uuid;
  section_grade text;
  section_name text;
begin
  if new.nombre is null and new.full_name is not null then
    new.nombre := new.full_name;
  end if;

  if new.full_name is null and new.nombre is not null then
    new.full_name := new.nombre;
  end if;

  if new.matricula is null and new.enrollment_code is not null then
    new.matricula := new.enrollment_code;
  end if;

  if new.enrollment_code is null and new.matricula is not null then
    new.enrollment_code := new.matricula;
  end if;

  if new.grade_section_id is not null then
    select school_id, grado, seccion
      into section_school_id, section_grade, section_name
    from public.grade_sections
    where id = new.grade_section_id;

    if new.school_id is null then
      new.school_id := section_school_id;
    end if;

    if new.grade is null or btrim(new.grade) = '' then
      new.grade := section_grade;
    end if;

    if new.section is null or btrim(new.section) = '' then
      new.section := section_name;
    end if;
  end if;

  if new.qr_token is not null and new.qr_token_updated_at is null then
    new.qr_token_updated_at := now();
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  requested_status text;
  requested_school_id uuid;
  requested_role text;
begin
  requested_status := lower(coalesce(new.raw_user_meta_data->>'approval_status', 'approved'));
  if requested_status not in ('pending', 'approved', 'rejected') then
    requested_status := 'approved';
  end if;

  requested_role := lower(coalesce(new.raw_user_meta_data->>'role', 'parent'));
  if requested_role not in ('parent', 'teacher', 'admin') then
    requested_role := 'parent';
  end if;

  requested_school_id := case
    when coalesce(new.raw_user_meta_data->>'school_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then (new.raw_user_meta_data->>'school_id')::uuid
    else null
  end;

  insert into public.profiles (id, school_id, full_name, email, role, approval_status, approval_requested_at)
  values (
    new.id,
    requested_school_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    requested_role,
    requested_status,
    case when requested_status = 'pending' then now() else null end
  )
  on conflict (id) do update
    set email = excluded.email,
        school_id = coalesce(public.profiles.school_id, excluded.school_id),
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        role = coalesce(public.profiles.role, excluded.role),
        approval_status = coalesce(public.profiles.approval_status, excluded.approval_status),
        approval_requested_at = coalesce(public.profiles.approval_requested_at, excluded.approval_requested_at),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists schools_set_updated_at on public.schools;
create trigger schools_set_updated_at
  before update on public.schools
  for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists grade_sections_set_updated_at on public.grade_sections;
create trigger grade_sections_set_updated_at
  before update on public.grade_sections
  for each row execute procedure public.set_updated_at();

drop trigger if exists schedules_set_updated_at on public.schedules;
create trigger schedules_set_updated_at
  before update on public.schedules
  for each row execute procedure public.set_updated_at();

drop trigger if exists students_sync_legacy_fields on public.students;
create trigger students_sync_legacy_fields
  before insert or update on public.students
  for each row execute procedure public.sync_student_legacy_fields();

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
  before update on public.students
  for each row execute procedure public.set_updated_at();

drop trigger if exists attendance_set_updated_at on public.attendance;
create trigger attendance_set_updated_at
  before update on public.attendance
  for each row execute procedure public.set_updated_at();

drop trigger if exists excuses_set_updated_at on public.excuses;
create trigger excuses_set_updated_at
  before update on public.excuses
  for each row execute procedure public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
select 'excuses', 'excuses', true
where not exists (
  select 1
  from storage.buckets
  where id = 'excuses'
);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Excuse files are publicly readable'
  ) then
    execute $policy$
      create policy "Excuse files are publicly readable"
      on storage.objects for select
      using (bucket_id = 'excuses')
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can upload excuse files'
  ) then
    execute $policy$
      create policy "Authenticated users can upload excuse files"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'excuses')
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can update excuse files'
  ) then
    execute $policy$
      create policy "Authenticated users can update excuse files"
      on storage.objects for update to authenticated
      using (bucket_id = 'excuses')
      with check (bucket_id = 'excuses')
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can delete excuse files'
  ) then
    execute $policy$
      create policy "Authenticated users can delete excuse files"
      on storage.objects for delete to authenticated
      using (bucket_id = 'excuses')
    $policy$;
  end if;
end
$$;

commit;

notify pgrst, 'reload schema';
