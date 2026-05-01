-- QHere - Supabase Realtime setup
-- Habilita publicacion realtime para tablas operativas.

begin;

alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.excuses;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.notification_queue;
alter publication supabase_realtime add table public.audit_log;

commit;
