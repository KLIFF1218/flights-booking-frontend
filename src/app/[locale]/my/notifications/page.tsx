import { NotificationsPageClient } from "./NotificationsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsRoutePage() {
  return <NotificationsPageClient />;
}
