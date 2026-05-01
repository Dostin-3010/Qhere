begin;

-- Hotfix idempotente para bases creadas antes del flujo multi-centro.
-- Corrige errores como:
--   column profiles.school_id does not exist
--   column profiles.approval_status does not exist

alter table if exists public.profiles
  add column if not exists school_id uuid references public.schools(id) on delete set null,
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists approval_requested_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists approval_note text,
  add column if not exists permisos text[] not null default array[]::text[],
  add column if not exists secciones_ids uuid[] not null default array[]::uuid[],
  add column if not exists margen_tardanza_minutos integer not null default 30;

create index if not exists idx_profiles_school_id
  on public.profiles (school_id);

create index if not exists idx_profiles_approval_status
  on public.profiles (approval_status);

create index if not exists idx_profiles_school_approval_status
  on public.profiles (school_id, approval_status);

update public.profiles
set approval_status = 'approved'
where approval_status is null;

update public.profiles
set margen_tardanza_minutos = 30
where margen_tardanza_minutos is null;

commit;
