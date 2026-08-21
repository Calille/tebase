import { describe, expect, it } from "vitest";
import { DEMO_VIEWER, SKIP_AUTH } from "./authMode";
import { isAdminRole } from "./roles";

describe("temporary auth bypass", () => {
  it("uses a director demo viewer while SKIP_AUTH is on", () => {
    expect(SKIP_AUTH).toBe(true);
    expect(isAdminRole(DEMO_VIEWER.role)).toBe(true);
  });
});
