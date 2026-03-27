import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthorized: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      isAuthorized: false,

      setToken: (token) =>
        set({
          accessToken: token,
          isAuthorized: token !== null,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthorized: user !== null,
        }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set({
          accessToken: null,
          user: null,
          isAuthorized: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const authorized = Boolean(state.accessToken || state.user);
          state.isAuthorized = authorized;
        }
      },
    },
  ),
);
