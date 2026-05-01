begin;

-- Permite borrar usuarios desde Supabase Auth sin romper el historial.
-- Cuando auth.users se borra, public.profiles se elimina por cascade.
-- Las tablas historicas deben conservar sus registros y poner la referencia al perfil en NULL.
-- Las tablas de vinculos operativos pueden eliminar solo el vinculo.

do $$
declare
  constraint_row record;
begin
  -- attendance.teacher_id: conservar asistencia historica.
  if to_regclass('public.attendance') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'attendance' and column_name = 'teacher_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.attendance'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (teacher_id)%REFERENCES%profiles%'
    loop
      execute format('alter table public.attendance drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.attendance
      alter column teacher_id drop not null,
      add constraint attendance_teacher_id_fkey
        foreign key (teacher_id) REFERENCES%profiles(id) on delete set null;
  end if;

  -- excuses: conservar excusas aunque se borre el padre/docente.
  if to_regclass('public.excuses') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'excuses' and column_name = 'parent_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.excuses'::regclass
        and contype = 'f'
        and (
          pg_get_constraintdef(oid) ilike '%FOREIGN KEY (parent_id)%REFERENCES%profiles%'
          or pg_get_constraintdef(oid) ilike '%FOREIGN KEY (teacher_id)%REFERENCES%profiles%'
          or pg_get_constraintdef(oid) ilike '%FOREIGN KEY (reviewed_by)%REFERENCES%profiles%'
        )
    loop
      execute format('alter table public.excuses drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.excuses
      alter column parent_id drop not null,
      alter column teacher_id drop not null,
      alter column reviewed_by drop not null,
      add constraint excuses_parent_id_fkey
        foreign key (parent_id) REFERENCES%profiles(id) on delete set null,
      add constraint excuses_teacher_id_fkey
        foreign key (teacher_id) REFERENCES%profiles(id) on delete set null,
      add constraint excuses_reviewed_by_fkey
        foreign key (reviewed_by) REFERENCES%profiles(id) on delete set null;
  end if;

  -- notifications.teacher_id: conservar notificaciones internas ya emitidas.
  if to_regclass('public.notifications') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'teacher_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.notifications'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (teacher_id)%REFERENCES%profiles%'
    loop
      execute format('alter table public.notifications drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.notifications
      alter column teacher_id drop not null,
      add constraint notifications_teacher_id_fkey
        foreign key (teacher_id) REFERENCES%profiles(id) on delete set null;
  end if;

  -- audit_log.user_id: conservar auditoria sin usuario activo.
  if to_regclass('public.audit_log') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'user_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.audit_log'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (user_id)%REFERENCES%profiles%'
    loop
      execute format('alter table public.audit_log drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.audit_log
      alter column user_id drop not null,
      add constraint audit_log_user_id_fkey
        foreign key (user_id) REFERENCES%profiles(id) on delete set null;
  end if;

  -- attendance_geo_events.recorded_by: conservar evidencia de ubicacion.
  if to_regclass('public.attendance_geo_events') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'attendance_geo_events' and column_name = 'recorded_by'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.attendance_geo_events'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (recorded_by)%REFERENCES%profiles%'
    loop
      execute format('alter table public.attendance_geo_events drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.attendance_geo_events
      alter column recorded_by drop not null,
      add constraint attendance_geo_events_recorded_by_fkey
        foreign key (recorded_by) REFERENCES%profiles(id) on delete set null;
  end if;

  -- gradebook_entries.teacher_id: conservar calificaciones.
  if to_regclass('public.gradebook_entries') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'gradebook_entries' and column_name = 'teacher_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.gradebook_entries'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (teacher_id)%REFERENCES%profiles%'
    loop
      execute format('alter table public.gradebook_entries drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.gradebook_entries
      alter column teacher_id drop not null,
      add constraint gradebook_entries_teacher_id_fkey
        foreign key (teacher_id) REFERENCES%profiles(id) on delete set null;
  end if;

  -- notification_queue.recipient_id: conservar cola/historial sin bloquear auth delete.
  if to_regclass('public.notification_queue') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notification_queue' and column_name = 'recipient_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.notification_queue'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (recipient_id)%REFERENCES%profiles%'
    loop
      execute format('alter table public.notification_queue drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.notification_queue
      alter column recipient_id drop not null,
      add constraint notification_queue_recipient_id_fkey
        foreign key (recipient_id) REFERENCES%profiles(id) on delete set null;
  end if;

  -- profiles.approved_by: self-reference segura.
  if to_regclass('public.profiles') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'approved_by'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.profiles'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (approved_by)%REFERENCES%profiles%'
    loop
      execute format('alter table public.profiles drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.profiles
      alter column approved_by drop not null,
      add constraint profiles_approved_by_fkey
        foreign key (approved_by) REFERENCES%profiles(id) on delete set null;
  end if;

  -- parents y student_teachers son tablas de vinculo: pueden desaparecer con el usuario.
  if to_regclass('public.parents') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'parents' and column_name = 'profile_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.parents'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (profile_id)%REFERENCES%profiles%'
    loop
      execute format('alter table public.parents drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.parents
      add constraint parents_profile_id_fkey
        foreign key (profile_id) REFERENCES%profiles(id) on delete cascade;
  end if;

  if to_regclass('public.student_teachers') is not null and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'student_teachers' and column_name = 'teacher_id'
  ) then
    for constraint_row in
      select conname
      from pg_constraint
      where conrelid = 'public.student_teachers'::regclass
        and contype = 'f'
        and pg_get_constraintdef(oid) ilike '%FOREIGN KEY (teacher_id)%REFERENCES%profiles%'
    loop
      execute format('alter table public.student_teachers drop constraint if exists %I', constraint_row.conname);
    end loop;

    alter table public.student_teachers
      add constraint student_teachers_teacher_id_fkey
        foreign key (teacher_id) REFERENCES%profiles(id) on delete cascade;
  end if;
end
$$;

commit;
