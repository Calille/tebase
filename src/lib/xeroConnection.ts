import type { XeroConnectionStatus } from "@/types/xero";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Connection health from stored token metadata — never from a guessed
 * "looks fine" default. No tokens or a refresh that can no longer run
 * is disconnected. Refresh due within 7 days is expiring (re-authorise).
 */
export function classifyXeroConnection(input: {
  hasTokens: boolean;
  refreshExpiresAt: Date | null;
  lastError: string | null;
  now?: Date;
}): XeroConnectionStatus {
  const now = input.now ?? new Date();
  if (!input.hasTokens) return "disconnected";
  if (input.lastError) return "disconnected";
  if (!input.refreshExpiresAt) return "disconnected";
  if (input.refreshExpiresAt.getTime() <= now.getTime()) return "disconnected";
  if (input.refreshExpiresAt.getTime() - now.getTime() < SEVEN_DAYS_MS) {
    return "expiring";
  }
  return "connected";
}
