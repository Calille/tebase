/**
 * Xero token refresh + connection health.
 *
 * POST { action: "health" }  — SPA. Returns status only. Never tokens.
 * POST { action: "refresh" } — service role / pg_cron. Rotates the refresh
 *                              token and writes the new pair in one upsert.
 *
 * Access tokens expire after 30 minutes. Refresh tokens expire after 60 days
 * unused and ROTATE on every use. Concurrent refreshes take refresh_lock_until
 * so two calls cannot both spend the current refresh token.
 *
 * verify_jwt = false so cron can call with the service role bearer.
 */

import { corsHeaders, healthFromRow, json } from "../_shared/xero.ts";
import {
  isServiceRoleRequest,
  readTokenRow,
  refreshWithLock,
} from "../_shared/xeroTokens.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action === "refresh" ? "refresh" : "health";

  if (action === "health") {
    try {
      const row = await readTokenRow();
      return json(healthFromRow(row));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Health check failed";
      return json(
        healthFromRow(null, message),
        200,
      );
    }
  }

  if (!isServiceRoleRequest(req)) {
    return json({ error: "Refresh requires the service role." }, 403);
  }

  const clientId = Deno.env.get("XERO_CLIENT_ID");
  const clientSecret = Deno.env.get("XERO_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return json({ error: "XERO_CLIENT_ID / XERO_CLIENT_SECRET are not set." }, 500);
  }

  try {
    const row = await refreshWithLock({ clientId, clientSecret });
    return json({ ok: true, health: healthFromRow(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    return json({ ok: false, health: healthFromRow(null, message) }, 200);
  }
});
