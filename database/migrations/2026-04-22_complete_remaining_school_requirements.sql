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
