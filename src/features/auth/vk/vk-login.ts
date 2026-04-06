'use client';

import * as VKID from '@vkid/sdk';

export async function startVkLogin() {
  return await VKID.Auth.login();
}