begin;

-- Hotfix idempotente para bases en vivo donde la tabla students quedo
-- creada antes del esquema escolar completo.
-- Corrige errores de PostgREST como:
--   Could not find the 'activo' column of 'students' in the schema cache

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

update public.students
set activo = true
where activo is null;

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

alter table if exists public.students
  alter column nombre set not null,
  alter column matricula set not null,
  alter column activo set default true,
  alter column activo set not null;

do $$
begin
  if not exists (
    select 1
    from public.students
    group by matricula
    having count(*) > 1
    limit 1
  ) then
    create unique index if not exists students_matricula_key
      on public.students (matricula);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from public.students
    where qr_token is not null
    group by qr_token
    having count(*) > 1
    limit 1
  ) then
    create unique index if not exists students_qr_token_key
      on public.students (qr_token)
      where qr_token is not null;
  end if;
end
$$;

create index if not exists students_school_id_idx
  on public.students (school_id);

create index if not exists students_grade_section_id_idx
  on public.students (grade_section_id);

commit;

notify pgrst, 'reload schema';
