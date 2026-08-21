-- Friday 10am London timesheet send.
--
-- pg_cron runs in UTC. 10:00 Europe/London is:
--   09:00 UTC during BST
--   10:00 UTC during GMT
-- Schedule BOTH hours. The Edge Function no-ops unless London local time
-- is Friday 10:xx, so we never send at 9am or 11am.
--
-- Apply after `supabase functions deploy send-timesheets`.
-- Replace the vault secret / URL with the real project values.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Example: invoke the Edge Function. Fill in project ref + service role
-- via vault before enabling these jobs in production.
--
-- select cron.schedule(
--   'timesheet-send-friday-0900-utc',
--   '0 9 * * 5',
--   $$
--   select net.http_post(
--     url := 'https://<project-ref>.functions.supabase.co/send-timesheets',
--     headers := '{"Authorization": "Bearer <service-role>"}'::jsonb
--   );
--   $$
-- );
--
-- select cron.schedule(
--   'timesheet-send-friday-1000-utc',
--   '0 10 * * 5',
--   $$
--   select net.http_post(
--     url := 'https://<project-ref>.functions.supabase.co/send-timesheets',
--     headers := '{"Authorization": "Bearer <service-role>"}'::jsonb
--   );
--   $$
-- );

select 1;
