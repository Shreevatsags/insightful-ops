import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = { email: string; name: string; role: "admin" | "viewer" };

type AuthState = {
  user: User | null;
  /** Incremented on every logout. Used to invalidate in-flight refresh calls. */
  sessionEpoch: number;
  login: (email: string, _password: string) => void;
  register: (name: string, email: string, _password: string) => void;
  logout: () => void;
  /**
   * Apply the result of a token refresh. If `epoch` does not match the current
   * session epoch (because the user logged out after the refresh started), the
   * result is discarded and no auto-login occurs.
   */
  applyRefresh: (user: User, epoch: number) => boolean;
  /** Snapshot the current epoch before kicking off an async refresh. */
  beginRefresh: () => number;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionEpoch: 0,
      login: (email) =>
        set({ user: { email, name: email.split("@")[0], role: "admin" } }),
      register: (name, email) =>
        set({ user: { email, name, role: "admin" } }),
      logout: () =>
        set((s) => ({ user: null, sessionEpoch: s.sessionEpoch + 1 })),
      beginRefresh: () => get().sessionEpoch,
      applyRefresh: (user, epoch) => {
        if (get().sessionEpoch !== epoch) return false;
        set({ user });
        return true;
      },
    }),
    { name: "devops-auth" },
  ),
);
