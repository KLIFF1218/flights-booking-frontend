import type { Metadata } from "next";
import { MyAccountShell } from "@/features/account/components/MyAccountShell";

export const metadata: Metadata = {
  title: {
    default: "Account — MaxAirline",
    template: "%s — MaxAirline",
  },
};

export default function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MyAccountShell>{children}</MyAccountShell>;
}
