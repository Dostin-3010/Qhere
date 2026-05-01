begin;

-- Reparacion fuerte para poder borrar usuarios desde Supabase Auth.
-- Primero elimina cualquier foreign key que apunte a public.profiles,
-- sin importar el nombre que Supabase/Postgres le haya dado.

do $qhere$
declare
  fk record;
begin
  for fk in
    select
      ns.nspname as table_schema,
      cls.relname as table_name,
      con.conname as constraint_name
    from pg_constraint con
    join pg_class cls on cls.oid = con.conrelid
    join pg_namespace ns on ns.oid = cls.relnamespace
    where con.contype = 'f'
      and con.confrelid = 'public.profiles'::regclass
      and ns.nspname = 'public'
  loop
    execute format(
      'alter table %I.%I drop constraint if exists %I',
      fk.table_schema,
      fk.table_name,
      fk.constraint_name
    );
  end loop;
end
$qhere$;

-- Dejar columnas historicas como nullable para poder usar ON DELETE SET NULL.
alter table if exists public.profiles
  add column if not exists approved_by uuid;

alter table if exists public.excuses
  add column if not exists parent_id uuid,
  add column if not exists teacher_id uuid,
  add column if not exists reviewed_by uuid;

alter table if exists public.notifications
  add column if not exists teacher_id uuid;

alter table if exists public.audit_log
  add column if not exists user_id uuid;

alter table if exists public.attendance_geo_events
  add column if not exists recorded_by uuid;

alter table if exists public.notification_queue
  add column if not exists recipient_id uuid;

alter table if exists public.gradebook_entries
  add column if not exists teacher_id uuid;

alter table if exists public.authorized_devices
  add column if not exists profile_id uuid;

alter table if exists public.parents
  add column if not exists profile_id uuid;

alter table if exists public.student_teachers
  add column if not exists teacher_id uuid;

alter table if exists public.attendance
  add column if not exists teacher_id uuid,
  alter column teacher_id drop not null;

alter table if exists public.excuses
  alter column parent_id drop not null,
  alter column teacher_id drop not null,
  alter column reviewed_by drop not null;

alter table if exists public.notifications
  alter column teacher_id drop not null;

alter table if exists public.audit_log
  alter column user_id drop not null;

alter table if exists public.attendance_geo_events
  alter column recorded_by drop not null;

alter table if exists public.notification_queue
  alter column recipient_id drop not null;

alter table if exists public.gradebook_entries
  alter column teacher_id drop not null;

alter table if exists public.profiles
  alter column approved_by drop not null;

-- Reglas historicas: conservar datos y poner referencias al usuario en NULL.
alter table if exists public.attendance
  add constraint attendance_teacher_id_fkey
  foreign key (teacher_id) references public.profiles(id) on delete set null not valid;

alter table if exists public.excuses
  add constraint excuses_parent_id_fkey
  foreign key (parent_id) references public.profiles(id) on delete set null not valid;

alter table if exists public.excuses
  add constraint excuses_teacher_id_fkey
  foreign key (teacher_id) references public.profiles(id) on delete set null not valid;

alter table if exists public.excuses
  add constraint excuses_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null not valid;

alter table if exists public.notifications
  add constraint notifications_teacher_id_fkey
  foreign key (teacher_id) references public.profiles(id) on delete set null not valid;

alter table if exists public.audit_log
  add constraint audit_log_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete set null not valid;

alter table if exists public.attendance_geo_events
  add constraint attendance_geo_events_recorded_by_fkey
  foreign key (recorded_by) references public.profiles(id) on delete set null not valid;

alter table if exists public.notification_queue
  add constraint notification_queue_recipient_id_fkey
  foreign key (recipient_id) references public.profiles(id) on delete set null not valid;

alter table if exists public.gradebook_entries
  add constraint gradebook_entries_teacher_id_fkey
  foreign key (teacher_id) references public.profiles(id) on delete set null not valid;

alter table if exists public.profiles
  add constraint profiles_approved_by_fkey
  foreign key (approved_by) references public.profiles(id) on delete set null not valid;

-- Reglas operativas: vinculos temporales pueden borrarse con el perfil.
alter table if exists public.parents
  add constraint parents_profile_id_fkey
  foreign key (profile_id) references public.profiles(id) on delete cascade not valid;

alter table if exists public.student_teachers
  add constraint student_teachers_teacher_id_fkey
  foreign key (teacher_id) references public.profiles(id) on delete cascade not valid;

alter table if exists public.authorized_devices
  add constraint authorized_devices_profile_id_fkey
  foreign key (profile_id) references public.profiles(id) on delete cascade not valid;

commit;

