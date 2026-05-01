begin;

alter table if exists public.profiles
  add column if not exists school_id uuid references public.schools(id) on delete set null;

create index if not exists idx_profiles_school_id
  on public.profiles (school_id);

commit;
