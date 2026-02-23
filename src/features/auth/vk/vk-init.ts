"use client";

import * as VKID from "@vkid/sdk";

export function initVk(codeChallenge: string, state: string) {
  VKID.Config.init({
    app: Number(process.env.NEXT_PUBLIC_VK_APP_ID),
    redirectUrl: "http://localhost",
    responseMode: VKID.ConfigResponseMode.Callback,
    codeChallenge,
    state,
    scope: "email",
    mode: VKID.ConfigAuthMode.InNewWindow,
  });
}
