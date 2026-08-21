/**
 * Push approved timesheets to Xero as ACCREC drafts.
 * Not built in this slice — OAuth + token storage + health first.
 */
import { corsHeaders, json } from "../_shared/xero.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return json({
    ok: false,
    implemented: false,
    message:
      "xero-push-invoices is scaffolded. Contact mapping and push come after OAuth is checked.",
  }, 501);
});
