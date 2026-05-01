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
