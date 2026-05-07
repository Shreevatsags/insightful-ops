import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = { email: string; name: string; role: "admin" | "viewer" };

type AuthState = {
  user: User | null;
  login: (email: string, _password: string) => void;
  register: (name: string, email: string, _password: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email) =>
        set({ user: { email, name: email.split("@")[0], role: "admin" } }),
      register: (name, email) =>
        set({ user: { email, name, role: "admin" } }),
      logout: () => set({ user: null }),
    }),
    { name: "devops-auth" }
  )
);
