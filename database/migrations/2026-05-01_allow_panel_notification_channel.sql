-- Permite usar la misma cola para correo, WhatsApp/SMS y avisos internos del panel.
alter table if exists public.notification_queue
  drop constraint if exists notification_queue_channel_check;

alter table if exists public.notification_queue
  add constraint notification_queue_channel_check
  check (channel in ('email', 'sms', 'push', 'whatsapp', 'panel'));
