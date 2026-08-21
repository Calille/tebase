/**
 * Xero OAuth start + callback.
 *
 * POST { action: "start" } — SPA (with anon key) gets an authorize URL.
 * GET  ?code=&state=       — Xero redirects here. We exchange the code,
 *                            store tokens with the service role, redirect
 *                            the browser back to the app. No tokens in the
 *                            redirect URL.
 *
 * Secrets: XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_REDIRECT_URI, APP_URL
 *
 * verify_jwt = false so Xero's redirect can land without a user JWT.
 */

import {
  corsHeaders,
  exchangeCode,
  fetchTenant,
  json,
  XERO_AUTHORIZE_URL,
  XERO_SCOPES,
} from "../_shared/xero.ts";
import { consumeState, saveState, upsertTokens } from "../_shared/xeroTokens.ts";

function redirectUri(): string {
  return (
    Deno.env.get("XERO_REDIRECT_URI") ??
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/xero-oauth-callback`
  );
}

function appUrl(): string {
  return (Deno.env.get("APP_URL") ?? "http://localhost:5173").replace(/\/$/, "");
}

async function startAuthorize(): Promise<Response> {
  const clientId = Deno.env.get("XERO_CLIENT_ID");
  if (!clientId) {
    return json({ error: "XERO_CLIENT_ID is not set on the Edge Function." }, 500);
  }
  const state = crypto.randomUUID();
  await saveState(state);
  const url = new URL(XERO_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("scope", XERO_SCOPES);
  url.searchParams.set("state", state);
  return json({ authorizeUrl: url.toString() });
}

async function handleCallback(reqUrl: URL): Promise<Response> {
  const code = reqUrl.searchParams.get("code");
  const state = reqUrl.searchParams.get("state");
  const xeroError = reqUrl.searchParams.get("error");
  const finish = (query: string) =>
    new Response(null, {
      status: 302,
      headers: { Location: `${appUrl()}/invoices?tab=connection&${query}` },
    });

  if (xeroError) {
    return finish(`xero=error&reason=${encodeURIComponent(xeroError)}`);
  }
  if (!code || !state) {
    return finish("xero=error&reason=missing_code");
  }

  const known = await consumeState(state);
  if (!known) {
    return finish("xero=error&reason=invalid_state");
  }

  const clientId = Deno.env.get("XERO_CLIENT_ID");
  const clientSecret = Deno.env.get("XERO_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return finish("xero=error&reason=missing_secrets");
  }

  try {
    const tokens = await exchangeCode({
      code,
      clientId,
      clientSecret,
      redirectUri: redirectUri(),
    });
    const tenant = await fetchTenant(tokens.access_token);
    await upsertTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scopes: tokens.scope,
      tenantId: tenant?.tenantId ?? null,
      tenantName: tenant?.tenantName ?? null,
      lastError: null,
    });
    return finish("xero=connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "exchange_failed";
    return finish(`xero=error&reason=${encodeURIComponent(message)}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === "GET" && url.searchParams.has("code")) {
    return handleCallback(url);
  }

  if (req.method === "GET" && url.searchParams.has("error")) {
    return handleCallback(url);
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    if (body.action === "start") {
      return startAuthorize();
    }
  }

  return json({
    error: "Use POST { action: 'start' } from the app, or the Xero redirect with ?code=",
  }, 400);
});
