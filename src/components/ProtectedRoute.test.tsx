import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderAt(path: string, roles?: readonly string[]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={<div>home page</div>} />
        <Route
          path="/it-admin"
          element={
            <ProtectedRoute roles={roles}>
              <div>it admin page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <div>teachers page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("shows a loading spinner while auth is resolving", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    });

    const { container } = renderAt("/teachers");
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(screen.queryByText("teachers page")).toBeNull();
  });

  it("redirects unauthenticated users to login", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    });

    renderAt("/teachers");
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("teachers page")).toBeNull();
  });

  it("renders the protected page when signed in", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "u1",
        email: "alex@example.com",
        role: "user",
      },
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    });

    renderAt("/teachers");
    expect(screen.getByText("teachers page")).toBeInTheDocument();
  });

  it("redirects signed-in users without an allowed role away from IT Admin", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "u1",
        email: "alex@example.com",
        role: "user",
      },
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    });

    renderAt("/it-admin", ["admin", "director"]);
    expect(screen.getByText("home page")).toBeInTheDocument();
    expect(screen.queryByText("it admin page")).toBeNull();
  });

  it("allows admin roles through to IT Admin", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "u1",
        email: "alex@example.com",
        role: "Director",
      },
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    });

    renderAt("/it-admin", ["admin", "director"]);
    expect(screen.getByText("it admin page")).toBeInTheDocument();
  });
});
