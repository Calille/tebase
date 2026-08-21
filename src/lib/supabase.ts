import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export function hasSupabaseConfig(url: string, key: string): boolean {
  return url.startsWith("https://") && key.length > 10;
}

export const isSupabaseConfigured = hasSupabaseConfig(
  supabaseUrl,
  supabaseAnonKey
);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://unavailable.invalid",
  isSupabaseConfigured ? supabaseAnonKey : "unconfigured-anon-key"
);
