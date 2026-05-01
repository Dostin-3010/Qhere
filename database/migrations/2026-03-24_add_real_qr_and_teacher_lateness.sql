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
