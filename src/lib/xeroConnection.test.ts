import { describe, expect, it } from "vitest";
import { classifyXeroConnection } from "@/lib/xeroConnection";

const NOW = new Date("2026-08-21T12:00:00.000Z");

describe("classifyXeroConnection", () => {
  it("is disconnected without tokens, with an error, or with an expired refresh token", () => {
    expect(
      classifyXeroConnection({
        hasTokens: false,
        refreshExpiresAt: null,
        lastError: null,
        now: NOW,
      }),
    ).toBe("disconnected");
    expect(
      classifyXeroConnection({
        hasTokens: true,
        refreshExpiresAt: new Date("2026-10-01T00:00:00.000Z"),
        lastError: "invalid_grant",
        now: NOW,
      }),
    ).toBe("disconnected");
    expect(
      classifyXeroConnection({
        hasTokens: true,
        refreshExpiresAt: new Date("2026-08-01T00:00:00.000Z"),
        lastError: null,
        now: NOW,
      }),
    ).toBe("disconnected");
  });

  it("is expiring when the refresh token has under 7 days left", () => {
    expect(
      classifyXeroConnection({
        hasTokens: true,
        refreshExpiresAt: new Date("2026-08-25T00:00:00.000Z"),
        lastError: null,
        now: NOW,
      }),
    ).toBe("expiring");
  });

  it("is connected when tokens are present and the refresh token is healthy", () => {
    expect(
      classifyXeroConnection({
        hasTokens: true,
        refreshExpiresAt: new Date("2026-10-01T00:00:00.000Z"),
        lastError: null,
        now: NOW,
      }),
    ).toBe("connected");
  });
});
