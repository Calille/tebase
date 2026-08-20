/** Staff roles that can open IT Administration. */
export const ADMIN_ROLES = ["admin", "director"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalised = role.trim().toLowerCase();
  return (ADMIN_ROLES as readonly string[]).includes(normalised);
}
