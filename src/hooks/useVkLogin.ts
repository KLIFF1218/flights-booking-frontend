"use client";

import { useState } from "react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/features/auth/vk/pkce";
import { initVk } from "@/features/auth/vk/vk-init";
import { startVkLogin } from "@/features/auth/vk/vk-login";
import { buildApiUrl } from "@/shared/api/buildApiUrl";
import { setAccessToken, getAccessToken } from "@/shared/api/apiClient";

type User = {
  id: string;
  email: string;
  firstName?: string;
};

type VkLoginResult = {
  code: string;
  device_id: string;
  state: string;
};

type VkExchangeResponse = {
  accessToken: string;
  accessMaxAge: number;
};

export function useVkLogin() {
  const [loading, setLoading] = useState(false);

  const login = async (): Promise<User | null> => {
    try {
      setLoading(true);

      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = crypto.randomUUID();

      initVk(challenge, state);

      const result = await startVkLogin();
      if (!result) return null;

      const exchangeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/vk/exchange`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            code: (result as VkLoginResult).code,
            device_id: (result as VkLoginResult).device_id,
            state: (result as VkLoginResult).state,
            code_verifier: verifier,
          }),
        },
      );

      if (!exchangeResponse.ok) throw new Error("VK exchange failed");

      const exchangeData =
        (await exchangeResponse.json()) as VkExchangeResponse;
      if (exchangeData.accessToken) {
        setAccessToken(exchangeData.accessToken);
      }

      try {
        const userResponse = await fetch(buildApiUrl("/users/me"), {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${getAccessToken() || ""}`,
          },
        });

        if (userResponse.ok) {
          const user = await userResponse.json();
          return user;
        }
      } catch (error) {
        console.warn(
          "Failed to fetch user profile, but auth succeeded:",
          error,
        );
      }

      return {
        id: "unknown",
        email: "user@vk",
        firstName: "VK User",
      };
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
