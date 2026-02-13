import { Suspense } from "react";
import { VkIdClient } from "./vk-id.client";

export default function VkIdPage() {
  return (
    <Suspense fallback={<p>Авторизация через VK…</p>}>
      <VkIdClient />
    </Suspense>
  );
}
