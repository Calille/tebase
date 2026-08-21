/**
 * Shared helpers for Xero Edge Functions.
 * Tokens stay on the server. The browser never sees them.
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export const XERO_AUTHORIZE_URL = "https://login.xero.com/identity/connect/authorize";
export const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";
export const XERO_CONNECTIONS_URL = "https://api.xero.com/connections";

export const XERO_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "accounting.transactions",
  "accounting.contacts",
].join(" ");

export type TokenRow = {
  id: string;
  tenant_id: string | null;
  tenant_name: string | null;
  access_token: string | null;
  refresh_token: string | null;
  access_token_expires_at: string | null;
  refresh_token_expires_at: string | null;
  scopes: string | null;
  last_error: string | null;
  refresh_lock_until: string | null;
  updated_at: string;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function classifyStatus(row: TokenRow | null, now = new Date()): {
  status: "connected" | "expiring" | "disconnected";
} {
  if (!row?.access_token || !row.refresh_token) {
    return { status: "disconnected" };
  }
  if (row.last_error) return { status: "disconnected" };
  if (!row.refresh_token_expires_at) return { status: "disconnected" };
  const refreshAt = new Date(row.refresh_token_expires_at).getTime();
  if (refreshAt <= now.getTime()) return { status: "disconnected" };
  if (refreshAt - now.getTime() < SEVEN_DAYS_MS) return { status: "expiring" };
  return { status: "connected" };
}

export function healthFromRow(row: TokenRow | null, lastError?: string | null) {
  const classified = classifyStatus(row);
  return {
    status: classified.status,
    tenantName: row?.tenant_name ?? null,
    tenantId: row?.tenant_id ?? null,
    accessTokenExpiresAt: row?.access_token_expires_at ?? null,
    refreshTokenExpiresAt: row?.refresh_token_expires_at ?? null,
    lastError: lastError ?? row?.last_error ?? null,
  };
}

export function basicAuthHeader(clientId: string, clientSecret: string): string {
  const raw = `${clientId}:${clientSecret}`;
  return `Basic ${btoa(raw)}`;
}

export async function exchangeCode(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
}> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
  });
  const response = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(input.clientId, input.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const jsonBody = await response.json();
  if (!response.ok) {
    throw new Error(jsonBody.error_description || jsonBody.error || "Token exchange failed");
  }
  return jsonBody;
}

export async function refreshAccessToken(input: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
}> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
  });
  const response = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(input.clientId, input.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const jsonBody = await response.json();
  if (!response.ok) {
    throw new Error(jsonBody.error || "Refresh failed");
  }
  return jsonBody;
}

export async function fetchTenant(
  accessToken: string,
): Promise<{ tenantId: string; tenantName: string } | null> {
  const response = await fetch(XERO_CONNECTIONS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const connections = (await response.json()) as {
    tenantId: string;
    tenantName: string;
  }[];
  const first = connections[0];
  if (!first) return null;
  return { tenantId: first.tenantId, tenantName: first.tenantName };
}
