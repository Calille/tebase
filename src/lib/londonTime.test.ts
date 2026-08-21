import { describe, expect, it } from "vitest";
import { isLondonFridayTenAmWindow, londonParts } from "@/lib/londonTime";

describe("isLondonFridayTenAmWindow", () => {
  it("is true at 09:00 UTC on a BST Friday (10:00 London)", () => {
    const at = new Date("2026-08-21T09:05:00.000Z");
    expect(londonParts(at).timeZoneName).toMatch(/BST|GMT\+1/);
    expect(isLondonFridayTenAmWindow(at)).toBe(true);
  });

  it("is false at 10:00 UTC on a BST Friday (11:00 London)", () => {
    const at = new Date("2026-08-21T10:05:00.000Z");
    expect(isLondonFridayTenAmWindow(at)).toBe(false);
  });

  it("is true at 10:00 UTC on a GMT Friday", () => {
    const at = new Date("2026-01-09T10:05:00.000Z");
    expect(isLondonFridayTenAmWindow(at)).toBe(true);
  });
});
