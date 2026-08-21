/**
 * Friday 10am timesheet send — preferred name going forward.
 * Same gate as supabase/functions/send-timesheets (kept so existing cron
 * comments still work). Email is not live.
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

  return json({
    ok: true,
    ran: true,
    emailLive: false,
    message:
      "Send is stubbed. Wire the portal send here when the school portal API exists.",
    force,
  });
});
