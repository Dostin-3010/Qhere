begin;

drop policy if exists "Admin ve todas las excusas" on public.excuses;

create policy "Admin ve todas las excusas"
  on public.excuses for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

commit;
