"use client";

import { useState } from "react";
import { generateCodeVerifier, generateCodeChallenge } from "@/features/auth/vk/pkce";
import { initVk } from "@/features/auth/vk/vk-init";
import { startVkLogin } from "@/features/auth/vk/vk-login";

export function VkLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = crypto.randomUUID();

    initVk(challenge, state);

    const result = await startVkLogin();

    if (!result) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vk/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        code: result.code,
        device_id: result.device_id,
        state: result.state,
        code_verifier: verifier,
      }),
    });

    setLoading(false);
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      Войти через VK
    </button>
  );
}
