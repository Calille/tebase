import type { User } from "@/services/authService";

/**
 * Temporary viewing mode: skip the login screen and open the app.
 * Set to false to restore Supabase sign-in.
 */
export const SKIP_AUTH = true;

export const DEMO_VIEWER: User = {
  id: "demo-viewer",
  email: "demo@tebase.local",
  username: "demo",
  name: "Demo Viewer",
  role: "director",
};
