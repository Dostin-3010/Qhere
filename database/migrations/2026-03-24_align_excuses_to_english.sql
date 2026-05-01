begin;

alter table public.excuses
  add column if not exists attendance_id uuid,
  add column if not exists teacher_id uuid references public.profiles(id),
  add column if not exists absence_date date,
  add column if not exists excuse_type text,
  add column if not exists reason text,
  add column if not exists attachment_url text,
  add column if not exists teacher_comment text,
  add column if not exists status text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'fecha_ausencia'
  ) then
    execute $sql$
      update public.excuses
      set absence_date = fecha_ausencia
      where absence_date is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'tipo_ausencia'
  ) then
    execute $sql$
      update public.excuses
      set excuse_type = tipo_ausencia
      where excuse_type is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'motivo'
  ) then
    execute $sql$
      update public.excuses
      set reason = motivo
      where reason is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'evidencia_url'
  ) then
    execute $sql$
      update public.excuses
      set attachment_url = evidencia_url
      where attachment_url is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'comentario_docente'
  ) then
    execute $sql$
      update public.excuses
      set teacher_comment = comentario_docente
      where teacher_comment is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'estado'
  ) then
    execute $sql$
      update public.excuses
      set status = case estado
        when 'pending' then 'pending'
        when 'approved' then 'approved'
        when 'rejected' then 'rejected'
        when 'pendiente' then 'pending'
        when 'aprobada' then 'approved'
        when 'rechazada' then 'rejected'
        else coalesce(status, 'pending')
      end
      where status is null
         or status not in ('pending', 'approved', 'rejected')
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'revisado_en'
  ) then
    execute $sql$
      update public.excuses
      set reviewed_at = revisado_en
      where reviewed_at is null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'excuses'
      and column_name = 'revisado_por'
  ) then
    execute $sql$
      update public.excuses
      set reviewed_by = revisado_por
      where reviewed_by is null
    $sql$;
  end if;
end $$;

update public.excuses
set status = case
  when status in ('pending', 'approved', 'rejected') then status
  when status = 'pendiente' then 'pending'
  when status = 'aprobada' then 'approved'
  when status = 'rechazada' then 'rejected'
  else 'pending'
end
where status is null
   or status not in ('pending', 'approved', 'rejected');

alter table public.excuses
  alter column absence_date set not null,
  alter column reason set not null,
  alter column status set default 'pending',
  alter column status set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'excuses_estado_check'
  ) then
    alter table public.excuses
      drop constraint excuses_estado_check;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'excuses_status_check'
  ) then
    alter table public.excuses
      add constraint excuses_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

insert into storage.buckets (id, name, public)
select 'excuses', 'excuses', true
where not exists (
  select 1
  from storage.buckets
  where id = 'excuses'
);

alter table public.excuses
  drop column if exists fecha_ausencia,
  drop column if exists tipo_ausencia,
  drop column if exists motivo,
  drop column if exists evidencia_url,
  drop column if exists comentario_docente,
  drop column if exists estado,
  drop column if exists revisado_en,
  drop column if exists revisado_por;

commit;
