import { afterEach, describe, expect, it, vi } from "vitest";
import { isAdminRole, ADMIN_ROLES } from "./roles";

describe("isAdminRole", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("treats admin and director as admin-capable", () => {
    expect(ADMIN_ROLES).toEqual(["admin", "director"]);
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("Director")).toBe(true);
  });

  it("rejects empty, user, and unknown roles", () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole("consultant")).toBe(false);
  });
});
