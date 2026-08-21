import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  fetchTenant,
  refreshAccessToken,
  type TokenRow,
} from "./xero.ts";

function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export function getServiceClient(): SupabaseClient {
  return serviceClient();
}

export async function readTokenRow(
  client: SupabaseClient = serviceClient(),
): Promise<TokenRow | null> {
  const { data, error } = await client
    .from("xero_oauth_tokens")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TokenRow | null) ?? null;
}

export async function saveState(state: string): Promise<void> {
  const client = serviceClient();
  const { error } = await client.from("xero_oauth_states").insert({
    state,
  });
  if (error) throw new Error(error.message);
}

export async function consumeState(state: string): Promise<boolean> {
  const client = serviceClient();
  const { data, error } = await client
    .from("xero_oauth_states")
    .delete()
    .eq("state", state)
    .select("state");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function upsertTokens(input: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scopes?: string;
  tenantId?: string | null;
  tenantName?: string | null;
  lastError?: string | null;
}): Promise<void> {
  const client = serviceClient();
  const now = Date.now();
  const accessExpires = new Date(now + input.expiresIn * 1000).toISOString();
  const refreshExpires = new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await client.from("xero_oauth_tokens").upsert({
    id: "default",
    access_token: input.accessToken,
    refresh_token: input.refreshToken,
    access_token_expires_at: accessExpires,
    refresh_token_expires_at: refreshExpires,
    scopes: input.scopes ?? null,
    tenant_id: input.tenantId ?? null,
    tenant_name: input.tenantName ?? null,
    last_error: input.lastError ?? null,
    refresh_lock_until: null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function markDisconnected(lastError: string): Promise<void> {
  const client = serviceClient();
  const { error } = await client.from("xero_oauth_tokens").upsert({
    id: "default",
    access_token: null,
    refresh_token: null,
    last_error: lastError,
    refresh_lock_until: null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

/**
 * Refresh with a row lock so two concurrent calls cannot both use the
 * current refresh token. Xero invalidates the old refresh token on use;
 * losing the race orphans the connection.
 */
export async function refreshWithLock(input: {
  clientId: string;
  clientSecret: string;
}): Promise<TokenRow> {
  const client = serviceClient();
  const lockUntil = new Date(Date.now() + 30_000).toISOString();

  const nowIso = new Date().toISOString();
  const { data: locked, error: lockError } = await client
    .from("xero_oauth_tokens")
    .update({ refresh_lock_until: lockUntil })
    .eq("id", "default")
    .or(`refresh_lock_until.is.null,refresh_lock_until.lt."${nowIso}"`)
    .select("*")
    .maybeSingle();

  if (lockError) throw new Error(lockError.message);

  if (!locked) {
    // Another refresh is in flight. Wait briefly and read the winner's tokens.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const row = await readTokenRow(client);
    if (!row?.access_token) {
      throw new Error("Xero refresh is in progress or the connection was lost.");
    }
    return row;
  }

  const row = locked as TokenRow;
  if (!row.refresh_token) {
    throw new Error("No Xero refresh token stored.");
  }

  try {
    const tokens = await refreshAccessToken({
      refreshToken: row.refresh_token,
      clientId: input.clientId,
      clientSecret: input.clientSecret,
    });
    const tenant =
      (await fetchTenant(tokens.access_token)) ??
      (row.tenant_id
        ? { tenantId: row.tenant_id, tenantName: row.tenant_name ?? "" }
        : null);

    await upsertTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scopes: tokens.scope,
      tenantId: tenant?.tenantId ?? row.tenant_id,
      tenantName: tenant?.tenantName ?? row.tenant_name,
      lastError: null,
    });
    const saved = await readTokenRow(client);
    if (!saved) throw new Error("Tokens were refreshed but could not be re-read.");
    return saved;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    await markDisconnected(message);
    throw error;
  }
}

export function isServiceRoleRequest(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return Boolean(service) && token === service;
}
