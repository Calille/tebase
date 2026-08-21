import { afterEach, describe, expect, it, vi } from "vitest";
import { isAdminRole, ADMIN_ROLES, canViewTeamRollup } from "./roles";

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

describe("canViewTeamRollup", () => {
  it("allows team leaders, admins, and directors", () => {
    expect(canViewTeamRollup("team_leader")).toBe(true);
    expect(canViewTeamRollup("Team Leader")).toBe(true);
    expect(canViewTeamRollup("director")).toBe(true);
    expect(canViewTeamRollup("admin")).toBe(true);
  });

  it("rejects consultants and empty roles", () => {
    expect(canViewTeamRollup("user")).toBe(false);
    expect(canViewTeamRollup("consultant")).toBe(false);
    expect(canViewTeamRollup(undefined)).toBe(false);
  });
});
