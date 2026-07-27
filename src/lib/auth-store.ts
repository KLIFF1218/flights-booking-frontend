import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  setAuthSessionCookies,
  clearAuthSessionCookies,
  type UserRole,
} from "@/shared/auth/session-cookie";

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
  role?: UserRole;
  emailVerifiedAt?: string | null;
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

function syncSessionCookies(
  accessToken: string | null,
  role?: UserRole,
): void {
  if (typeof window === "undefined") return;

  if (accessToken) {
    setAuthSessionCookies(role);
    return;
  }

  clearAuthSessionCookies();
}

/**
 * Access token is memory-only (not persisted) to shrink XSS blast radius.
 * Session continuity relies on the HttpOnly refresh cookie + silent refresh.
 * Only the user profile snapshot is persisted for UX hydration hints.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      isAuthorized: false,
      authChecked: false,

      setToken: (token) => {
        syncSessionCookies(token, get().user?.role);

        set({
          accessToken: token,
          isAuthorized: token !== null || get().user !== null,
        });
      },

      setUser: (user) => {
        if (get().accessToken) {
          syncSessionCookies(get().accessToken, user?.role);
        }

        set({
          user,
          isAuthorized: user !== null || get().accessToken !== null,
        });
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      setAuthChecked: (checked) => set({ authChecked: checked }),

      logout: () => {
        clearAuthSessionCookies();

        set({
          accessToken: null,
          user: null,
          isAuthorized: false,
          authChecked: true,
        });
      },
    }),
    {
      name: "auth-storage",
      // Persist only non-sensitive hydration hints — full profile is loaded via /users/me.
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              role: state.user.role,
              emailVerifiedAt: state.user.emailVerifiedAt ?? null,
            }
          : null,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Access token is never rehydrated; AuthInitializer restores via refresh cookie.
        state.accessToken = null;
        state.isAuthorized = Boolean(state.user);
      },
    },
  ),
);
