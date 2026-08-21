-- Xero OAuth tokens. Locked to the service role — the SPA (anon key) cannot
-- read them. Table lives in public so PostgREST can reach it WITH the
-- service role; RLS has no policies, so anon/authenticated are denied.
--
-- Do not add a SELECT policy. Do not grant to anon.
--
-- Refresh tokens ROTATE: every refresh returns a new token and invalidates
-- the old one. Persist the new token in the same write as the refresh,
-- and take refresh_lock_until so two Edge Function instances cannot race
-- and orphan the connection.

create table if not exists public.xero_oauth_tokens (
  id text primary key default 'default',
  tenant_id text,
  tenant_name text,
  access_token text,
  refresh_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scopes text,
  last_error text,
  refresh_lock_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.xero_oauth_states (
  state text primary key,
  created_at timestamptz not null default now()
);

alter table public.xero_oauth_tokens enable row level security;
alter table public.xero_oauth_states enable row level security;

revoke all on table public.xero_oauth_tokens from public, anon, authenticated;
revoke all on table public.xero_oauth_states from public, anon, authenticated;

grant all on table public.xero_oauth_tokens to postgres, service_role;
grant all on table public.xero_oauth_states to postgres, service_role;

comment on table public.xero_oauth_tokens is
  'Xero OAuth tokens. Service role only. Never readable via the anon key.';

-- Token refresh: access tokens last 30 minutes. Schedule every 20 minutes
-- so we refresh before expiry and keep the 60-day refresh token alive.
--
-- select cron.schedule(
--   'xero-token-refresh-every-20-min',
--   '*/20 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://<project-ref>.functions.supabase.co/xero-token-refresh',
--     headers := '{"Authorization": "Bearer <service-role>", "Content-Type": "application/json"}'::jsonb,
--     body := '{"action":"refresh"}'::jsonb
--   );
--   $$
-- );

select 1;
