import { describe, expect, it } from "vitest";
import {
  classifyMainpayConnection,
  DISCONNECTED_MAINPAY,
} from "@/lib/mainpayConnection";

describe("classifyMainpayConnection", () => {
  it("is disconnected with no session flag", () => {
    expect(classifyMainpayConnection({ sessionConnectedAt: null })).toEqual(
      DISCONNECTED_MAINPAY,
    );
  });

  it("is a demo connected state when the session flag is set", () => {
    const health = classifyMainpayConnection({
      sessionConnectedAt: "2026-08-21T12:00:00.000Z",
    });
    expect(health.status).toBe("connected");
    expect(health.demo).toBe(true);
    expect(health.connectedAt).toBe("2026-08-21T12:00:00.000Z");
  });
});
