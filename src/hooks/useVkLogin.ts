"use client";

import { useState } from "react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/features/auth/vk/pkce";
import { initVk } from "@/features/auth/vk/vk-init";
import { startVkLogin } from "@/features/auth/vk/vk-login";
import {
  AuthError,
  exchangeVkCode,
  prepareVkState,
} from "@/features/auth/api/auth.api";

type VkLoginResult = {
  code: string;
  device_id: string;
  state: string;
};

export type VkAuthResult = {
  success: boolean;
  error?: string;
};

export function useVkLogin() {
  const [loading, setLoading] = useState(false);

  const login = async (): Promise<VkAuthResult> => {
    try {
      setLoading(true);

      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = crypto.randomUUID();

      await prepareVkState(state);
      initVk(challenge, state);

      const result = await startVkLogin();
      if (!result) {
        return { success: false, error: "VK sign-in was cancelled" };
      }

      const vkResult = result as VkLoginResult;

      if (vkResult.state !== state) {
        return { success: false, error: "VK sign-in state mismatch" };
      }

      await exchangeVkCode({
        code: vkResult.code,
        device_id: vkResult.device_id,
        state: vkResult.state,
        code_verifier: verifier,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof AuthError
            ? error.message
            : error instanceof Error
              ? error.message
              : "VK sign-in failed",
      };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
