# Security notes (Supabase-side)

These issues cannot be fixed in the Vite client alone. They need project
settings, SQL policies, and (for PII) a storage design decision.

## Row Level Security

README documents optional SELECT policies for `teachers`, `schools`, and
`bookings`. There are no INSERT/UPDATE/DELETE policies in this repo.

Until RLS is on and policies are reviewed:

- The anon key shipped in `VITE_SUPABASE_ANON_KEY` can read/write whatever
  the table grants allow.
- `/test` (dev-only in this app) seeds those tables through the anon client.

**Needed:** enable RLS on `profiles`, `teachers`, `schools`, and `bookings`.
Grant authenticated staff the minimum access for their role. Do not leave
anon INSERT on operational tables.

## Username login leaks emails

`authService.signIn` looks up `profiles.email` by `username` before calling
`signInWithPassword`. If `profiles` is readable without a session, anyone
can harvest emails from usernames.

**Needed:** either

1. a SECURITY DEFINER RPC that returns nothing to the client except
   “continue with password”, or
2. login with email only, or
3. a locked-down `profiles` policy so unauthenticated users cannot SELECT.

## Unencrypted PII

Teacher records are designed to hold bank details, DBS numbers, tax IDs,
dates of birth, and visa status (`t_bank_details`, `t_dbs_check_number`,
`t_tax_information`, etc.). The SQL comment says bank details are
encrypted; the app stores plain JSON and the session-local demo store
keeps the same fields in memory.

**Needed:** encrypt at rest (pgsodium / vault / a secrets service), restrict
column access by role, and never return full account numbers to the
browser unless the user is authorised to see them.

## Role is not client-writable (app)

The client no longer sends `role` in `updateProfile`. Profiles still store
`role`. **Needed:** a trigger or policy so users cannot UPDATE their own
`role` column even if they craft a request.

## Password reset for other users

IT Admin password reset is demo-only. Resetting another user’s password
requires the service role or a privileged Edge Function, never the anon
key in the browser.

## Which roles see IT Admin

The client treats `admin` and `director` (case-insensitive) as
admin-capable: the IT Administration nav item and `/it-admin` route.
Signup still creates `role: 'user'`. Set the profile role in Supabase
for staff who should see that screen. This is a product choice — add or
remove roles in `src/lib/roles.ts` if the agency uses different names.

## Vercel environment

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are baked in at build
time. They must be set in the Vercel project. They are the anon key, not
the service role. Never put the service role in a Vite env var.
