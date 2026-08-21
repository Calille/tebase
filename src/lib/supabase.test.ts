import { describe, expect, it } from "vitest";
import { hasSupabaseConfig } from "./supabase";

describe("hasSupabaseConfig", () => {
  it("accepts an https URL and a non-empty anon key", () => {
    expect(
      hasSupabaseConfig("https://example.supabase.co", "public-anon-key")
    ).toBe(true);
  });

  it("rejects missing or non-https values", () => {
    expect(hasSupabaseConfig("", "public-anon-key")).toBe(false);
    expect(hasSupabaseConfig("http://example.supabase.co", "public-anon-key")).toBe(
      false
    );
    expect(hasSupabaseConfig("https://example.supabase.co", "short")).toBe(false);
  });
});
