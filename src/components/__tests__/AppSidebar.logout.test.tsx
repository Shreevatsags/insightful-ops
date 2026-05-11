import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppSidebar } from "../AppSidebar";
import { useAuth } from "@/store/auth";
import { SidebarProvider } from "@/components/ui/sidebar";

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useRouterState: () => "/dashboard",
  useNavigate: () => navigateMock,
}));

describe("AppSidebar logout", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useAuth.setState({
      user: { email: "a@b.com", name: "tester", role: "admin" },
    });
  });

  it("clears the session and redirects to /login when logout is clicked", async () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(useAuth.getState().user).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
  });

  it("always navigates to /login even when called repeatedly", async () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    const btn = screen.getByRole("button", { name: /log out/i });
    await userEvent.click(btn);
    await userEvent.click(btn);

    for (const call of navigateMock.mock.calls) {
      expect(call[0]).toEqual({ to: "/login" });
    }
    expect(useAuth.getState().user).toBeNull();
  });
});
