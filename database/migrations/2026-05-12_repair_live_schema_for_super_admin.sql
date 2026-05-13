begin;

-- Hotfix idempotente para bases que se quedaron con migraciones pendientes.
-- Corrige errores al crear/editar/borrar centros:
--   column profiles.school_id does not exist
-- y errores al registrar solicitudes directivas:
--   notification_queue_channel_check no permite channel = 'panel'

alter table if exists public.schools
  add column if not exists direccion text,
  add column if not exists telefono text,
  add column if not exists email text,
  add column if not exists director text,
  add column if not exists configurado boolean not null default false,
  add column if not exists academic_period_start date,
  add column if not exists academic_period_end date,
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  add column if not exists allowed_radius_m numeric(8, 2) default 150,
  add column if not exists updated_at timestamptz not null default now();

update public.schools
set allowed_radius_m = 150
where allowed_radius_m is null;

alter table if exists public.profiles
  add column if not exists school_id uuid references public.schools(id) on delete set null,
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists approval_requested_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists approval_note text,
  add column if not exists phone text,
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

alter table if exists public.notification_queue
  drop constraint if exists notification_queue_channel_check;

alter table if exists public.notification_queue
  add constraint notification_queue_channel_check
  check (channel in ('email', 'sms', 'push', 'whatsapp', 'panel'));

commit;

notify pgrst, 'reload schema';
