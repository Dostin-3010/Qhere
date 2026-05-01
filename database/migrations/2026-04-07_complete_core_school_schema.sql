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
