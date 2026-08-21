export type MainpayConnectionStatus = "connected" | "disconnected";

export interface MainpayConnectionHealth {
  status: MainpayConnectionStatus;
  connectedAt: string | null;
  /** True when the session marked itself connected without a live API. */
  demo: boolean;
  lastError: string | null;
}

export const DISCONNECTED_MAINPAY: MainpayConnectionHealth = {
  status: "disconnected",
  connectedAt: null,
  demo: false,
  lastError: null,
};

/**
 * Live Mainpay API is not wired. A session can mark itself connected for UI
 * testing; that is never a real token and never leaves this browser.
 */
export function classifyMainpayConnection(input: {
  sessionConnectedAt: string | null;
}): MainpayConnectionHealth {
  if (!input.sessionConnectedAt) return { ...DISCONNECTED_MAINPAY };
  return {
    status: "connected",
    connectedAt: input.sessionConnectedAt,
    demo: true,
    lastError: null,
  };
}
