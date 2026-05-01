-- QHere - Full Supabase Script
-- Incluye tablas, indices, vistas, triggers, storage, migraciones, RPC y realtime.
-- Generado para entrega academica.


-- ============================================================
-- Source: database/schema.sql
-- ============================================================
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


-- ============================================================
-- Source: database/migrations/2026-03-24_add_admin_excuses_select_policy.sql
-- ============================================================
begin;

drop policy if exists "Admin ve todas las excusas" on public.excuses;

create policy "Admin ve todas las excusas"
  on public.excuses for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

commit;


-- ============================================================
-- Source: database/migrations/2026-03-24_add_real_qr_and_teacher_lateness.sql
-- ============================================================
begin;

create extension if not exists pgcrypto;

alter table if exists public.students
  add column if not exists qr_token text,
  add column if not exists qr_token_updated_at timestamptz default now();

update public.students
set
  qr_token = coalesce(nullif(qr_token, ''), encode(gen_random_bytes(16), 'hex')),
  qr_token_updated_at = coalesce(qr_token_updated_at, now())
where qr_token is null or btrim(qr_token) = '';

create unique index if not exists students_qr_token_key
  on public.students (qr_token)
  where qr_token is not null;

alter table if exists public.profiles
  add column if not exists margen_tardanza_minutos integer not null default 30;

update public.profiles
set margen_tardanza_minutos = 30
where margen_tardanza_minutos is null;

alter table if exists public.attendance
  add column if not exists minutos_tarde integer not null default 0,
  add column if not exists limite_tardanza_aplicado time;

commit;

notify pgrst, 'reload schema';


-- ============================================================
-- Source: database/migrations/2026-03-24_align_excuses_to_english.sql
-- ============================================================
begin;

alter table public.excuses
  add column if not exists attendance_id uuid,
  add column if not exists teacher_id uuid references public.profiles(id),
  add column if not exists absence_date date,
  add column if not exists excuse_type text,
  add column if not exists reason text,
  add column if not exists attachment_url text,
  add column if not exists teacher_comment text,
  add column if not exists status text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'fecha_ausencia'
  ) then
    execute $sql$
      update public.excuses
      set absence_date = fecha_ausencia
      where absence_date is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'tipo_ausencia'
  ) then
    execute $sql$
      update public.excuses
      set excuse_type = tipo_ausencia
      where excuse_type is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'motivo'
  ) then
    execute $sql$
      update public.excuses
      set reason = motivo
      where reason is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'evidencia_url'
  ) then
    execute $sql$
      update public.excuses
      set attachment_url = evidencia_url
      where attachment_url is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'comentario_docente'
  ) then
    execute $sql$
      update public.excuses
      set teacher_comment = comentario_docente
      where teacher_comment is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'estado'
  ) then
    execute $sql$
      update public.excuses
      set status = case estado
        when 'pending' then 'pending'
        when 'approved' then 'approved'
        when 'rejected' then 'rejected'
        when 'pendiente' then 'pending'
        when 'aprobada' then 'approved'
        when 'rechazada' then 'rejected'
        else coalesce(status, 'pending')
      end
      where status is null
         or status not in ('pending', 'approved', 'rejected')
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'revisado_en'
  ) then
    execute $sql$
      update public.excuses
      set reviewed_at = revisado_en
      where reviewed_at is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'revisado_por'
  ) then
    execute $sql$
      update public.excuses
      set reviewed_by = revisado_por
      where reviewed_by is null
    $sql$;
  end if;
end $$;

update public.excuses
set status = case
  when status in ('pending', 'approved', 'rejected') then status
  when status = 'pendiente' then 'pending'
  when status = 'aprobada' then 'approved'
  when status = 'rechazada' then 'rejected'
  else 'pending'
end
where status is null
   or status not in ('pending', 'approved', 'rejected');

alter table public.excuses
  alter column absence_date set not null,
  alter column reason set not null,
  alter column status set default 'pending',
  alter column status set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'excuses_estado_check'
  ) then
    alter table public.excuses
      drop constraint excuses_estado_check;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'excuses_status_check'
  ) then
    alter table public.excuses
      add constraint excuses_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

insert into storage.buckets (id, name, public)
select 'excuses', 'excuses', true
where not exists (
  select 1
  from storage.buckets
  where id = 'excuses'
);

alter table public.excuses
  drop column if exists fecha_ausencia,
  drop column if exists tipo_ausencia,
  drop column if exists motivo,
  drop column if exists evidencia_url,
  drop column if exists comentario_docente,
  drop column if exists estado,
  drop column if exists revisado_en,
  drop column if exists revisado_por;

commit;


-- ============================================================
-- Source: database/migrations/2026-04-07_add_future_feature_tables.sql
-- ============================================================
-- QHERE - Future support tables
-- Run after the core schema migration.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.authorized_devices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  device_fingerprint text not null,
  device_name text,
  device_type text not null default 'web'
    check (device_type in ('web', 'android', 'ios', 'desktop', 'other')),
  platform text,
  app_version text,
  last_ip inet,
  last_user_agent text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'blocked', 'revoked')),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  notes text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists authorized_devices_profile_fingerprint_key
  on public.authorized_devices (profile_id, device_fingerprint);

create index if not exists authorized_devices_profile_status_idx
  on public.authorized_devices (profile_id, status, last_seen_at desc);

drop trigger if exists authorized_devices_set_updated_at on public.authorized_devices;
create trigger authorized_devices_set_updated_at
  before update on public.authorized_devices
  for each row execute procedure public.set_updated_at();

alter table public.authorized_devices enable row level security;

drop policy if exists "Admins manage authorized devices" on public.authorized_devices;
create policy "Admins manage authorized devices"
  on public.authorized_devices
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Users read own devices" on public.authorized_devices;
create policy "Users read own devices"
  on public.authorized_devices
  for select
  using (profile_id = auth.uid());

drop policy if exists "Users register own devices" on public.authorized_devices;
create policy "Users register own devices"
  on public.authorized_devices
  for insert
  with check (profile_id = auth.uid());

drop policy if exists "Users update own devices" on public.authorized_devices;
create policy "Users update own devices"
  on public.authorized_devices
  for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create table if not exists public.attendance_geo_events (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendance(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  recorded_by uuid references public.profiles(id) on delete set null,
  event_type text not null default 'check_in'
    check (event_type in ('check_in', 'check_out', 'manual', 'excuse_review', 'system')),
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  accuracy_m numeric(8, 2),
  source text not null default 'mobile'
    check (source in ('mobile', 'web', 'system')),
  metadata jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create index if not exists attendance_geo_events_attendance_idx
  on public.attendance_geo_events (attendance_id, captured_at desc);

create index if not exists attendance_geo_events_student_idx
  on public.attendance_geo_events (student_id, captured_at desc);

alter table public.attendance_geo_events enable row level security;

drop policy if exists "Admins manage attendance geo events" on public.attendance_geo_events;
create policy "Admins manage attendance geo events"
  on public.attendance_geo_events
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Teachers read related geo events" on public.attendance_geo_events;
create policy "Teachers read related geo events"
  on public.attendance_geo_events
  for select
  using (
    exists (
      select 1
      from public.attendance a
      where a.id = attendance_geo_events.attendance_id
        and a.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers insert own geo events" on public.attendance_geo_events;
create policy "Teachers insert own geo events"
  on public.attendance_geo_events
  for insert
  with check (
    recorded_by = auth.uid()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('teacher', 'admin')
    )
  );

drop policy if exists "Parents read linked geo events" on public.attendance_geo_events;
create policy "Parents read linked geo events"
  on public.attendance_geo_events
  for select
  using (
    exists (
      select 1
      from public.parents pa
      where pa.profile_id = auth.uid()
        and pa.student_id = attendance_geo_events.student_id
    )
    or exists (
      select 1
      from public.students s
      where s.id = attendance_geo_events.student_id
        and s.parent_id = auth.uid()
    )
  );

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  related_table text,
  related_id uuid,
  channel text not null
    check (channel in ('email', 'sms', 'push', 'whatsapp')),
  template_key text,
  subject text,
  payload jsonb not null default '{}'::jsonb,
  priority smallint not null default 5
    check (priority between 1 and 10),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_for timestamptz,
  locked_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notification_queue_status_scheduled_idx
  on public.notification_queue (status, scheduled_for, priority);

create index if not exists notification_queue_recipient_idx
  on public.notification_queue (recipient_id, created_at desc);

create index if not exists notification_queue_student_idx
  on public.notification_queue (student_id, created_at desc);

drop trigger if exists notification_queue_set_updated_at on public.notification_queue;
create trigger notification_queue_set_updated_at
  before update on public.notification_queue
  for each row execute procedure public.set_updated_at();

alter table public.notification_queue enable row level security;

drop policy if exists "Admins manage notification queue" on public.notification_queue;
create policy "Admins manage notification queue"
  on public.notification_queue
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Recipients read own queue items" on public.notification_queue;
create policy "Recipients read own queue items"
  on public.notification_queue
  for select
  using (recipient_id = auth.uid());

create table if not exists public.gradebook_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  grade_section_id uuid references public.grade_sections(id) on delete set null,
  subject text not null,
  period text not null,
  assessment_name text not null,
  assessment_type text not null default 'assignment'
    check (assessment_type in ('assignment', 'quiz', 'exam', 'project', 'participation', 'behavior', 'other')),
  weight numeric(5, 2),
  score numeric(6, 2),
  max_score numeric(6, 2),
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'imported', 'archived')),
  external_source text,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gradebook_entries_student_period_idx
  on public.gradebook_entries (student_id, period, subject);

create index if not exists gradebook_entries_teacher_created_idx
  on public.gradebook_entries (teacher_id, created_at desc);

create unique index if not exists gradebook_entries_import_ref_key
  on public.gradebook_entries (student_id, external_source, external_ref)
  where external_ref is not null;

drop trigger if exists gradebook_entries_set_updated_at on public.gradebook_entries;
create trigger gradebook_entries_set_updated_at
  before update on public.gradebook_entries
  for each row execute procedure public.set_updated_at();

alter table public.gradebook_entries enable row level security;

drop policy if exists "Admins manage gradebook entries" on public.gradebook_entries;
create policy "Admins manage gradebook entries"
  on public.gradebook_entries
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Teachers manage own gradebook entries" on public.gradebook_entries;
create policy "Teachers manage own gradebook entries"
  on public.gradebook_entries
  for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "Parents read linked gradebook entries" on public.gradebook_entries;
create policy "Parents read linked gradebook entries"
  on public.gradebook_entries
  for select
  using (
    exists (
      select 1
      from public.parents pa
      where pa.profile_id = auth.uid()
        and pa.student_id = gradebook_entries.student_id
    )
    or exists (
      select 1
      from public.students s
      where s.id = gradebook_entries.student_id
        and s.parent_id = auth.uid()
    )
  );

commit;

notify pgrst, 'reload schema';


-- ============================================================
-- Source: database/migrations/2026-04-07_add_registration_approval_flow.sql
-- ============================================================


-- ============================================================
-- Source: database/migrations/2026-04-07_complete_core_school_schema.sql
-- ============================================================
begin;

create extension if not exists pgcrypto;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  telefono text,
  email text,
  director text,
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
  tipo text not null check (tipo in ('feriado', 'vacaciones')),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete set null,
  grade_section_id uuid references public.grade_sections(id) on delete set null,
  nombre text,
  matricula text,
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

alter table if exists public.profiles
  add column if not exists school_id uuid references public.schools(id) on delete set null,
  add column if not exists permisos text[] not null default array[]::text[],
  add column if not exists secciones_ids uuid[] not null default array[]::uuid[],
  add column if not exists margen_tardanza_minutos integer not null default 30,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles
set permisos = array[]::text[]
where permisos is null;

update public.profiles
set secciones_ids = array[]::uuid[]
where secciones_ids is null;

update public.profiles
set margen_tardanza_minutos = 30
where margen_tardanza_minutos is null;

alter table if exists public.students
  add column if not exists school_id uuid references public.schools(id) on delete set null,
  add column if not exists grade_section_id uuid references public.grade_sections(id) on delete set null,
  add column if not exists nombre text,
  add column if not exists matricula text,
  add column if not exists full_name text,
  add column if not exists enrollment_code text,
  add column if not exists grade text,
  add column if not exists section text,
  add column if not exists qr_token text,
  add column if not exists qr_token_updated_at timestamptz,
  add column if not exists activo boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.students
set nombre = coalesce(nullif(nombre, ''), nullif(full_name, ''), 'Sin nombre')
where nombre is null
   or btrim(nombre) = '';

update public.students
set matricula = coalesce(nullif(matricula, ''), nullif(enrollment_code, ''), concat('TMP-', substr(id::text, 1, 8)))
where matricula is null
   or btrim(matricula) = '';

update public.students
set full_name = coalesce(nullif(full_name, ''), nombre)
where full_name is null
   or btrim(full_name) = '';

update public.students
set enrollment_code = coalesce(nullif(enrollment_code, ''), matricula)
where enrollment_code is null
   or btrim(enrollment_code) = '';

update public.students s
set school_id = coalesce(s.school_id, gs.school_id),
    grade = coalesce(nullif(s.grade, ''), gs.grado),
    section = coalesce(nullif(s.section, ''), gs.seccion)
from public.grade_sections gs
where s.grade_section_id = gs.id;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'parent_id'
  ) then
    alter table public.students alter column parent_id drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'full_name'
  ) then
    alter table public.students alter column full_name drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'enrollment_code'
  ) then
    alter table public.students alter column enrollment_code drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'grade'
  ) then
    alter table public.students alter column grade drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'section'
  ) then
    alter table public.students alter column section drop not null;
  end if;
end
$$;

alter table public.students
  alter column nombre set not null,
  alter column matricula set not null;

insert into public.parents (profile_id, student_id, relacion)
select distinct parent_id, id, 'padre'
from public.students
where parent_id is not null
on conflict do nothing;

alter table if exists public.attendance
  add column if not exists minutos_tarde integer not null default 0,
  add column if not exists limite_tardanza_aplicado time,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.attendance
set minutos_tarde = 0
where minutos_tarde is null;

alter table if exists public.excuses
  add column if not exists attendance_id uuid references public.attendance(id) on delete set null,
  add column if not exists teacher_id uuid references public.profiles(id) on delete set null,
  add column if not exists absence_date date,
  add column if not exists excuse_type text,
  add column if not exists reason text,
  add column if not exists attachment_url text,
  add column if not exists teacher_comment text,
  add column if not exists status text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'fecha_ausencia'
  ) then
    execute $sql$
      update public.excuses
      set absence_date = fecha_ausencia
      where absence_date is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'tipo_ausencia'
  ) then
    execute $sql$
      update public.excuses
      set excuse_type = tipo_ausencia
      where excuse_type is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'motivo'
  ) then
    execute $sql$
      update public.excuses
      set reason = motivo
      where reason is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'evidencia_url'
  ) then
    execute $sql$
      update public.excuses
      set attachment_url = evidencia_url
      where attachment_url is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'comentario_docente'
  ) then
    execute $sql$
      update public.excuses
      set teacher_comment = comentario_docente
      where teacher_comment is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'estado'
  ) then
    execute $sql$
      update public.excuses
      set status = case estado
        when 'pending' then 'pending'
        when 'approved' then 'approved'
        when 'rejected' then 'rejected'
        when 'pendiente' then 'pending'
        when 'aprobada' then 'approved'
        when 'rechazada' then 'rejected'
        else coalesce(status, 'pending')
      end
      where status is null
         or status not in ('pending', 'approved', 'rejected')
    $sql$;
  end if;
end
$$;

update public.excuses
set status = case
  when status in ('pending', 'approved', 'rejected') then status
  when status = 'pendiente' then 'pending'
  when status = 'aprobada' then 'approved'
  when status = 'rechazada' then 'rejected'
  else 'pending'
end
where status is null
   or status not in ('pending', 'approved', 'rejected');

update public.excuses
set updated_at = created_at
where updated_at is null;

alter table public.excuses
  alter column absence_date set not null,
  alter column reason set not null,
  alter column status set default 'pending',
  alter column status set not null;

alter table if exists public.notifications
  add column if not exists title text,
  add column if not exists body text,
  add column if not exists read_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table if exists public.audit_log
  add column if not exists created_at timestamptz not null default now();

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
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        role = coalesce(public.profiles.role, excluded.role),
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


-- ============================================================
-- Source: database/migrations/2026-04-22_complete_remaining_school_requirements.sql
-- ============================================================
begin;

alter table if exists public.schools
  add column if not exists academic_period_start date,
  add column if not exists academic_period_end date,
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  add column if not exists allowed_radius_m numeric(8, 2) default 150;

update public.schools
set allowed_radius_m = 150
where allowed_radius_m is null;

alter table if exists public.grade_sections
  add column if not exists special_schedule_enabled boolean not null default false,
  add column if not exists hora_entrada_especial time,
  add column if not exists hora_salida_especial time,
  add column if not exists hora_limite_tardanza_especial time;

update public.grade_sections
set special_schedule_enabled = true
where special_schedule_enabled = false
  and (
    hora_entrada_especial is not null
    or hora_salida_especial is not null
    or hora_limite_tardanza_especial is not null
  );

alter table if exists public.school_calendar
  add column if not exists descripcion text;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.school_calendar'::regclass
      and conname = 'school_calendar_tipo_check'
  ) then
    alter table public.school_calendar drop constraint school_calendar_tipo_check;
  end if;
end
$$;

alter table public.school_calendar
  add constraint school_calendar_tipo_check
  check (tipo in ('feriado', 'vacaciones', 'evento'));

commit;

notify pgrst, 'reload schema';


-- ============================================================
-- Source: database/migrations/2026-04-30_add_profiles_approval_columns_if_missing.sql
-- ============================================================
begin;

alter table if exists public.profiles
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists approval_requested_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists approval_note text;

create index if not exists idx_profiles_approval_status
  on public.profiles (approval_status);

commit;


-- ============================================================
-- Source: database/migrations/2026-04-30_add_profiles_school_id_if_missing.sql
-- ============================================================
begin;

alter table if exists public.profiles
  add column if not exists school_id uuid references public.schools(id) on delete set null;

create index if not exists idx_profiles_school_id
  on public.profiles (school_id);

commit;


-- ============================================================
-- Source: database/migrations/2026-05-01_add_school_calendar_rls_policies.sql
-- ============================================================
-- QHere - Politicas RLS para calendario escolar
-- Ejecutar en Supabase SQL Editor si aparece:
-- new row violates row-level security policy for table "school_calendar"

begin;

alter table public.school_calendar enable row level security;

drop policy if exists "Admins manage own school calendar" on public.school_calendar;
create policy "Admins manage own school calendar"
on public.school_calendar
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and (
        p.school_id = school_calendar.school_id
        or lower(p.email) = 'duspolsyttt@gmail.com'
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and (
        p.school_id = school_calendar.school_id
        or lower(p.email) = 'duspolsyttt@gmail.com'
      )
  )
);

drop policy if exists "Teachers read own school calendar" on public.school_calendar;
create policy "Teachers read own school calendar"
on public.school_calendar
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
      and p.school_id = school_calendar.school_id
  )
);

commit;

notify pgrst, 'reload schema';


-- ============================================================
-- Source: database/future_tables.sql
-- ============================================================
-- QHERE - Optional Future Tables
-- Base tables for the roadmap:
-- 1. authorized devices
-- 2. optional geolocation on attendance
-- 3. queued notifications/alerts
-- 4. grade integrations

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.authorized_devices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  device_fingerprint text not null,
  device_name text,
  device_type text not null default 'web'
    check (device_type in ('web', 'android', 'ios', 'desktop', 'other')),
  platform text,
  app_version text,
  last_ip inet,
  last_user_agent text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'blocked', 'revoked')),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  notes text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists authorized_devices_profile_fingerprint_key
  on public.authorized_devices (profile_id, device_fingerprint);

create index if not exists authorized_devices_profile_status_idx
  on public.authorized_devices (profile_id, status, last_seen_at desc);

drop trigger if exists authorized_devices_set_updated_at on public.authorized_devices;
create trigger authorized_devices_set_updated_at
  before update on public.authorized_devices
  for each row execute procedure public.set_updated_at();

alter table public.authorized_devices enable row level security;

drop policy if exists "Admins manage authorized devices" on public.authorized_devices;
create policy "Admins manage authorized devices"
  on public.authorized_devices
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Users read own devices" on public.authorized_devices;
create policy "Users read own devices"
  on public.authorized_devices
  for select
  using (profile_id = auth.uid());

drop policy if exists "Users register own devices" on public.authorized_devices;
create policy "Users register own devices"
  on public.authorized_devices
  for insert
  with check (profile_id = auth.uid());

drop policy if exists "Users update own devices" on public.authorized_devices;
create policy "Users update own devices"
  on public.authorized_devices
  for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create table if not exists public.attendance_geo_events (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendance(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  recorded_by uuid references public.profiles(id) on delete set null,
  event_type text not null default 'check_in'
    check (event_type in ('check_in', 'check_out', 'manual', 'excuse_review', 'system')),
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  accuracy_m numeric(8, 2),
  source text not null default 'mobile'
    check (source in ('mobile', 'web', 'system')),
  metadata jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create index if not exists attendance_geo_events_attendance_idx
  on public.attendance_geo_events (attendance_id, captured_at desc);

create index if not exists attendance_geo_events_student_idx
  on public.attendance_geo_events (student_id, captured_at desc);

alter table public.attendance_geo_events enable row level security;

drop policy if exists "Admins manage attendance geo events" on public.attendance_geo_events;
create policy "Admins manage attendance geo events"
  on public.attendance_geo_events
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Teachers read related geo events" on public.attendance_geo_events;
create policy "Teachers read related geo events"
  on public.attendance_geo_events
  for select
  using (
    exists (
      select 1
      from public.attendance a
      where a.id = attendance_geo_events.attendance_id
        and a.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers insert own geo events" on public.attendance_geo_events;
create policy "Teachers insert own geo events"
  on public.attendance_geo_events
  for insert
  with check (
    recorded_by = auth.uid()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('teacher', 'admin')
    )
  );

drop policy if exists "Parents read linked geo events" on public.attendance_geo_events;
create policy "Parents read linked geo events"
  on public.attendance_geo_events
  for select
  using (
    exists (
      select 1
      from public.parents pa
      where pa.profile_id = auth.uid()
        and pa.student_id = attendance_geo_events.student_id
    )
    or exists (
      select 1
      from public.students s
      where s.id = attendance_geo_events.student_id
        and s.parent_id = auth.uid()
    )
  );

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  related_table text,
  related_id uuid,
  channel text not null
    check (channel in ('email', 'sms', 'push', 'whatsapp')),
  template_key text,
  subject text,
  payload jsonb not null default '{}'::jsonb,
  priority smallint not null default 5
    check (priority between 1 and 10),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_for timestamptz,
  locked_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notification_queue_status_scheduled_idx
  on public.notification_queue (status, scheduled_for, priority);

create index if not exists notification_queue_recipient_idx
  on public.notification_queue (recipient_id, created_at desc);

create index if not exists notification_queue_student_idx
  on public.notification_queue (student_id, created_at desc);

drop trigger if exists notification_queue_set_updated_at on public.notification_queue;
create trigger notification_queue_set_updated_at
  before update on public.notification_queue
  for each row execute procedure public.set_updated_at();

alter table public.notification_queue enable row level security;

drop policy if exists "Admins manage notification queue" on public.notification_queue;
create policy "Admins manage notification queue"
  on public.notification_queue
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Recipients read own queue items" on public.notification_queue;
create policy "Recipients read own queue items"
  on public.notification_queue
  for select
  using (recipient_id = auth.uid());

create table if not exists public.gradebook_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  grade_section_id uuid references public.grade_sections(id) on delete set null,
  subject text not null,
  period text not null,
  assessment_name text not null,
  assessment_type text not null default 'assignment'
    check (assessment_type in ('assignment', 'quiz', 'exam', 'project', 'participation', 'behavior', 'other')),
  weight numeric(5, 2),
  score numeric(6, 2),
  max_score numeric(6, 2),
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'imported', 'archived')),
  external_source text,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gradebook_entries_student_period_idx
  on public.gradebook_entries (student_id, period, subject);

create index if not exists gradebook_entries_teacher_created_idx
  on public.gradebook_entries (teacher_id, created_at desc);

create unique index if not exists gradebook_entries_import_ref_key
  on public.gradebook_entries (student_id, external_source, external_ref)
  where external_ref is not null;

drop trigger if exists gradebook_entries_set_updated_at on public.gradebook_entries;
create trigger gradebook_entries_set_updated_at
  before update on public.gradebook_entries
  for each row execute procedure public.set_updated_at();

alter table public.gradebook_entries enable row level security;

drop policy if exists "Admins manage gradebook entries" on public.gradebook_entries;
create policy "Admins manage gradebook entries"
  on public.gradebook_entries
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Teachers manage own gradebook entries" on public.gradebook_entries;
create policy "Teachers manage own gradebook entries"
  on public.gradebook_entries
  for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "Parents read linked gradebook entries" on public.gradebook_entries;
create policy "Parents read linked gradebook entries"
  on public.gradebook_entries
  for select
  using (
    exists (
      select 1
      from public.parents pa
      where pa.profile_id = auth.uid()
        and pa.student_id = gradebook_entries.student_id
    )
    or exists (
      select 1
      from public.students s
      where s.id = gradebook_entries.student_id
        and s.parent_id = auth.uid()
    )
  );

commit;

notify pgrst, 'reload schema';


-- ============================================================
-- Source: database/rpc_functions.sql
-- ============================================================
-- QHere - RPC functions for Supabase/PostgREST
-- Ejecutar despues de schema.sql.

begin;

create or replace function public.rpc_daily_attendance_report(
  p_school_id uuid,
  p_report_date date default current_date
)
returns table (
  section_id uuid,
  grado text,
  seccion text,
  turno text,
  total_estudiantes bigint,
  presentes bigint,
  tardios bigint,
  ausentes bigint,
  justificados bigint
)
language sql
stable
as $$
  select
    gs.id as section_id,
    gs.grado,
    gs.seccion,
    gs.turno,
    count(s.id) as total_estudiantes,
    count(a.id) filter (where a.estado = 'presente') as presentes,
    count(a.id) filter (where a.estado = 'tarde') as tardios,
    count(s.id) filter (where a.id is null) as ausentes,
    count(a.id) filter (where a.estado = 'justificado') as justificados
  from public.grade_sections gs
  left join public.students s
    on s.grade_section_id = gs.id
   and s.activo = true
  left join public.attendance a
    on a.student_id = s.id
   and a.fecha = p_report_date
  where gs.school_id = p_school_id
  group by gs.id, gs.grado, gs.seccion, gs.turno
  order by gs.grado, gs.seccion, gs.turno;
$$;

create or replace function public.rpc_student_attendance_summary(
  p_student_id uuid,
  p_from date,
  p_to date
)
returns table (
  student_id uuid,
  total_dias bigint,
  presentes bigint,
  tardios bigint,
  justificados bigint,
  porcentaje_asistencia numeric
)
language sql
stable
as $$
  select
    p_student_id as student_id,
    count(a.id) as total_dias,
    count(a.id) filter (where a.estado = 'presente') as presentes,
    count(a.id) filter (where a.estado = 'tarde') as tardios,
    count(a.id) filter (where a.estado = 'justificado') as justificados,
    case
      when count(a.id) = 0 then 0
      else round((count(a.id) filter (where a.estado in ('presente', 'tarde', 'justificado'))::numeric / count(a.id)::numeric) * 100, 2)
    end as porcentaje_asistencia
  from public.attendance a
  where a.student_id = p_student_id
    and a.fecha between p_from and p_to;
$$;

commit;

notify pgrst, 'reload schema';


-- ============================================================
-- Source: database/realtime_setup.sql
-- ============================================================
-- QHere - Supabase Realtime setup
-- Habilita publicacion realtime para tablas operativas.

begin;

alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.excuses;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.notification_queue;
alter publication supabase_realtime add table public.audit_log;

commit;

