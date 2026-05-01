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
