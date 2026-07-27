import { SettingsPage } from "@/features/account/components/SettingsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default function SettingsRoutePage() {
  return <SettingsPage />;
}
