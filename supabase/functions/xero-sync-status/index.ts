/**
 * Pull invoice + payment status from Xero, and receive webhooks.
 *
 * Prefer webhooks (verify x-xero-signature) so we don't burn the daily
 * call budget. Scheduled sync is the fallback. Not built in this slice.
 */
import { corsHeaders, json } from "../_shared/xero.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.headers.get("x-xero-signature")) {
    return json({
      ok: false,
      implemented: false,
      message:
        "Webhook receiver is scaffolded. Signature verification lands with status sync.",
    }, 501);
  }

  return json({
    ok: false,
    implemented: false,
    message: "xero-sync-status is scaffolded. It follows contact mapping and push.",
  }, 501);
});
