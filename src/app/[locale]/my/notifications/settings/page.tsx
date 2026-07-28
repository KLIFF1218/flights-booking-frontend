import { NotificationSettingsPageClient } from "./NotificationSettingsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification settings",
};

export default function NotificationSettingsRoutePage() {
  return <NotificationSettingsPageClient />;
}
