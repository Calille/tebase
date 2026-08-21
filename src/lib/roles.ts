/** Staff roles that can open IT Administration. */
export const ADMIN_ROLES = ["admin", "director"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalised = role.trim().toLowerCase();
  return (ADMIN_ROLES as readonly string[]).includes(normalised);
}

/**
 * Roles that may see other consultants’ weekly figures.
 *
 * ASSUMPTION: team_leader, admin, and director. Signup still creates `user`.
 * Confirm the real role names with Keep Education.
 */
export const TEAM_ROLLUP_ROLES = [
  "team_leader",
  "team-leader",
  "teamleader",
  "admin",
  "director",
] as const;

export function canViewTeamRollup(role?: string | null): boolean {
  if (!role) return false;
  const normalised = role.trim().toLowerCase().replace(/\s+/g, "_");
  return (TEAM_ROLLUP_ROLES as readonly string[]).includes(normalised);
}
