import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";

const navigate = vi.fn();
const signIn = vi.fn();
const signUp = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn,
    signUp,
    error: "stale error from a previous render",
    loading: false,
  }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    navigate.mockReset();
    signIn.mockReset();
    signUp.mockReset();
  });

  it("does not navigate when signIn returns an error", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ error: "Invalid login credentials" });
    renderLogin();

    await user.type(document.getElementById("username") as HTMLInputElement, "alex");
    await user.type(document.getElementById("password") as HTMLInputElement, "wrong-password");
    await user.click(screen.getAllByRole("button", { name: /^sign in$/i })[0]);

    expect(signIn).toHaveBeenCalledWith("alex", "wrong-password");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("navigates home when signIn succeeds even if context still has a stale error", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ error: null });
    renderLogin();

    await user.type(document.getElementById("username") as HTMLInputElement, "alex");
    await user.type(document.getElementById("password") as HTMLInputElement, "secret");
    await user.click(screen.getAllByRole("button", { name: /^sign in$/i })[0]);

    expect(navigate).toHaveBeenCalledWith("/");
  });
});
