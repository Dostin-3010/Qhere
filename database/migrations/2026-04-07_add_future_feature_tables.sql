-- QHERE - Future support tables
-- Run after the core schema migration.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.authorized_devices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  device_fingerprint text not null,
  device_name text,
  device_type text not null default 'web'
    check (device_type in ('web', 'android', 'ios', 'desktop', 'other')),
  platform text,
  app_version text,
  last_ip inet,
  last_user_agent text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'blocked', 'revoked')),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  notes text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists authorized_devices_profile_fingerprint_key
  on public.authorized_devices (profile_id, device_fingerprint);

create index if not exists authorized_devices_profile_status_idx
  on public.authorized_devices (profile_id, status, last_seen_at desc);

drop trigger if exists authorized_devices_set_updated_at on public.authorized_devices;
create trigger authorized_devices_set_updated_at
  before update on public.authorized_devices
  for each row execute procedure public.set_updated_at();

alter table public.authorized_devices enable row level security;

drop policy if exists "Admins manage authorized devices" on public.authorized_devices;
create policy "Admins manage authorized devices"
  on public.authorized_devices
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Users read own devices" on public.authorized_devices;
create policy "Users read own devices"
  on public.authorized_devices
  for select
  using (profile_id = auth.uid());

drop policy if exists "Users register own devices" on public.authorized_devices;
create policy "Users register own devices"
  on public.authorized_devices
  for insert
  with check (profile_id = auth.uid());

drop policy if exists "Users update own devices" on public.authorized_devices;
create policy "Users update own devices"
  on public.authorized_devices
  for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create table if not exists public.attendance_geo_events (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendance(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  recorded_by uuid references public.profiles(id) on delete set null,
  event_type text not null default 'check_in'
    check (event_type in ('check_in', 'check_out', 'manual', 'excuse_review', 'system')),
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  accuracy_m numeric(8, 2),
  source text not null default 'mobile'
    check (source in ('mobile', 'web', 'system')),
  metadata jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create index if not exists attendance_geo_events_attendance_idx
  on public.attendance_geo_events (attendance_id, captured_at desc);

create index if not exists attendance_geo_events_student_idx
  on public.attendance_geo_events (student_id, captured_at desc);

alter table public.attendance_geo_events enable row level security;

drop policy if exists "Admins manage attendance geo events" on public.attendance_geo_events;
create policy "Admins manage attendance geo events"
  on public.attendance_geo_events
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Teachers read related geo events" on public.attendance_geo_events;
create policy "Teachers read related geo events"
  on public.attendance_geo_events
  for select
  using (
    exists (
      select 1
      from public.attendance a
      where a.id = attendance_geo_events.attendance_id
        and a.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers insert own geo events" on public.attendance_geo_events;
create policy "Teachers insert own geo events"
  on public.attendance_geo_events
  for insert
  with check (
    recorded_by = auth.uid()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('teacher', 'admin')
    )
  );

drop policy if exists "Parents read linked geo events" on public.attendance_geo_events;
create policy "Parents read linked geo events"
  on public.attendance_geo_events
  for select
  using (
    exists (
      select 1
      from public.parents pa
      where pa.profile_id = auth.uid()
        and pa.student_id = attendance_geo_events.student_id
    )
    or exists (
      select 1
      from public.students s
      where s.id = attendance_geo_events.student_id
        and s.parent_id = auth.uid()
    )
  );

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  related_table text,
  related_id uuid,
  channel text not null
    check (channel in ('email', 'sms', 'push', 'whatsapp')),
  template_key text,
  subject text,
  payload jsonb not null default '{}'::jsonb,
  priority smallint not null default 5
    check (priority between 1 and 10),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_for timestamptz,
  locked_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notification_queue_status_scheduled_idx
  on public.notification_queue (status, scheduled_for, priority);

create index if not exists notification_queue_recipient_idx
  on public.notification_queue (recipient_id, created_at desc);

create index if not exists notification_queue_student_idx
  on public.notification_queue (student_id, created_at desc);

drop trigger if exists notification_queue_set_updated_at on public.notification_queue;
create trigger notification_queue_set_updated_at
  before update on public.notification_queue
  for each row execute procedure public.set_updated_at();

alter table public.notification_queue enable row level security;

drop policy if exists "Admins manage notification queue" on public.notification_queue;
create policy "Admins manage notification queue"
  on public.notification_queue
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Recipients read own queue items" on public.notification_queue;
create policy "Recipients read own queue items"
  on public.notification_queue
  for select
  using (recipient_id = auth.uid());

create table if not exists public.gradebook_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  grade_section_id uuid references public.grade_sections(id) on delete set null,
  subject text not null,
  period text not null,
  assessment_name text not null,
  assessment_type text not null default 'assignment'
    check (assessment_type in ('assignment', 'quiz', 'exam', 'project', 'participation', 'behavior', 'other')),
  weight numeric(5, 2),
  score numeric(6, 2),
  max_score numeric(6, 2),
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'imported', 'archived')),
  external_source text,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gradebook_entries_student_period_idx
  on public.gradebook_entries (student_id, period, subject);

create index if not exists gradebook_entries_teacher_created_idx
  on public.gradebook_entries (teacher_id, created_at desc);

create unique index if not exists gradebook_entries_import_ref_key
  on public.gradebook_entries (student_id, external_source, external_ref)
  where external_ref is not null;

drop trigger if exists gradebook_entries_set_updated_at on public.gradebook_entries;
create trigger gradebook_entries_set_updated_at
  before update on public.gradebook_entries
  for each row execute procedure public.set_updated_at();

alter table public.gradebook_entries enable row level security;

drop policy if exists "Admins manage gradebook entries" on public.gradebook_entries;
create policy "Admins manage gradebook entries"
  on public.gradebook_entries
  for all
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Teachers manage own gradebook entries" on public.gradebook_entries;
create policy "Teachers manage own gradebook entries"
  on public.gradebook_entries
  for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "Parents read linked gradebook entries" on public.gradebook_entries;
create policy "Parents read linked gradebook entries"
  on public.gradebook_entries
  for select
  using (
    exists (
      select 1
      from public.parents pa
      where pa.profile_id = auth.uid()
        and pa.student_id = gradebook_entries.student_id
    )
    or exists (
      select 1
      from public.students s
      where s.id = gradebook_entries.student_id
        and s.parent_id = auth.uid()
    )
  );

commit;

notify pgrst, 'reload schema';
