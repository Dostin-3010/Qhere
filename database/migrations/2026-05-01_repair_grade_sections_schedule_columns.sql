begin;

-- Hotfix idempotente para escaneo QR con horarios especiales.
-- Corrige errores como:
--   column grade_sections_1.special_schedule_enabled does not exist

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

commit;
