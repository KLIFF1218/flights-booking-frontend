"use client";

import { useState } from "react";
import { useAuthStore, type User } from "@/lib/auth-store";
import { buildApiUrl } from "@/shared/api/buildApiUrl";
import { setAccessToken } from "@/shared/api/apiClient";

export type AuthMode = "login" | "register";

interface AuthCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
}

export function useEmailAuth() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  async function authenticate(
    endpoint: "/auth/login" | "/auth/register",
    payload: AuthCredentials,
  ): Promise<AuthResult> {
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: Record<string, unknown> = {};

      if (text) {
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const message =
          (data.message as string | undefined) ||
          (data.error as string | undefined) ||
          "Authentication failed";

        return {
          success: false,
          error: message,
        };
      }

      const accessToken = data.accessToken as string | undefined;

      if (!accessToken) {
        return {
          success: false,
          error: "No access token received from server",
        };
      }

      setAccessToken(accessToken);

      let user: User | null = null;

      try {
        const meResponse = await fetch(buildApiUrl("/users/me"), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (meResponse.ok) {
          const meData = (await meResponse.json()) as User;
          user = meData;
        }
      } catch {
        user = null;
      }

      const fallbackUser: User = {
        id: "unknown",
        email: payload.email,
        firstName: payload.firstName || payload.email.split("@")[0],
        lastName: payload.lastName,
      };

      setUser(user ?? fallbackUser);

      return {
        success: true,
        user: user ?? fallbackUser,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error during authentication",
      };
    } finally {
      setLoading(false);
    }
  }

  const login = async (credentials: AuthCredentials) => {
    return authenticate("/auth/login", credentials);
  };

  const register = async (credentials: AuthCredentials) => {
    return authenticate("/auth/register", credentials);
  };

  return {
    login,
    register,
    loading,
  };
}
