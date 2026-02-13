"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export function VkIdClient() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const deviceId = params.get("device_id");

    const savedState = sessionStorage.getItem("vk_state");
    const codeVerifier = sessionStorage.getItem("vk_code_verifier");

    if (!code || !state || state !== savedState || !codeVerifier) {
      return;
    }

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/vk`,
        {
          code,
          codeVerifier,
          deviceId,
        },
        {
          withCredentials: true,
        },
      )
      .then(() => {
        router.replace("/");
      })
      .catch((err) => {
        console.error("VK auth failed", err);
      });
  }, [params, router]);

  return <p>Авторизация через VK…</p>;
}

