/**
 * Friday 10am timesheet send — Supabase Edge Function stub.
 *
 * Why here, not Vercel Cron:
 * This app is a Vite SPA with no backend. Vercel Cron needs a serverless
 * route this repo does not have. Timesheet state will live in Supabase,
 * so an Edge Function + pg_cron is the better fit.
 *
 * BST/GMT:
 * pg_cron is UTC. 10:00 Europe/London is 09:00 UTC in BST and 10:00 UTC
 * in GMT. The migration therefore fires at BOTH 09:00 and 10:00 UTC on
 * Friday. This function no-ops unless local London time is Friday 10:xx
 * (or ?force=1 for a manual invoke). Keep that gate in sync with
 * `src/lib/londonTime.ts`.
 *
 * Email is NOT live. The function records a send plan only.
 *
 * Deploy:
 *   1. supabase functions deploy timesheet-send
 *      (send-timesheets is the previous name; keep both until cron is retargeted)

 *   2. Grant the function URL to pg_net (vault secret)
 *   3. Apply supabase/migrations/20260821_schedule_timesheet_send.sql
 *   4. Confirm cron.job_run_details after the first Friday
 */

function isLondonFridayTenAmWindow(date: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  return weekday === "Fri" && hour === 10;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const now = new Date();

  if (!force && !isLondonFridayTenAmWindow(now)) {
    return json({
      ok: true,
      ran: false,
      reason: "Not Friday 10:00 Europe/London",
      at: now.toISOString(),
      emailLive: false,
    });
  }

  // Stub: load this week's bookings, skip empty/holiday/INSET, call portal send.
  return json({
    ok: true,
    ran: true,
    emailLive: false,
    message:
      "Send is stubbed. Wire the portal send here when the school portal API exists.",
    force,
  });
});
