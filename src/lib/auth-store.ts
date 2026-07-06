import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  citizenship?: string;
  city?: string;
  currency?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthorized: boolean;
  authChecked: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setAuthChecked: (checked: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      isAuthorized: false,
      authChecked: false,

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

      setAuthChecked: (checked) => set({ authChecked: checked }),

      logout: () =>
        set({
          accessToken: null,
          user: null,
          isAuthorized: false,
          authChecked: true,
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
