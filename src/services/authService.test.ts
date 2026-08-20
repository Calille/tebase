import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, signInWithPassword, getUser } = vi.hoisted(() => ({
  from: vi.fn(),
  signInWithPassword: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser,
      signInWithPassword,
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from,
  },
}));

import { authService } from "@/services/authService";

describe("authService", () => {
  beforeEach(() => {
    from.mockReset();
    signInWithPassword.mockReset();
    getUser.mockReset();
  });

  it("looks up email by username before signing in", async () => {
    from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { email: "alex@keepeducation.com" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                username: "alex",
                name: "Alex",
                role: "user",
                avatar_url: null,
              },
              error: null,
            }),
          }),
        }),
      });

    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "u1", email: "alex@keepeducation.com" },
      },
      error: null,
    });

    const result = await authService.signIn("alex", "secret");

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "alex@keepeducation.com",
      password: "secret",
    });
    expect(result.error).toBeNull();
    expect(result.user?.email).toBe("alex@keepeducation.com");
  });

  it("returns username not found without calling signInWithPassword", async () => {
    from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "not found" },
          }),
        }),
      }),
    });

    const result = await authService.signIn("missing", "secret");

    expect(result).toEqual({ user: null, error: "Username not found" });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("does not send role when updating a profile", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    from.mockReturnValue({
      update,
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              username: "alex",
              name: "Alex",
              role: "user",
              avatar_url: null,
            },
            error: null,
          }),
        }),
      }),
    });

    getUser.mockResolvedValue({
      data: {
        user: { id: "u1", email: "alex@keepeducation.com" },
      },
      error: null,
    });

    await authService.updateProfile("u1", {
      name: "Alex",
      role: "admin",
    });

    expect(update).toHaveBeenCalled();
    const payload = update.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("role");
    expect(payload.name).toBe("Alex");
  });
});
