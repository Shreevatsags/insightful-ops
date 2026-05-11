import { describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "@/store/auth";

describe("auth logout + refresh tokens", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ user: null, sessionEpoch: 0 });
  });

  it("clears the persisted session from localStorage on logout", () => {
    useAuth.getState().login("a@b.com", "pw");
    expect(JSON.parse(localStorage.getItem("devops-auth")!).state.user).not.toBeNull();

    useAuth.getState().logout();

    expect(useAuth.getState().user).toBeNull();
    expect(JSON.parse(localStorage.getItem("devops-auth")!).state.user).toBeNull();
  });

  it("ignores a pending refresh that resolves after logout (no auto-login)", async () => {
    useAuth.getState().login("a@b.com", "pw");
    const epoch = useAuth.getState().beginRefresh();

    // Simulate a refresh request that resolves later with a fresh user payload.
    const pendingRefresh = new Promise<User>((resolve) =>
      setTimeout(() => resolve({ email: "a@b.com", name: "a", role: "admin" }), 10),
    );

    // User logs out while the refresh is in flight.
    useAuth.getState().logout();
    expect(useAuth.getState().user).toBeNull();

    const refreshed = await pendingRefresh;
    const applied = useAuth.getState().applyRefresh(refreshed, epoch);

    expect(applied).toBe(false);
    expect(useAuth.getState().user).toBeNull();
    expect(JSON.parse(localStorage.getItem("devops-auth")!).state.user).toBeNull();
  });

  it("accepts a refresh that completes before any logout", () => {
    useAuth.getState().login("a@b.com", "pw");
    const epoch = useAuth.getState().beginRefresh();

    const applied = useAuth
      .getState()
      .applyRefresh({ email: "a@b.com", name: "renamed", role: "admin" }, epoch);

    expect(applied).toBe(true);
    expect(useAuth.getState().user?.name).toBe("renamed");
  });
});

type User = { email: string; name: string; role: "admin" | "viewer" };
