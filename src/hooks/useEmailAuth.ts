"use client";

import { useState } from "react";
import type { User } from "@/lib/auth-store";
import {
  AuthError,
  loginWithEmail,
  registerWithEmail,
  type AuthCredentials,
} from "@/features/auth/api/auth.api";

export type AuthMode = "login" | "register";

interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
}

function toAuthResult(
  action: () => Promise<User>,
): Promise<AuthResult> {
  return action()
    .then((user) => ({ success: true, user }))
    .catch((error: unknown) => ({
      success: false,
      error:
        error instanceof AuthError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unexpected error during authentication",
    }));
}

export function useEmailAuth() {
  const [loading, setLoading] = useState(false);

  async function login(credentials: AuthCredentials): Promise<AuthResult> {
    setLoading(true);
    try {
      return await toAuthResult(() => loginWithEmail(credentials));
    } finally {
      setLoading(false);
    }
  }

  async function register(credentials: AuthCredentials): Promise<AuthResult> {
    setLoading(true);
    try {
      return await toAuthResult(() => registerWithEmail(credentials));
    } finally {
      setLoading(false);
    }
  }

  return {
    login,
    register,
    loading,
  };
}
